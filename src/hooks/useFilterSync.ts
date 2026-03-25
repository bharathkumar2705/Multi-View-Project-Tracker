import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { FilterState, Priority, Status } from '../types';

export function useFilterSync() {
  const setFilters = useStore((state) => state.setFilters);
  const filters = useStore((state) => state.filters);

  // Sync URL to Store (on mount and popstate)
  useEffect(() => {
    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search);
      
      const parsedFilters: Partial<FilterState> = {};
      
      const statusParam = params.get('status');
      if (statusParam) parsedFilters.status = statusParam.split(',') as Status[];
      
      const priorityParam = params.get('priority');
      if (priorityParam) parsedFilters.priority = priorityParam.split(',') as Priority[];
      
      const assigneeParam = params.get('assignee');
      if (assigneeParam) parsedFilters.assignee = assigneeParam.split(',');
      
      parsedFilters.dateFrom = params.get('dateFrom') || null;
      parsedFilters.dateTo = params.get('dateTo') || null;

      setFilters(parsedFilters);
    };

    handleUrlChange();

    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, [setFilters]);

  // Sync Store to URL (on filter change)
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.status.length > 0) params.set('status', filters.status.join(','));
    if (filters.priority.length > 0) params.set('priority', filters.priority.join(','));
    if (filters.assignee.length > 0) params.set('assignee', filters.assignee.join(','));
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.set('dateTo', filters.dateTo);

    const qs = params.toString();
    const newUrl = `${window.location.pathname}${qs ? '?' + qs : ''}`;
    const currentQs = window.location.search.replace(/^\?/, '');
    
    // Only push if changed to avoid infinite cycles
    if (qs !== currentQs) {
      window.history.pushState(null, '', newUrl);
    }
  }, [filters]);
}
