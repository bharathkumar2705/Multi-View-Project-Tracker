import { useStore } from '../store/useStore';

export function startCollabSimulation() {
  const intervalId = setInterval(() => {
    // We cannot access state directly in setInterval without getting it fresh
    const state = useStore.getState();
    const tasks = state.tasks;
    if (tasks.length === 0) return;

    // Pick 1-2 random users to "move" every cycle
    const usersToMove = Math.floor(Math.random() * 2) + 1;
    
    const newCollaborators = [...state.collaborators];
    
    for (let i = 0; i < usersToMove; i++) {
        // Pick random user
        const userIndex = Math.floor(Math.random() * newCollaborators.length);
        
        // Pick random task
        const randomTask = tasks[Math.floor(Math.random() * tasks.length)];
        
        // Approximately 20% of the time, simulating "going offline" or looking at board generally
        if (Math.random() < 0.2) {
            newCollaborators[userIndex] = { ...newCollaborators[userIndex], currentTaskId: null };
        } else {
            newCollaborators[userIndex] = { ...newCollaborators[userIndex], currentTaskId: randomTask.id };
        }
    }
    
    useStore.setState({ collaborators: newCollaborators });

  }, 4000); // Update every 4 seconds
  
  return () => clearInterval(intervalId);
}
