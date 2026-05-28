import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useBoardStore } from '../store/boardStore';

const priorityColors = {
  high: 'bg-red-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500',
};

export function TicketCard({ ticket }) {
  const selectTicket = useBoardStore((s) => s.selectTicket);
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
      className="bg-kb-card border border-kb-border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-kb-text-secondary transition-all duration-200 group touch-none"
    >
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-xs text-kb-text-secondary">ID: {displayId}</p>
        {ticket.priority && (
          <span
            className={`w-2 h-2 rounded-full ${priorityColors[ticket.priority] || 'bg-kb-text-secondary'}`}
            title={`Prioridad: ${ticket.priority}`}
          />
        )}
      </div>
      <p className="text-sm font-medium truncate group-hover:text-white transition-colors">
        {ticket.title}
      </p>
    </div>
  );
}
