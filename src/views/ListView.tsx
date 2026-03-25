import { useState, useMemo, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Priority, Status, Task } from '../types';
import { useVirtualScroll } from '../hooks/useVirtualScroll';
import { ArrowDown, ArrowUp, ArrowUpDown, Calendar } from 'lucide-react';
import { isToday, differenceInDays, startOfDay } from 'date-fns';

type SortColumn = 'title' | 'priority' | 'dueDate' | null;
type SortDirection = 'asc' | 'desc';

export function ListView() {
  const { tasks, filters, updateTaskStatus } = useStore();
  
  const [sortCol, setSortCol] = useState<SortColumn>(null);
  const [sortDir, setSortDir] = useState<SortDirection>('asc');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(600); // Default, updated on mount

  useEffect(() => {
    if (containerRef.current) {
      setContainerHeight(containerRef.current.clientHeight);
    }
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) setContainerHeight(entry.contentRect.height);
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const ROW_HEIGHT = 48; // 48px per row

  const handleSort = (col: SortColumn) => {
    if (sortCol === col) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
  };

  const priorityOrder = {
    [Priority.Critical]: 4,
    [Priority.High]: 3,
    [Priority.Medium]: 2,
    [Priority.Low]: 1,
  };

  const processedTasks = useMemo(() => {
    let result = tasks.filter((task) => {
      if (filters.status.length > 0 && !filters.status.includes(task.status)) return false;
      if (filters.priority.length > 0 && !filters.priority.includes(task.priority)) return false;
      if (filters.assignee.length > 0 && !filters.assignee.includes(task.assignee.id)) return false;
      if (filters.dateFrom && task.dueDate < filters.dateFrom) return false;
      if (filters.dateTo && task.dueDate > filters.dateTo) return false;
      return true;
    });

    if (sortCol) {
      result.sort((a, b) => {
        let modifier = sortDir === 'asc' ? 1 : -1;
        if (sortCol === 'title') {
          return a.title.localeCompare(b.title) * modifier;
        } else if (sortCol === 'priority') {
          return (priorityOrder[a.priority] - priorityOrder[b.priority]) * modifier;
        } else if (sortCol === 'dueDate') {
          return (new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()) * modifier;
        }
        return 0;
      });
    }
    return result;
  }, [tasks, filters, sortCol, sortDir]);

  const { startIndex, endIndex, totalHeight, offsetY, handleScroll } = useVirtualScroll(
    processedTasks.length,
    ROW_HEIGHT,
    containerHeight,
    5
  );

  const visibleTasks = processedTasks.slice(startIndex, endIndex + 1);

  const renderSortIcon = (col: SortColumn) => {
    if (sortCol !== col) return <ArrowUpDown size={14} className="text-gray-400 opacity-0 group-hover:opacity-100" />;
    return sortDir === 'asc' ? <ArrowUp size={14} className="text-blue-600" /> : <ArrowDown size={14} className="text-blue-600" />;
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.Critical: return 'bg-red-100 text-red-800';
      case Priority.High: return 'bg-orange-100 text-orange-800';
      case Priority.Medium: return 'bg-yellow-100 text-yellow-800';
      case Priority.Low: return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderDueDate = (task: Task) => {
    const today = startOfDay(new Date());
    const dueDate = new Date(task.dueDate);
    
    if (isToday(dueDate)) return <span className="text-orange-600 font-medium">Due Today</span>;
    
    const overdueDays = differenceInDays(today, dueDate);
    if (overdueDays > 7) return <span className="text-red-600 font-bold">{overdueDays} days overdue</span>;
    if (overdueDays > 0) return <span className="text-red-500 font-medium">Overdue</span>;

    return <span className="text-gray-500">{task.dueDate}</span>;
  };

  if (processedTasks.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
        <Calendar size={48} className="mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">No tasks found</h3>
        <p className="text-sm">Try adjusting your filters to find what you're looking for.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white m-6 rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider sticky top-0 z-10 w-full min-w-[800px]">
        <div 
          className="flex-1 py-3 px-6 cursor-pointer group flex items-center gap-2"
          onClick={() => handleSort('title')}
        >
          Task Name {renderSortIcon('title')}
        </div>
        <div 
          className="w-32 py-3 px-4 cursor-pointer group flex items-center gap-2"
          onClick={() => handleSort('priority')}
        >
          Priority {renderSortIcon('priority')}
        </div>
        <div className="w-48 py-3 px-4">Status</div>
        <div className="w-48 py-3 px-4">Assignee</div>
        <div 
          className="w-40 py-3 px-6 cursor-pointer group flex items-center gap-2"
          onClick={() => handleSort('dueDate')}
        >
          Due Date {renderSortIcon('dueDate')}
        </div>
      </div>

      {/* Virtual Scroll Container */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto min-w-[800px]"
        onScroll={handleScroll}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          <div style={{ transform: `translateY(${offsetY}px)`, position: 'absolute', top: 0, left: 0, right: 0 }}>
            {visibleTasks.map((task) => (
              <div 
                key={task.id} 
                className="flex items-center border-b border-gray-100 hover:bg-gray-50 transition-colors"
                style={{ height: ROW_HEIGHT }}
              >
                <div className="flex-1 px-6 font-medium text-gray-900 truncate pr-4">
                  {task.title}
                </div>
                <div className="w-32 px-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
                <div className="w-48 px-4">
                  <select 
                    value={task.status}
                    onChange={(e) => updateTaskStatus(task.id, e.target.value as Status)}
                    className="text-sm border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 py-1 pl-2 pr-8 bg-transparent"
                  >
                    {Object.values(Status).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="w-48 px-4 flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${task.assignee.avatarColor}`}>
                    {task.assignee.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <span className="text-sm text-gray-700 truncate">{task.assignee.name}</span>
                </div>
                <div className="w-40 px-6 text-sm">
                  {renderDueDate(task)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
