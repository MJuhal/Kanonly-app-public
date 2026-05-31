import { useState } from 'react';
import { useBoardStore } from '../store/boardStore';
import { t } from '../i18n';
import { CreateBoardModal } from './CreateBoardModal';
import { ConfirmModal } from './ConfirmModal';
import { Layout, Plus, Trash2 } from 'lucide-react';
import { open } from '@tauri-apps/plugin-shell';

export function Sidebar() {
  const boards = useBoardStore((s) => s.boards);
  const selectedBoardId = useBoardStore((s) => s.selectedBoardId);
  const view = useBoardStore((s) => s.view);
  const selectBoard = useBoardStore((s) => s.selectBoard);
  const setView = useBoardStore((s) => s.setView);
  const createBoard = useBoardStore((s) => s.createBoard);
  const deleteBoard = useBoardStore((s) => s.deleteBoard);
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
  const [showConfirmDeleteBoard, setShowConfirmDeleteBoard] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState(null);

  return (
    <aside className="w-64 bg-kb-bg border-r border-kb-border flex flex-col shrink-0 sticky top-0 h-screen select-none">
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
              <span className="text-[10px] text-kb-text-secondary bg-kb-bg border border-kb-border px-1.5 py-0.5 rounded">
                {boards.length} / 1
              </span>
            </button>
            <button
              onClick={() => {
                if (boards.length < 1) setIsBoardModalOpen(true);
              }}
              className={`transition-colors p-1 ${
                boards.length >= 1
                  ? 'text-kb-text-secondary/30 cursor-not-allowed'
                  : 'text-kb-text-secondary hover:text-kb-text'
              }`}
              title={boards.length >= 1 ? 'Límite: 1 tablero en la versión gratuita' : t('sidebar.createBoardTooltip')}
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="space-y-1">
            {boards.map((board) => (
              <div key={board.id} className="group relative">
                <button
                  onClick={() => selectBoard(board.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 truncate flex items-center gap-2 ${
                    selectedBoardId === board.id && view === 'boards'
                      ? 'bg-white text-black'
                      : 'text-kb-text-secondary hover:text-kb-text hover:bg-kb-hover'
                  }`}
                >
                  {board.icon ? <span>{board.icon}</span> : <Layout size={16} />}
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

    </aside>
  );
}
