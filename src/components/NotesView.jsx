import { useState } from 'react';
import { useBoardStore } from '../store/boardStore';
import { t } from '../i18n';
import { Button } from './ui/Button';
import { CreateNoteModal } from './CreateNoteModal';
import { Plus, Trash2 } from 'lucide-react';

const priorityColors = {
  high: 'bg-red-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500',
};

export function NotesView() {
  const notes = useBoardStore((s) => s.notes);
  const selectNote = useBoardStore((s) => s.selectNote);
  const createNote = useBoardStore((s) => s.createNote);
  const deleteNote = useBoardStore((s) => s.deleteNote);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex-1 flex flex-col">
      <div className="sticky top-0 z-20 bg-[#0F0F0F] px-8 py-6 flex items-center justify-between border-b border-kb-border">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold">{t('notes.title')}</h2>
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
          {notes.map((note) => (
            <div
              key={note.id}
              onClick={() => selectNote(note.id)}
              className="bg-kb-card border border-kb-border rounded-lg p-4 cursor-pointer hover:border-kb-text-secondary transition-all duration-200 group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {note.priority && (
                      <span
                        className={`w-2 h-2 rounded-full ${priorityColors[note.priority] || 'bg-kb-text-secondary'}`}
                        title={`Prioridad: ${note.priority}`}
                      />
                    )}
                    <p className="text-sm font-medium truncate group-hover:text-white transition-colors">
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
                    deleteNote(note.id);
                  }}
                  className="p-1.5 text-kb-text-secondary hover:text-red-400 rounded transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          {notes.length === 0 && (
            <div className="text-center py-12 text-kb-text-secondary text-sm">
              {t('notes.empty')}
            </div>
          )}
        </div>
      </div>

      <CreateNoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={createNote}
      />
    </div>
  );
}
