import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useBoardStore } from '../store/boardStore';
import { Trash2, Copy } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';
import { useState } from 'react';
import { t } from '../i18n';

const priorityColors = {
  high: 'bg-red-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500',
};

export function TicketCard({ ticket }) {
  const selectTicket = useBoardStore((s) => s.selectTicket);
  const deleteTicket = useBoardStore((s) => s.deleteTicket);
  const duplicateTicket = useBoardStore((s) => s.duplicateTicket);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ticket.id, data: { type: 'Ticket', ticket } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const displayId = ticket.displayId || ticket.id;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => selectTicket(ticket.id)}
      className="bg-kb-card border border-kb-border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-kb-text-secondary transition-all duration-200 group touch-none relative select-none"
    >
      {/* Acciones rápidas (aparecen on hover) */}
      <div className="absolute top-1.5 right-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            duplicateTicket(ticket.id);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="p-1 text-kb-text-secondary hover:text-kb-text hover:bg-kb-hover rounded transition-colors"
          title="Duplicar ticket"
        >
          <Copy size={12} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowConfirmDelete(true);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="p-1 text-kb-text-secondary hover:text-red-400 hover:bg-kb-hover rounded transition-colors"
          title="Eliminar ticket"
        >
          <Trash2 size={12} />
        </button>
      </div>
      <ConfirmModal
        isOpen={showConfirmDelete}
        onCancel={() => setShowConfirmDelete(false)}
        onConfirm={() => {
          deleteTicket(ticket.id);
          setShowConfirmDelete(false);
        }}
        title={t('ticket.deleteConfirmTitle')}
        message={t('ticket.deleteConfirmMessage')}
      />

      <div className="flex items-center justify-between mb-1.5 pr-14">
        <div className="flex items-center gap-2">
          <p className="text-xs text-kb-text-secondary">ID: {displayId}</p>
          {ticket.priority && (
            <span
              className={`w-2 h-2 rounded-full ${priorityColors[ticket.priority] || 'bg-kb-text-secondary'}`}
              title={`Prioridad: ${ticket.priority}`}
            />
          )}
        </div>
      </div>
      <p className="text-sm font-medium truncate group-hover:text-white transition-colors font-neutra">
        {ticket.title}
      </p>
    </div>
  );
}
