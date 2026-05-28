import { useMemo, useState } from 'react';
import { useBoardStore } from '../store/boardStore';
import { t } from '../i18n';
import { Button } from './ui/Button';
import { CreateBoardModal } from './CreateBoardModal';
import { Layout, ArrowRight } from 'lucide-react';

function formatDate(timestamp) {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function BoardsView() {
  const boards = useBoardStore((s) => s.boards);
  const columns = useBoardStore((s) => s.columns);
  const tickets = useBoardStore((s) => s.tickets);
  const selectBoard = useBoardStore((s) => s.selectBoard);
  const createBoard = useBoardStore((s) => s.createBoard);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const boardStats = useMemo(() => {
    return boards.map((board) => {
      const boardColumns = columns.filter((c) => c.boardId === board.id);
      const boardColumnIds = boardColumns.map((c) => c.id);
      const boardTickets = tickets.filter((t) => boardColumnIds.includes(t.columnId));
      const ticketCount = boardTickets.length;

      // Última modificación: max entre createdAt de tickets y updatedAt de comentarios
      let lastMod = board.createdAt || 0;
      boardTickets.forEach((t) => {
        if (t.createdAt > lastMod) lastMod = t.createdAt;
        (t.comments || []).forEach((c) => {
          if (c.updatedAt > lastMod) lastMod = c.updatedAt;
          if (c.createdAt > lastMod) lastMod = c.createdAt;
        });
      });

      return { ...board, ticketCount, lastMod };
    });
  }, [boards, columns, tickets]);

  return (
    <div className="flex-1 flex flex-col">
      {/* Header sticky */}
      <div className="sticky top-0 z-20 bg-[#0F0F0F] px-8 py-6 flex items-center justify-between gap-4 border-b border-kb-border">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold">{t('boards.title')}</h2>
          <span className="text-xs text-kb-text-secondary bg-kb-card border border-kb-border px-2 py-1 rounded-md">
            {boards.length} / 1
          </span>
        </div>
        <Button
          variant="primary"
          className="text-[16px]"
          onClick={() => {
            if (boards.length < 1) setIsModalOpen(true);
          }}
          disabled={boards.length >= 1}
        >
          {t('boards.newBoard')}
        </Button>
      </div>

      <div className="px-8 pb-6 pt-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {boardStats.map((board) => (
            <div
              key={board.id}
              onClick={() => selectBoard(board.id)}
              className="bg-kb-card border border-kb-border rounded-xl p-5 cursor-pointer hover:border-kb-text-secondary transition-all duration-200 group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Layout size={16} className="text-kb-text-secondary shrink-0" />
                  <h3 className="text-sm font-bold truncate">{board.name}</h3>
                </div>
                <ArrowRight
                  size={16}
                  className="text-kb-text-secondary opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-kb-text-secondary">
                <span>
                  {board.ticketCount} {board.ticketCount !== 1 ? t('boards.tickets') : t('boards.ticket')}
                </span>
                <span>
                  {board.lastMod ? `${t('boards.lastModified')}: ${formatDate(board.lastMod)}` : t('boards.noActivity')}
                </span>
              </div>
            </div>
          ))}

          {boards.length === 0 && (
            <div className="col-span-full text-center py-12 text-kb-text-secondary text-sm">
              {t('boards.empty')}
            </div>
          )}
        </div>
      </div>
      <CreateBoardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={createBoard}
      />
    </div>
  );
}
