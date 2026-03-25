import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';

export function CollabOverlay() {
  const collaborators = useStore(state => state.collaborators);
  const containerRef = useRef<HTMLDivElement>(null);
  const avatarRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    let rafId: number;

    const tick = () => {
      const byTask: Record<string, typeof collaborators> = {};
      collaborators.forEach(c => {
        if (c.currentTaskId) {
          if (!byTask[c.currentTaskId]) byTask[c.currentTaskId] = [];
          byTask[c.currentTaskId].push(c);
        }
      });

      collaborators.forEach((user) => {
        const avatarEl = avatarRefs.current[user.id];
        if (!avatarEl) return;

        let targetX = 0;
        let targetY = 0;
        let scale = 0;
        let opacity = 0;
        let zIndex = 50;

        if (user.currentTaskId) {
          const anchor = document.querySelector(`[data-collab-anchor="${user.currentTaskId}"]`);
          if (anchor) {
            const rect = anchor.getBoundingClientRect();
            const group = byTask[user.currentTaskId];
            const index = group.findIndex(c => c.id === user.id);

            if (index < 2) {
              targetX = rect.left + index * 12; // 12px horizontal overlap
              targetY = rect.top;
              scale = 1;
              opacity = 1;
              zIndex = 50 - index;
            } else {
              targetX = rect.left + 24;
              targetY = rect.top;
              scale = 0; // hide behind +N badge
              opacity = 0;
            }
          }
        }

        avatarEl.style.transform = `translate(${targetX}px, ${targetY}px) scale(${scale})`;
        avatarEl.style.opacity = opacity.toString();
        avatarEl.style.zIndex = zIndex.toString();
      });

      rafId = requestAnimationFrame(tick);
    };

    tick();
    return () => cancelAnimationFrame(rafId);
  }, [collaborators]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100]" ref={containerRef}>
      {collaborators.map(user => (
        <div
          key={user.id}
          ref={el => (avatarRefs.current[user.id] = el)}
          className={`absolute top-0 left-0 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] origin-center ${user.avatarColor}`}
          style={{ willChange: 'transform, opacity', opacity: 0, transform: 'scale(0)' }}
        >
          {user.name.split(' ').map(n => n[0]).join('')}
        </div>
      ))}
    </div>
  );
}
