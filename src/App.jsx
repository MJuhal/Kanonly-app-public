import { useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { BoardView } from './components/BoardView';
import { BoardsView } from './components/BoardsView';
import { HomeView } from './components/HomeView';
import { TicketDetail } from './components/TicketDetail';
import { useBoardStore } from './store/boardStore';

function App() {
  const selectedTicketId = useBoardStore((s) => s.selectedTicketId);
  const selectedBoardId = useBoardStore((s) => s.selectedBoardId);
  const initialized = useBoardStore((s) => s.initialized);
  const view = useBoardStore((s) => s.view);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        // Si el foco está en un editor de texto (contentEditable, input, textarea), no interferir
        const active = document.activeElement;
        if (
          active &&
          (active.isContentEditable ||
            active.tagName === 'INPUT' ||
            active.tagName === 'TEXTAREA')
        ) {
          return; // Dejar que el browser maneje el undo nativo
        }
        e.preventDefault();
        useBoardStore.getState().undo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!initialized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-kb-bg">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-wider mb-2">KANONLY</h1>
          <p className="text-kb-text-secondary text-sm animate-pulse">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <main className="flex-1 flex flex-col min-h-screen min-w-0">
        {view === 'home' ? (
          <HomeView />
        ) : view === 'boards' && !selectedBoardId ? (
          <BoardsView />
        ) : (
          <BoardView />
        )}
      </main>
      {selectedTicketId && <TicketDetail />}
    </div>
  );
}

export default App;
