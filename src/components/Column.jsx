import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TicketCard } from './TicketCard';
import { CreateTicketModal } from './CreateTicketModal';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { useBoardStore } from '../store/boardStore';

export function Column({ column, tickets }) {
  const createTicket = useBoardStore((s) => s.createTicket);
  const deleteColumn = useBoardStore((s) => s.deleteColumn);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

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
    if (confirmDelete) {
      deleteColumn(column.id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 2000);
    }
  };

  const getTitleColor = () => {
    const t = column.title.toUpperCase();
    if (t.includes('PROGRESS')) return 'text-kb-inprogress';
    if (t.includes('COMPLETE') || t.includes('DONE')) return 'text-kb-complete';
    return 'text-kb-text';
  };

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
          <h3 className={`text-sm font-bold uppercase tracking-wide truncate ${getTitleColor()}`}>
            {column.title}
          </h3>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-1 text-kb-text-secondary hover:text-kb-text rounded transition-colors"
          >
            <Plus size={18} />
          </button>
          <button
            onClick={handleDelete}
            className={`p-1 rounded transition-colors ${
              confirmDelete ? 'text-red-400' : 'text-kb-text-secondary hover:text-red-400'
            }`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Área droppable para tickets */}
      <div
        ref={setDroppableRef}
        className={`space-y-2 pr-1 rounded-lg transition-colors ${
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

      <CreateTicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={(title) => createTicket(column.id, title)}
        columnTitle={column.title}
      />
    </div>
  );
}
