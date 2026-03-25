import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { Status } from '../types';

export function useDragAndDrop() {
  const updateTaskStatus = useStore((state) => state.updateTaskStatus);
  const isDragging = useRef(false);

  // References for drag state
  const dragState = useRef<{
    originalCard: HTMLElement | null;
    ghostCard: HTMLElement | null;
    placeholder: HTMLElement | null;
    sourceColumnId: Status | null;
    taskId: string | null;
    offsetX: number;
    offsetY: number;
    originalRect: DOMRect | null;
    hoveredColumn: HTMLElement | null;
  }>({
    originalCard: null,
    ghostCard: null,
    placeholder: null,
    sourceColumnId: null,
    taskId: null,
    offsetX: 0,
    offsetY: 0,
    originalRect: null,
    hoveredColumn: null,
  });

  useEffect(() => {
    // Add CSS rule for touch-action to prevent scrolling while dragging cards
    const style = document.createElement('style');
    style.innerHTML = `[data-task-id] { touch-action: none; }`;
    document.head.appendChild(style);

    const cleanupHover = () => {
      if (dragState.current.hoveredColumn) {
        dragState.current.hoveredColumn.classList.remove('bg-blue-50', 'ring-2', 'ring-blue-400');
        dragState.current.hoveredColumn = null;
      }
    };

    const cleanupDOM = () => {
      const state = dragState.current;
      if (state.ghostCard && state.ghostCard.parentNode) {
        document.body.removeChild(state.ghostCard);
      }
      if (state.placeholder && state.placeholder.parentNode) {
        state.placeholder.parentNode.removeChild(state.placeholder);
      }
      if (state.originalCard) {
        state.originalCard.classList.remove('opacity-0', 'pointer-events-none');
      }
      cleanupHover();
      document.body.style.cursor = '';
      
      dragState.current = {
        originalCard: null,
        ghostCard: null,
        placeholder: null,
        sourceColumnId: null,
        taskId: null,
        offsetX: 0,
        offsetY: 0,
        originalRect: null,
        hoveredColumn: null,
      };
      isDragging.current = false;
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return; // Only left click

      const target = e.target as HTMLElement;
      
      // Don't drag if clicking buttons or links inside the card
      if (target.closest('button, a, input, select')) return;

      const card = target.closest('[data-task-id]') as HTMLElement | null;
      if (!card) return;

      const column = card.closest('[data-column-id]') as HTMLElement | null;
      if (!column) return;

      e.preventDefault(); // Stop text selection

      isDragging.current = true;
      const rect = card.getBoundingClientRect();
      const taskId = card.getAttribute('data-task-id')!;
      const sourceColumnId = column.getAttribute('data-column-id') as Status;

      // Ensure we capture pointer events even if moving fast
      card.setPointerCapture(e.pointerId);

      // Create ghost element
      const ghost = card.cloneNode(true) as HTMLElement;
      ghost.style.position = 'fixed';
      ghost.style.top = '0';
      ghost.style.left = '0';
      ghost.style.width = `${rect.width}px`;
      ghost.style.height = `${rect.height}px`;
      ghost.style.zIndex = '9999';
      ghost.style.opacity = '0.9';
      ghost.style.transform = `translate(${rect.left}px, ${rect.top}px) rotate(2deg)`;
      ghost.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
      ghost.style.pointerEvents = 'none'; // Critical so elementFromPoint sees the column underneath
      ghost.style.cursor = 'grabbing';
      ghost.style.transition = 'transform 0.05s linear'; // Smooth dragging

      // Create placeholder
      const placeholder = document.createElement('div');
      placeholder.style.height = `${rect.height}px`;
      placeholder.style.width = '100%';
      placeholder.style.flexShrink = '0';
      placeholder.style.marginBottom = '0.75rem'; // Match mb-3
      placeholder.className = 'border-2 border-dashed border-gray-300 rounded-lg bg-gray-50/50';

      // Hide original, insert placeholder
      card.classList.add('opacity-0', 'pointer-events-none');
      card.parentNode?.insertBefore(placeholder, card);

      document.body.appendChild(ghost);
      document.body.style.cursor = 'grabbing';

      dragState.current = {
        originalCard: card,
        ghostCard: ghost,
        placeholder,
        sourceColumnId,
        taskId,
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top,
        originalRect: rect,
        hoveredColumn: null,
      };
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      
      const state = dragState.current;
      if (!state.ghostCard || !state.originalCard) return;

      // Only move if we've dragged a few pixels (to distinguish from click)
      // We skip thresholding here since mousedown already triggered it

      const x = e.clientX - state.offsetX;
      const y = e.clientY - state.offsetY;
      
      // Use will-change for performance, update transform instead of top/left
      state.ghostCard.style.transform = `translate(${x}px, ${y}px) rotate(3deg)`;

      // Determine drop target
      // Since ghost has pointer-events: none, elementFromPoint gets the element underneath
      const elementUnderCursor = document.elementFromPoint(e.clientX, e.clientY);
      const hoveredCol = elementUnderCursor?.closest('[data-column-id]') as HTMLElement | null;

      if (hoveredCol !== state.hoveredColumn) {
        cleanupHover();
        
        if (hoveredCol) {
          hoveredCol.classList.add('bg-blue-50', 'ring-2', 'ring-blue-400');
          state.hoveredColumn = hoveredCol;
          
          // Move placeholder to this column visually (optional enhancement)
          // For simplicity, we keep placeholder in original spot per requirements 
          // ("original position must show a placeholder")
        }
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!isDragging.current) return;
      const state = dragState.current;
      
      if (!state.ghostCard || !state.taskId || !state.originalRect || !state.originalCard) {
        cleanupDOM();
        return;
      }

      state.originalCard.releasePointerCapture(e.pointerId);
      cleanupHover();

      const elementUnderCursor = document.elementFromPoint(e.clientX, e.clientY);
      const droppedCol = elementUnderCursor?.closest('[data-column-id]') as HTMLElement | null;
      
      const targetColumnId = droppedCol?.getAttribute('data-column-id') as Status | undefined;

      if (targetColumnId && targetColumnId !== state.sourceColumnId) {
        // Valid drop to new column
        updateTaskStatus(state.taskId, targetColumnId);
        cleanupDOM(); // Zustand will re-render and remove the originalCard from DOM anyway
      } else {
        // Snap back to original position
        const { left, top } = state.originalRect;
        state.ghostCard.style.transition = 'transform 0.3s cubic-bezier(0.2, 1, 0.1, 1)';
        state.ghostCard.style.transform = `translate(${left}px, ${top}px) rotate(0deg)`;
        
        state.ghostCard.addEventListener('transitionend', () => {
          cleanupDOM();
        }, { once: true });
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('pointercancel', handlePointerUp);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('pointercancel', handlePointerUp);
      document.head.removeChild(style);
      cleanupDOM(); // ensure on unmount
    };
  }, [updateTaskStatus]);
}
