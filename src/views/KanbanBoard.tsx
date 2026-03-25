import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Status } from '../types';
import { KanbanColumn } from '../components/KanbanColumn';
import { useDragAndDrop } from '../hooks/useDragAndDrop';

export function KanbanBoard() {
  useDragAndDrop();
  const { tasks, filters } = useStore();

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filters.status.length > 0 && !filters.status.includes(task.status)) return false;
      if (filters.priority.length > 0 && !filters.priority.includes(task.priority)) return false;
      if (filters.assignee.length > 0 && !filters.assignee.includes(task.assignee.id)) return false;
      
      if (filters.dateFrom && task.dueDate < filters.dateFrom) return false;
      if (filters.dateTo && task.dueDate > filters.dateTo) return false;
      
      return true;
    });
  }, [tasks, filters]);

  const columns = Object.values(Status).map((status) => ({
    status,
    tasks: filteredTasks.filter((task) => task.status === status),
  }));

  return (
    <div className="flex-1 h-full overflow-x-auto overflow-y-hidden p-6">
      <div className="flex h-full gap-6 items-start">
        {columns.map(({ status, tasks }) => (
          <KanbanColumn key={status} status={status} tasks={tasks} />
        ))}
      </div>
    </div>
  );
}
