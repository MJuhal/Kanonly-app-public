import { useMemo, useState } from 'react';
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useBoardStore } from '../store/boardStore';
import { t } from '../i18n';
import { Column } from './Column';
import { CreateColumnModal } from './CreateColumnModal';
import { Plus, Search, X, GripVertical } from 'lucide-react';

export function BoardView() {
  const boards = useBoardStore((s) => s.boards);
  const columns = useBoardStore((s) => s.columns);
  const tickets = useBoardStore((s) => s.tickets);
  const selectedBoardId = useBoardStore((s) => s.selectedBoardId);
  const moveTicket = useBoardStore((s) => s.moveTicket);
  const reorderColumns = useBoardStore((s) => s.reorderColumns);
  const createColumn = useBoardStore((s) => s.createColumn);
  const updateBoard = useBoardStore((s) => s.updateBoard);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [activeType, setActiveType] = useState(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 3 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  const currentBoard = useMemo(
    () => boards.find((b) => b.id === selectedBoardId),
    [boards, selectedBoardId]
  );

  const boardColumns = useMemo(() => {
    return columns
      .filter((c) => c.boardId === selectedBoardId)
      .sort((a, b) => a.order - b.order);
  }, [columns, selectedBoardId]);

  const activeTicket = useMemo(
    () => tickets.find((t) => t.id === activeId),
    [tickets, activeId]
  );

  const activeColumn = useMemo(
    () => columns.find((c) => c.id === activeId),
    [columns, activeId]
  );

  const query = searchQuery.trim().toLowerCase();

  const filterTicket = (ticket) => {
    if (!query) return true;
    const q = query;
    return (
      ticket.title.toLowerCase().includes(q) ||
      ticket.id.toLowerCase().includes(q) ||
      (ticket.displayId || '').toLowerCase().includes(q)
    );
  };

  const executeSearch = () => {
    setSearchQuery(searchInput);
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
    setActiveType(event.active.data?.current?.type || null);
  };

  const handleDragEnd = (event) => {
    setActiveId(null);
    setActiveType(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const dragType = active.data?.current?.type;

    if (dragType === 'Column') {
      let overColumnId = over.id;
      if (typeof overColumnId === 'string' && overColumnId.endsWith('-drop')) {
        overColumnId = overColumnId.slice(0, -5);
      }
      const oldIndex = boardColumns.findIndex((c) => c.id === active.id);
      const newIndex = boardColumns.findIndex((c) => c.id === overColumnId);
      if (oldIndex === -1 || newIndex === -1) return;
      const newOrder = [...boardColumns];
      const [moved] = newOrder.splice(oldIndex, 1);
      newOrder.splice(newIndex, 0, moved);
      reorderColumns(currentBoard.id, newOrder.map((c) => c.id));
      return;
    }

    const activeTicketId = active.id;
    const overId = over.id;
    const overType = over.data?.current?.type;

    let targetColumnId;
    let targetIndex;

    if (overType === 'Column') {
      targetColumnId = overId;
      const targetCol = columns.find((c) => c.id === targetColumnId);
      targetIndex = targetCol ? targetCol.ticketIds.length : undefined;
    } else {
      const overTicket = tickets.find((t) => t.id === overId);
      if (!overTicket) return;
      targetColumnId = overTicket.columnId;
      const targetCol = columns.find((c) => c.id === targetColumnId);
      targetIndex = targetCol ? targetCol.ticketIds.indexOf(overId) : undefined;
    }

    moveTicket(activeTicketId, targetColumnId, targetIndex);
  };

  const startEditingTitle = () => {
    setEditTitle(currentBoard?.name || '');
    setIsEditingTitle(true);
  };

  const saveTitle = () => {
    if (editTitle.trim() && currentBoard) {
      updateBoard(currentBoard.id, { name: editTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  const totalMatches = useMemo(() => {
    if (!query) return 0;
    return tickets.filter((t) => {
      const col = columns.find((c) => c.id === t.columnId);
      return col && col.boardId === selectedBoardId && filterTicket(t);
    }).length;
  }, [query, tickets, columns, selectedBoardId]);

  if (!currentBoard) {
    return (
      <div className="flex-1 flex items-center justify-center text-kb-text-secondary">
        {t('board.selectOrCreate')}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Header sticky */}
      <div className="sticky top-0 z-20 bg-[#0F0F0F] px-8 py-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-kb-border min-w-0">
        <div className="flex-1 min-w-0 mr-4">
          {isEditingTitle ? (
            <input
              autoFocus
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveTitle();
                if (e.key === 'Escape') setIsEditingTitle(false);
              }}
              className="text-xl font-bold bg-transparent border-b border-kb-text-secondary focus:border-kb-text outline-none px-0 py-1 w-full max-w-md"
            />
          ) : (
            <h2
              onClick={startEditingTitle}
              className="text-xl font-bold cursor-pointer hover:text-kb-text-secondary transition-colors truncate"
              title={t('board.editTitleTooltip')}
            >
              {currentBoard.name}
            </h2>
          )}
        </div>

        <div className="flex items-center gap-3 min-w-0">
          {query && (
            <span className="text-xs text-kb-text-secondary shrink-0">
              {totalMatches} {totalMatches !== 1 ? t('board.results') : t('board.result')}
            </span>
          )}

          {/* Barra de búsqueda */}
          <div className="relative w-full max-w-xs">
            <button
              onClick={executeSearch}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-kb-text-secondary hover:text-kb-text transition-colors"
            >
              <Search size={16} />
            </button>
            <input
              type="text"
              placeholder={t('board.searchPlaceholder')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') executeSearch();
              }}
              className="w-full bg-kb-card border border-kb-border rounded-lg pl-9 pr-8 py-2 text-sm text-kb-text placeholder-kb-text-secondary focus:outline-none focus:border-kb-text-secondary transition-colors"
            />
            {searchInput && (
              <button
                onClick={clearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-kb-text-secondary hover:text-kb-text rounded transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Área de columnas con scroll horizontal local */}
        <div className="overflow-x-auto pt-10 flex-1">
          <div className="px-8 pb-4 min-w-max">
            <SortableContext
              items={boardColumns.map((c) => c.id)}
              strategy={horizontalListSortingStrategy}
            >
              <div className="flex gap-6">
                {boardColumns.map((col) => {
                  const colTickets = col.ticketIds
                    .map((id) => tickets.find((t) => t.id === id))
                    .filter(Boolean)
                    .filter(filterTicket);
                  return <Column key={col.id} column={col} tickets={colTickets} />;
                })}

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-80 shrink-0 h-32 border-2 border-dashed border-kb-border rounded-lg flex items-center justify-center text-kb-text-secondary hover:border-kb-text-secondary hover:text-kb-text transition-all"
                >
                  <Plus size={20} className="mr-2" />
                  {t('board.addColumn')}
                </button>
              </div>
            </SortableContext>
          </div>
        </div>

        <DragOverlay>
          {activeType === 'Ticket' && activeTicket ? (
            <div className="bg-kb-card border border-kb-text-secondary rounded-lg p-3 shadow-xl opacity-90 rotate-2 cursor-grabbing">
              <p className="text-xs text-kb-text-secondary mb-1">ID: {activeTicket.id}</p>
              <p className="text-sm font-medium truncate">{activeTicket.title}</p>
            </div>
          ) : activeType === 'Column' && activeColumn ? (
            <div className="bg-kb-card border border-kb-text-secondary rounded-lg p-4 shadow-xl opacity-90 w-80 shrink-0 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <GripVertical size={16} className="text-kb-text-secondary" />
                <h3 className="text-sm font-bold uppercase tracking-wide">{activeColumn.title}</h3>
              </div>
              <div className="space-y-2 opacity-50">
                {tickets
                  .filter((t) => t.columnId === activeColumn.id)
                  .map((t) => (
                    <div key={t.id} className="bg-kb-bg border border-kb-border rounded-lg p-3">
                      <p className="text-sm font-medium truncate">{t.title}</p>
                    </div>
                  ))}
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <CreateColumnModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={(title, color) => createColumn(currentBoard.id, title, color)}
      />
    </div>
  );
}
