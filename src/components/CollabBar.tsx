import { useStore } from '../store/useStore';

export function CollabBar() {
  const collaborators = useStore((state) => state.collaborators);
  const activeViewers = collaborators.filter(c => c.currentTaskId !== null);
  const activeCount = activeViewers.length;

  if (activeCount === 0) return null;

  return (
    <div className="flex items-center gap-3 bg-white px-4 py-2 border-b border-gray-200">
      <div className="flex -space-x-2">
        {activeViewers.map((user) => (
          <div
            key={user.id}
            className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium text-white ${user.avatarColor}`}
            title={user.name}
          >
            {user.name.split(' ').map((n) => n[0]).join('')}
          </div>
        ))}
      </div>
      <span className="text-sm text-gray-600 font-medium tracking-tight">
        {activeCount} {activeCount === 1 ? 'person is' : 'people are'} viewing this board
      </span>
    </div>
  );
}
