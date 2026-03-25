import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Priority, Task } from '../types';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isToday, differenceInDays } from 'date-fns';

export function TimelineView() {
  const { tasks, filters } = useStore();

  const processedTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filters.status.length > 0 && !filters.status.includes(task.status)) return false;
      if (filters.priority.length > 0 && !filters.priority.includes(task.priority)) return false;
      if (filters.assignee.length > 0 && !filters.assignee.includes(task.assignee.id)) return false;
      if (filters.dateFrom && task.dueDate < filters.dateFrom) return false;
      if (filters.dateTo && task.dueDate > filters.dateTo) return false;
      return true;
    });
  }, [tasks, filters]);

  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const DAY_WIDTH = 40; // 40px per day
  const SIDEBAR_WIDTH = 250; 

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.Critical: return 'bg-red-500';
      case Priority.High: return 'bg-orange-500';
      case Priority.Medium: return 'bg-yellow-500';
      case Priority.Low: return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const renderTaskBar = (task: Task) => {
    const taskEnd = new Date(task.dueDate);
    const taskStart = task.startDate ? new Date(task.startDate) : taskEnd;

    // Calculate left position (offset from start of month)
    const offsetDays = differenceInDays(taskStart, monthStart);
    // Calculate width (days diff + 1 to be inclusive)
    const durationDays = differenceInDays(taskEnd, taskStart) + 1;

    // Constrain visually to month boundary if task spills outside
    const startOffset = Math.max(0, offsetDays);
    
    // If entire task is before month starts, or after month ends, hide it
    if (offsetDays + durationDays < 0 || offsetDays > daysInMonth.length) {
       // Only render task name in sidebar
       return null;
    }

    const visualDuration = Math.min(
      durationDays - (startOffset - offsetDays), // minus anything chopped off the start
      daysInMonth.length - startOffset // max remaining days in month
    );
    
    if (visualDuration <= 0) return null;

    const left = startOffset * DAY_WIDTH;
    const width = visualDuration * DAY_WIDTH;
    const isSingleDay = !task.startDate;

    return (
      <div 
        className={`absolute top-2 h-6 rounded-md shadow-sm opacity-90 hover:opacity-100 cursor-pointer transition-opacity z-10 flex items-center px-2 text-[10px] font-bold text-white overflow-hidden ${getPriorityColor(task.priority)}`}
        style={{ left: `${left + 2}px`, width: `${width - 4}px` }}
        title={`${task.title} (${task.startDate || task.dueDate} to ${task.dueDate})`}
      >
        {isSingleDay ? '⭐' : task.title}
      </div>
    );
  };

  return (
    <div className="flex flex-1 min-h-0 bg-white m-6 rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Sidebar: Task List */}
      <div 
        className="flex-shrink-0 border-r border-gray-200 bg-gray-50 flex flex-col z-20"
        style={{ width: `${SIDEBAR_WIDTH}px` }}
      >
        <div className="h-12 border-b border-gray-200 bg-gray-100 flex items-center px-4 font-semibold text-sm text-gray-700">
          Tasks
        </div>
        <div className="flex-1 overflow-y-hidden"> {/* Scroll synced automatically if needed, but here simple overflow matches row height */}
          {processedTasks.map((task) => (
            <div 
              key={task.id} 
              className="h-10 border-b border-gray-100 px-4 flex items-center bg-white hover:bg-gray-50 flex-shrink-0"
              style={{ position: 'relative' }} // Top could be calculated for virtualization if lists get too big here
            >
              <div className="truncate text-sm text-gray-700 font-medium" title={task.title}>
                {task.title}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Grid (Scrollable horizontally and vertically) */}
      <div className="flex-1 overflow-auto bg-white relative">
        <div style={{ width: `${daysInMonth.length * DAY_WIDTH}px` }}>
          {/* Timeline Header */}
          <div className="h-12 border-b border-gray-200 bg-gray-50 flex sticky top-0 z-30">
            {daysInMonth.map((day, i) => (
              <div 
                key={i} 
                className={`h-full border-r border-gray-100 flex flex-col items-center justify-center flex-shrink-0 ${isToday(day) ? 'bg-blue-50' : ''}`}
                style={{ width: `${DAY_WIDTH}px` }}
              >
                <span className="text-[10px] text-gray-500">{format(day, 'E')}</span>
                <span className={`text-xs font-bold ${isToday(day) ? 'text-blue-600' : 'text-gray-800'}`}>
                  {format(day, 'd')}
                </span>
              </div>
            ))}
          </div>

          {/* Timeline Body Grid & Task Bars */}
          <div className="relative">
            {/* Background day columns */}
            <div className="absolute inset-0 flex pointer-events-none">
              {daysInMonth.map((day, i) => (
                <div 
                  key={i} 
                  className={`h-full border-r border-gray-100 flex-shrink-0 ${isToday(day) ? 'bg-blue-50/30' : ''}`}
                  style={{ width: `${DAY_WIDTH}px` }}
                >
                  {isToday(day) && (
                    <div className="w-0.5 h-full bg-red-400 mx-auto opacity-70 border-l border-red-500"></div>
                  )}
                </div>
              ))}
            </div>

            {/* Rows & task bars */}
            <div className="relative z-10 w-full flex flex-col">
              {processedTasks.map((task) => (
                <div key={task.id} className="h-10 border-b border-gray-100/50 relative">
                  {renderTaskBar(task)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
