import { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { BoardView } from './components/BoardView';
import { BoardsView } from './components/BoardsView';
import { HomeView } from './components/HomeView';
import { NotesView } from './components/NotesView';
import { TicketDetail } from './components/TicketDetail';
import { NoteDetail } from './components/NoteDetail';
import { SplashScreen } from './components/SplashScreen';
import { useBoardStore } from './store/boardStore';

function App() {
  const selectedTicketId = useBoardStore((s) => s.selectedTicketId);
  const selectedNoteId = useBoardStore((s) => s.selectedNoteId);
  const selectedBoardId = useBoardStore((s) => s.selectedBoardId);
  const initialized = useBoardStore((s) => s.initialized);
  const loadingProgress = useBoardStore((s) => s.loadingProgress);
  const view = useBoardStore((s) => s.view);

  const [showApp, setShowApp] = useState(false);

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

  useEffect(() => {
    if (initialized) {
      const timer = setTimeout(() => setShowApp(true), 50);
      return () => clearTimeout(timer);
    }
    setShowApp(false);
  }, [initialized]);

  return (
    <>
      {initialized && (
        <div
          className={[
            'flex min-h-screen w-full',
            'transition-opacity duration-700 ease-out',
            showApp ? 'opacity-100' : 'opacity-0',
          ].join(' ')}
        >
          <Sidebar />
          <main className="flex-1 flex flex-col min-h-screen min-w-0">
            {view === 'home' ? (
              <HomeView />
            ) : view === 'notes' ? (
              <NotesView />
            ) : view === 'boards' && !selectedBoardId ? (
              <BoardsView />
            ) : (
              <BoardView />
            )}
          </main>
          {selectedTicketId && <TicketDetail />}
          {selectedNoteId && <NoteDetail />}
        </div>
      )}
      <SplashScreen progress={loadingProgress} initialized={initialized} />
    </>
  );
}

export default App;
