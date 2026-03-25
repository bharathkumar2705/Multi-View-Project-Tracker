import { Task, Priority } from '../types';
import { useStore } from '../store/useStore';
import { differenceInDays, startOfDay, isToday } from 'date-fns';
import { Calendar } from 'lucide-react';

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const collaborators = useStore(state => 
    state.collaborators.filter(c => c.currentTaskId === task.id)
  );

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.Critical: return 'bg-red-100 text-red-800 border-red-200';
      case Priority.High: return 'bg-orange-100 text-orange-800 border-orange-200';
      case Priority.Medium: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case Priority.Low: return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderDueDate = () => {
    const today = startOfDay(new Date());
    const dueDate = new Date(task.dueDate);
    
    if (isToday(dueDate)) {
      return <span className="text-orange-600 font-medium flex items-center gap-1"><Calendar size={12} /> Due Today</span>;
    }
    
    const overdueDays = differenceInDays(today, dueDate);
    if (overdueDays > 7) {
      return <span className="text-red-600 font-bold flex items-center gap-1"><Calendar size={12} /> {overdueDays} days overdue</span>;
    } else if (overdueDays > 0) {
      return <span className="text-red-500 font-medium flex items-center gap-1"><Calendar size={12} /> Overdue</span>;
    }

    return <span className="text-gray-500 flex items-center gap-1"><Calendar size={12} /> {task.dueDate}</span>;
  };

  return (
    <div 
      className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing mb-3"
      data-task-id={task.id}
    >
      <div className="flex justify-between items-start mb-2">
        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
        <div className="flex items-center min-h-[24px]">
          <div className="w-[42px] h-6 flex relative shrink-0" data-collab-anchor={task.id}>
            {collaborators.length > 2 && (
              <div className="absolute left-[24px] w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-600 bg-gray-100 z-10">
                +{collaborators.length - 2}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <h4 className="text-sm font-medium text-gray-900 leading-snug mb-3">
        {task.title}
      </h4>
      
      <div className="flex justify-between items-center mt-auto">
        <div 
          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium text-white shadow-sm ${task.assignee.avatarColor}`}
          title={`Assigned to ${task.assignee.name}`}
        >
          {task.assignee.name.split(' ').map(n => n[0]).join('')}
        </div>
        
        <div className="text-xs">
          {renderDueDate()}
        </div>
      </div>
    </div>
  );
}
