import { create } from 'zustand';
import { Task, FilterState, CollabUser, Status } from '../types';
import { generateSeedData, USERS } from '../data/seed';

type ViewMode = 'kanban' | 'list' | 'timeline';

interface DragState {
  activeTaskId: string | null;
  overColumnId: Status | null;
}

interface AppState {
  tasks: Task[];
  filters: FilterState;
  activeView: ViewMode;
  dragState: DragState;
  collaborators: CollabUser[];
  
  // Actions
  setTasks: (tasks: Task[]) => void;
  updateTaskStatus: (taskId: string, newStatus: Status) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  clearFilters: () => void;
  setActiveView: (view: ViewMode) => void;
  setDragState: (dragState: Partial<DragState>) => void;
  setCollaborators: (collaborators: CollabUser[]) => void;
}

const initialFilters: FilterState = {
  status: [],
  priority: [],
  assignee: [],
  dateFrom: null,
  dateTo: null,
};

const initialCollaborators: CollabUser[] = USERS.slice(0, 4).map(u => ({
  ...u,
  currentTaskId: null,
}));

export const useStore = create<AppState>((set) => ({
  tasks: generateSeedData(500),
  filters: initialFilters,
  activeView: 'kanban',
  dragState: { activeTaskId: null, overColumnId: null },
  collaborators: initialCollaborators,

  setTasks: (tasks) => set({ tasks }),
  
  updateTaskStatus: (taskId, newStatus) => 
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
    })),
    
  setFilters: (filters) => 
    set((state) => ({ filters: { ...state.filters, ...filters } })),
    
  clearFilters: () => set({ filters: initialFilters }),
  
  setActiveView: (activeView) => set({ activeView }),
  
  setDragState: (dragState) => 
    set((state) => ({ dragState: { ...state.dragState, ...dragState } })),
    
  setCollaborators: (collaborators) => set({ collaborators }),
}));
