import { Task, Status } from '../types';
import { TaskCard } from './TaskCard';
import { Inbox } from 'lucide-react';

interface KanbanColumnProps {
  status: Status;
  tasks: Task[];
}

export function KanbanColumn({ status, tasks }: KanbanColumnProps) {
  return (
    <div className="flex flex-col flex-shrink-0 w-80 bg-gray-50 rounded-lg max-h-full" data-column-id={status}>
      {/* Column Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-200/60 shrink-0">
        <h3 className="font-semibold text-gray-700">{status}</h3>
        <span className="bg-gray-200 text-gray-600 text-xs font-semibold px-2 py-1 rounded-full">
          {tasks.length}
        </span>
      </div>

      {/* Task List (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-3 min-h-[150px]">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))
        ) : (
          <div className="h-full min-h-[200px] border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400 gap-2">
            <Inbox size={24} className="text-gray-300" />
            <span className="text-sm">No tasks</span>
          </div>
        )}
      </div>
    </div>
  );
}
