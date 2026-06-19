import { useBoardStore } from '../store/boardStore';
import { useUpdateCheck } from '../hooks/useUpdateCheck';
import { t } from '../i18n';
import { Layout, StickyNote, ArrowRight, ShieldCheck } from 'lucide-react';

export function HomeView() {
  const boards = useBoardStore((s) => s.boards);
  const tickets = useBoardStore((s) => s.tickets);
  const notes = useBoardStore((s) => s.notes);
  const columns = useBoardStore((s) => s.columns);
  const selectBoard = useBoardStore((s) => s.selectBoard);
  const selectNote = useBoardStore((s) => s.selectNote);
  const setView = useBoardStore((s) => s.setView);
  const { hasUpdate, openStore } = useUpdateCheck();

  const recentBoards = [...boards]
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .slice(0, 5);

  const recentNotes = notes.slice(0, 5);

  const getTicketCount = (boardId) => {
    return tickets.filter((t) => {
      const col = columns.find((c) => c.id === t.columnId);
      return col && col.boardId === boardId;
    }).length;
  };

  const handleBoardClick = (boardId) => {
    selectBoard(boardId);
  };

  const handleNoteClick = (noteId) => {
    setView('notes');
    selectNote(noteId);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0F0F0F] select-none">
      <div className="px-8 py-10 w-full">
        {/* Hero Banner */}
        <div
          className="relative rounded-2xl overflow-hidden mb-10 h-[188px] flex items-center justify-between px-8"
          style={{
            background: 'linear-gradient(to right, #000000 0%, #111111 57%, rgba(15, 15, 15, 0) 100%)',
          }}
        >
          <div className="flex flex-col justify-center shrink-0">
            <h1 className="text-6xl font-black text-white tracking-wide leading-none">
              {t('home.greeting')}<span className="text-[#54E8F3]">!</span>
            </h1>
            <p className="text-xl text-white tracking-wider mt-2">
              {t('home.welcomeBack').split(' ').map((word, i) => (
                <span key={i} className={i === 0 ? 'font-bold' : 'font-light'}>
                  {i > 0 && ' '}{word}
                </span>
              ))}
            </p>
          </div>
          <img
            src="/logo-deco-banner.svg"
            alt=""
            className="h-full w-auto object-contain opacity-50 shrink-0"
            aria-hidden="true"
          />
        </div>

        {/* Update hint */}
        {hasUpdate && (
          <button
            onClick={openStore}
            className="w-full flex items-center gap-3 bg-[#1A1A1A] hover:bg-[#1E1E1E] border border-[#4ADE80]/40 rounded-lg px-4 py-3 mb-10 transition-all duration-200 group text-left"
          >
            <ShieldCheck size={18} className="text-[#4ADE80] shrink-0" />
            <p className="text-sm text-white">
              <span className="font-semibold text-[#4ADE80]">{t('home.updateAvailable')}</span>
              {' '}{t('home.updateAction')}
            </p>
          </button>
        )}

        {/* Tableros Recientes */}
        <div className="mb-10">
          <h2 className="text-sm font-bold tracking-wider mb-4">
            <span className="text-white">{t('home.recentBoards')}</span>{' '}
            <span className="text-kb-text-secondary">{t('home.recentBoardsSuffix')}</span>
          </h2>
          <div className="space-y-2">
            {recentBoards.map((board) => (
              <button
                key={board.id}
                onClick={() => handleBoardClick(board.id)}
                className="w-full flex items-center justify-between bg-[#1A1A1A] hover:bg-[#252525] border border-[#222222] rounded-lg px-5 py-4 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  {board.icon ? (
                    <span className="text-lg">{board.icon}</span>
                  ) : (
                    <Layout size={18} className="text-kb-text-secondary" />
                  )}
                  <span className="text-sm font-semibold text-kb-text group-hover:text-white transition-colors">
                    {board.name}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-kb-text-secondary">
                    {getTicketCount(board.id)} {getTicketCount(board.id) === 1 ? 'ticket' : 'tickets'}
                  </span>
                  <ArrowRight
                    size={16}
                    className="text-kb-text-secondary group-hover:text-white group-hover:translate-x-1 transition-all"
                  />
                </div>
              </button>
            ))}
            {recentBoards.length === 0 && (
              <p className="text-sm text-kb-text-secondary py-4">
                {t('home.noBoards')}
              </p>
            )}
          </div>
        </div>

        {/* Notas Recientes */}
        <div>
          <h2 className="text-sm font-bold tracking-wider mb-4">
            <span className="text-white">{t('home.recentNotes')}</span>{' '}
            <span className="text-kb-text-secondary">{t('home.recentNotesSuffix')}</span>
          </h2>
          <div className="space-y-2">
            {recentNotes.map((note) => (
              <button
                key={note.id}
                onClick={() => handleNoteClick(note.id)}
                className="w-full flex items-center justify-between bg-[#1A1A1A] hover:bg-[#252525] border border-[#222222] rounded-lg px-5 py-4 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  {note.icon ? (
                    <span className="text-lg">{note.icon}</span>
                  ) : (
                    <StickyNote size={18} className="text-kb-text-secondary" />
                  )}
                  <span className="text-sm font-semibold text-kb-text group-hover:text-white transition-colors">
                    {note.title || t('sidebar.untitledNote')}
                  </span>
                </div>
                <ArrowRight
                  size={16}
                  className="text-kb-text-secondary group-hover:text-white group-hover:translate-x-1 transition-all"
                />
              </button>
            ))}
            {recentNotes.length === 0 && (
              <p className="text-sm text-kb-text-secondary py-4">
                {t('home.noNotes')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
