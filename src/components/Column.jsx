import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TicketCard } from './TicketCard';
import { CreateTicketModal } from './CreateTicketModal';
import { ConfirmModal } from './ConfirmModal';
import { Plus, Trash2, GripVertical, Palette } from 'lucide-react';
import { t } from '../i18n';
import { useBoardStore } from '../store/boardStore';

export function Column({ column, tickets }) {
  const createTicket = useBoardStore((s) => s.createTicket);
  const deleteColumn = useBoardStore((s) => s.deleteColumn);
  const updateColumn = useBoardStore((s) => s.updateColumn);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Sortable para reordenar columnas (drag handle en el header)
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id, data: { type: 'Column', column } });

  // Droppable para recibir tickets (usamos el mismo ref)
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: column.id + '-drop',
    data: { type: 'Column', column },
  });

  const sortableStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDelete = () => {
    if (tickets.length === 0) {
      deleteColumn(column.id);
    } else {
      setShowConfirmDelete(true);
    }
  };

  const columnColors = [
    '#FFFFFF', '#E5A853', '#4ADE80', '#EF4444', '#60A5FA',
    '#A78BFA', '#FB923C', '#F472B6', '#22D3EE', '#888888',
  ];

  return (
    <div
      ref={setSortableRef}
      style={sortableStyle}
      className="w-80 shrink-0 flex flex-col"
    >
      {/* Header de columna: drag handle + título + acciones */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <button
            {...attributes}
            {...listeners}
            className="p-0.5 text-kb-text-secondary hover:text-kb-text rounded cursor-grab active:cursor-grabbing shrink-0 touch-none"
            title="Arrastrar columna"
          >
            <GripVertical size={16} />
          </button>
          <h3
            className="text-sm font-bold uppercase tracking-wide truncate"
            style={{ color: column.color || '#FFFFFF' }}
          >
            {column.title}
          </h3>
        </div>
        <div className="flex items-center gap-1 shrink-0 relative">
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="p-1 text-kb-text-secondary hover:text-kb-text rounded transition-colors"
              title="Cambiar color"
            >
              <Palette size={14} />
            </button>
            {showColorPicker && (
              <div className="absolute top-8 right-0 bg-kb-card border border-kb-border rounded-lg p-2 flex flex-wrap gap-[8px] z-20 shadow-xl w-[114px] items-start">
                {columnColors.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      updateColumn(column.id, { color: c });
                      setShowColorPicker(false);
                    }}
                    className="w-4 h-4 rounded-[4px] border border-kb-border hover:scale-110 transition-transform"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
          )}
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-1 text-kb-text-secondary hover:text-kb-text rounded transition-colors"
          >
            <Plus size={18} />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 rounded transition-colors text-kb-text-secondary hover:text-red-400"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Área droppable para tickets */}
      <div
        ref={setDroppableRef}
        className={`flex-1 space-y-2 pr-1 rounded-lg transition-colors min-h-[120px] ${
          isOver ? 'bg-kb-hover/50' : ''
        }`}
      >
        <SortableContext
          items={tickets.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </SortableContext>

        {tickets.length === 0 && (
          <div className="text-center py-8 text-kb-text-secondary text-xs">
            {isOver ? 'Soltar aquí' : 'Sin tickets'}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showConfirmDelete}
        title={t('column.deleteConfirmTitle')}
        message={t('column.deleteConfirmMessage')}
        onConfirm={() => {
          deleteColumn(column.id);
          setShowConfirmDelete(false);
        }}
        onCancel={() => setShowConfirmDelete(false)}
      />
      <CreateTicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={(title) => createTicket(column.id, title)}
        columnTitle={column.title}
      />
    </div>
  );
}
