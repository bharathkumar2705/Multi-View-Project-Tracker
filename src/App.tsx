import { useEffect } from 'react';
import { AppShell } from './components/AppShell';
import { useFilterSync } from './hooks/useFilterSync';
import { useStore } from './store/useStore';
import { KanbanBoard } from './views/KanbanBoard';
import { ListView } from './views/ListView';
import { TimelineView } from './views/TimelineView';
import { startCollabSimulation } from './simulation/collabSim';
import { CollabOverlay } from './components/CollabOverlay';

function App() {
  useFilterSync();

  useEffect(() => {
    const stopSimulation = startCollabSimulation();
    return () => stopSimulation();
  }, []);

  const activeView = useStore((state) => state.activeView);

  return (
    <AppShell>
      <CollabOverlay />
      {activeView === 'kanban' && <KanbanBoard />}
      {activeView === 'list' && <ListView />}
      {activeView === 'timeline' && <TimelineView />}
    </AppShell>
  );
}

export default App;
