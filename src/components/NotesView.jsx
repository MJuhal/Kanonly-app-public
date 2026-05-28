import { useState, useMemo } from 'react';
import { useBoardStore } from '../store/boardStore';
import { t } from '../i18n';
import { Button } from './ui/Button';
import { CreateNoteModal } from './CreateNoteModal';
import { ConfirmModal } from './ConfirmModal';
import { Trash2, GripVertical } from 'lucide-react';
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const priorityColors = {
  high: 'bg-red-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500',
};

function SortableNoteItem({ note, onSelect, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: note.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition ? 'transform 80ms ease' : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-kb-card border border-kb-border rounded-lg p-4 cursor-pointer hover:border-kb-text-secondary transition-all duration-200 group select-none"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <button
            {...attributes}
            {...listeners}
            className="p-0.5 text-kb-text-secondary hover:text-kb-text rounded cursor-grab active:cursor-grabbing shrink-0 touch-none"
            title="Arrastrar para ordenar"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical size={14} />
          </button>
        </div>
        <div className="flex-1 min-w-0" onClick={() => onSelect(note.id)}>
          <div className="flex items-center gap-2 mb-1">
            {note.priority && (
              <span
                className={`w-2 h-2 rounded-full ${priorityColors[note.priority] || 'bg-kb-text-secondary'}`}
                title={`Prioridad: ${note.priority}`}
              />
            )}
            <p className="text-sm font-medium truncate group-hover:text-white transition-colors font-neutra">
              {note.title}
            </p>
          </div>
          {note.description && (
            <p className="text-xs text-kb-text-secondary line-clamp-2 mt-1">
              {note.description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()}
            </p>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(note);
          }}
          className="p-1.5 text-kb-text-secondary hover:text-red-400 rounded transition-colors shrink-0 opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

export function NotesView() {
  const notes = useBoardStore((s) => s.notes);
  const selectNote = useBoardStore((s) => s.selectNote);
  const createNote = useBoardStore((s) => s.createNote);
  const deleteNote = useBoardStore((s) => s.deleteNote);
  const reorderNotes = useBoardStore((s) => s.reorderNotes);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);

  const sortedNotes = useMemo(
    () => [...notes].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)),
    [notes]
  );

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 3 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sortedNotes.findIndex((n) => n.id === active.id);
    const newIndex = sortedNotes.findIndex((n) => n.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = [...sortedNotes];
    const [moved] = newOrder.splice(oldIndex, 1);
    newOrder.splice(newIndex, 0, moved);
    reorderNotes(newOrder.map((n) => n.id));
  };

  const handleDeleteRequest = (note) => {
    setNoteToDelete(note);
    setShowConfirmDelete(true);
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="sticky top-0 z-20 bg-[#0F0F0F] px-8 py-6 flex items-center justify-between border-b border-kb-border">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold font-neutra">{t('notes.title')}</h2>
        </div>
        <Button
          variant="primary"
          className="text-[16px]"
          onClick={() => setIsModalOpen(true)}
        >
          {t('notes.newNote')}
        </Button>
      </div>

      <div className="px-8 pb-6 pt-10">
        <div className="max-w-3xl space-y-3">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sortedNotes.map((n) => n.id)}
              strategy={verticalListSortingStrategy}
            >
              {sortedNotes.map((note) => (
                <SortableNoteItem
                  key={note.id}
                  note={note}
                  onSelect={selectNote}
                  onDelete={handleDeleteRequest}
                />
              ))}
            </SortableContext>
          </DndContext>

          {notes.length === 0 && (
            <div className="text-center py-12 text-kb-text-secondary text-sm">
              {t('notes.empty')}
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirmDelete}
        title={t('note.deleteConfirmTitle')}
        message={t('note.deleteConfirmMessage')}
        onConfirm={() => {
          if (noteToDelete) deleteNote(noteToDelete.id);
          setShowConfirmDelete(false);
          setNoteToDelete(null);
        }}
        onCancel={() => {
          setShowConfirmDelete(false);
          setNoteToDelete(null);
        }}
      />
      <CreateNoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={createNote}
      />
    </div>
  );
}
