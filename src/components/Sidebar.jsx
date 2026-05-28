import { useState } from 'react';
import { useBoardStore } from '../store/boardStore';
import { t } from '../i18n';
import { CreateBoardModal } from './CreateBoardModal';
import { CreateNoteModal } from './CreateNoteModal';
import { ConfirmModal } from './ConfirmModal';
import { Layout, Plus, StickyNote, Trash2 } from 'lucide-react';
import { open } from '@tauri-apps/plugin-shell';

export function Sidebar() {
  const boards = useBoardStore((s) => s.boards);
  const notes = useBoardStore((s) => s.notes);
  const selectedBoardId = useBoardStore((s) => s.selectedBoardId);
  const selectedNoteId = useBoardStore((s) => s.selectedNoteId);
  const view = useBoardStore((s) => s.view);
  const selectBoard = useBoardStore((s) => s.selectBoard);
  const selectNote = useBoardStore((s) => s.selectNote);
  const setView = useBoardStore((s) => s.setView);
  const createBoard = useBoardStore((s) => s.createBoard);
  const createNote = useBoardStore((s) => s.createNote);
  const deleteBoard = useBoardStore((s) => s.deleteBoard);
  const deleteNote = useBoardStore((s) => s.deleteNote);
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [showConfirmDeleteBoard, setShowConfirmDeleteBoard] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState(null);
  const [showConfirmDeleteNote, setShowConfirmDeleteNote] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);

  const visibleNotes = [...notes]
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    .slice(0, 4);

  return (
    <aside className="w-64 bg-kb-bg border-r border-kb-border flex flex-col shrink-0 sticky top-0 h-screen">
      <div className="p-6">
        <button
          onClick={() => {
            setView('home');
            useBoardStore.setState({ selectedBoardId: null });
          }}
          className="w-full flex justify-center hover:opacity-80 transition-opacity cursor-pointer"
        >
          <img
            src="/logo-text.svg"
            alt="KANONLY"
            className="h-8 w-auto"
          />
        </button>
      </div>

      <div className="flex-1 px-4 py-2 space-y-6 overflow-y-auto">
        {/* Tableros */}
        <div>
          <div className="flex items-center justify-between px-3 py-2 rounded-lg mb-2 bg-[#1A1A1A]">
            <button
              onClick={() => {
                setView('boards');
                useBoardStore.setState({ selectedBoardId: null });
              }}
              className={`flex-1 justify-start flex items-center gap-2 text-sm transition-colors ${
                view === 'boards'
                  ? 'text-kb-text'
                  : 'text-kb-text-secondary hover:text-kb-text'
              }`}
            >
              <Layout size={16} />
              <span>{t('sidebar.myBoards')}</span>
            </button>
            <button
              onClick={() => setIsBoardModalOpen(true)}
              className="text-kb-text-secondary hover:text-kb-text transition-colors p-1"
              title={t('sidebar.createBoardTooltip')}
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="space-y-1">
            {boards.map((board) => (
              <div key={board.id} className="group relative">
                <button
                  onClick={() => selectBoard(board.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 truncate ${
                    selectedBoardId === board.id && view === 'boards'
                      ? 'bg-white text-black'
                      : 'text-kb-text-secondary hover:text-kb-text hover:bg-kb-hover'
                  }`}
                >
                  {board.name}
                </button>
                {boards.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setBoardToDelete(board);
                      setShowConfirmDeleteBoard(true);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded transition-all text-kb-text-secondary opacity-0 group-hover:opacity-100 hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Notas */}
        <div>
          <div className="flex items-center justify-between px-3 py-2 rounded-lg mb-2 bg-[#1A1A1A]">
            <button
              onClick={() => setView('notes')}
              className={`flex-1 justify-start flex items-center gap-2 text-sm transition-colors ${
                view === 'notes'
                  ? 'text-kb-text'
                  : 'text-kb-text-secondary hover:text-kb-text'
              }`}
            >
              <StickyNote size={16} />
              <span>{t('sidebar.myNotes')}</span>
            </button>
            <button
              onClick={() => {
                setView('notes');
                setIsNoteModalOpen(true);
              }}
              className="text-kb-text-secondary hover:text-kb-text transition-colors p-1"
              title={t('sidebar.createNoteTooltip')}
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="space-y-1">
            {visibleNotes.map((note) => (
              <div key={note.id} className="group relative">
                <button
                  onClick={() => {
                    setView('notes');
                    selectNote(note.id);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 truncate ${
                    selectedNoteId === note.id && view === 'notes'
                      ? 'bg-white text-black'
                      : 'text-kb-text-secondary hover:text-kb-text hover:bg-kb-hover'
                  }`}
                >
                  {note.title || t('sidebar.untitledNote')}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setNoteToDelete(note);
                    setShowConfirmDeleteNote(true);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded transition-all text-kb-text-secondary opacity-0 group-hover:opacity-100 hover:text-red-400"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Logo creador */}
      <div className="py-8 px-4 flex justify-center border-t border-kb-border">
        <button
          onClick={() => open('https://www.martinjuhal.com')}
          className="cursor-pointer"
        >
          <img
            src="/my-logo.png"
            alt="Created by Martin Juhal"
            className="w-32 opacity-50 hover:opacity-80 transition-opacity"
          />
        </button>
      </div>

      <CreateBoardModal
        isOpen={isBoardModalOpen}
        onClose={() => setIsBoardModalOpen(false)}
        onCreate={createBoard}
      />
      <CreateNoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onCreate={createNote}
      />
      <ConfirmModal
        isOpen={showConfirmDeleteBoard}
        title={t('board.deleteConfirmTitle')}
        message={t('board.deleteConfirmMessage')}
        onConfirm={() => {
          if (boardToDelete) deleteBoard(boardToDelete.id);
          setShowConfirmDeleteBoard(false);
          setBoardToDelete(null);
        }}
        onCancel={() => {
          setShowConfirmDeleteBoard(false);
          setBoardToDelete(null);
        }}
      />
      <ConfirmModal
        isOpen={showConfirmDeleteNote}
        title={t('note.deleteConfirmTitle')}
        message={t('note.deleteConfirmMessage')}
        onConfirm={() => {
          if (noteToDelete) deleteNote(noteToDelete.id);
          setShowConfirmDeleteNote(false);
          setNoteToDelete(null);
        }}
        onCancel={() => {
          setShowConfirmDeleteNote(false);
          setNoteToDelete(null);
        }}
      />

    </aside>
  );
}
