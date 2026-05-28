import { useEffect, useRef, useState } from 'react';
import { useBoardStore } from '../store/boardStore';
import { t } from '../i18n';
import { Input } from './ui/Input';
import { RichTextEditor } from './RichTextEditor';
import { isHtml, markdownToHtml } from '../lib/htmlHelpers';
import { ConfirmModal } from './ConfirmModal';
import { X, Trash2, Image } from 'lucide-react';

function extractUrls(text) {
  if (!text) return [];
  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi;
  const matches = text.match(urlRegex) || [];
  return [...new Set(matches)];
}

function LinkList({ urls }) {
  if (!urls || urls.length === 0) return null;
  return (
    <div className="space-y-1.5 mt-3">
      <p className="text-xs text-kb-text-secondary uppercase tracking-wide">{t('note.linksDetected')}</p>
      {urls.map((url, idx) => (
        <a
          key={idx}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-sm text-blue-400 hover:text-blue-300 truncate"
        >
          {url}
        </a>
      ))}
    </div>
  );
}

export function NoteDetail() {
  const notes = useBoardStore((s) => s.notes);
  const selectedNoteId = useBoardStore((s) => s.selectedNoteId);
  const closeNoteDetail = useBoardStore((s) => s.closeNoteDetail);
  const updateNote = useBoardStore((s) => s.updateNote);
  const deleteNote = useBoardStore((s) => s.deleteNote);

  const note = notes.find((n) => n.id === selectedNoteId);
  const fileInputRef = useRef(null);
  const debounceRef = useRef(null);

  const [localTitle, setLocalTitle] = useState('');
  const [localDescription, setLocalDescription] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  function ensureHtml(text) {
    if (!text) return '';
    return isHtml(text) ? text : markdownToHtml(text);
  }

  useEffect(() => {
    if (note) {
      setLocalTitle(note.title);
      const desc = ensureHtml(note.description);
      if (desc !== note.description) {
        updateNote(note.id, { description: desc });
      }
      setLocalDescription(desc);
    }
  }, [note?.id]);

  if (!note) return null;

  const flushUpdate = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    const updates = {};
    if (localTitle !== note.title) updates.title = localTitle;
    if (localDescription !== note.description) updates.description = localDescription;
    if (Object.keys(updates).length > 0) {
      updateNote(note.id, updates);
    }
  };

  const scheduleUpdate = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      const updates = {};
      if (localTitle !== note.title) updates.title = localTitle;
      if (localDescription !== note.description) updates.description = localDescription;
      if (Object.keys(updates).length > 0) {
        updateNote(note.id, updates);
      }
    }, 500);
  };

  const handleTitleChange = (e) => {
    setLocalTitle(e.target.value);
    scheduleUpdate();
  };

  const handleDescriptionChange = (e) => {
    setLocalDescription(e.target.value);
    scheduleUpdate();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      updateNote(note.id, { images: [...note.images, reader.result] });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveImage = (idx) => {
    const updated = note.images.filter((_, i) => i !== idx);
    updateNote(note.id, { images: updated });
  };

  const handleDelete = () => {
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    deleteNote(note.id);
    setShowConfirm(false);
    closeNoteDetail();
  };

  const detectedUrls = extractUrls(localDescription);
  const allUrls = [...new Set([...(note.links || []), ...detectedUrls])];

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => { flushUpdate(); closeNoteDetail(); }}
      />

      <div className="relative w-full max-w-2xl bg-kb-card border-l border-kb-border h-full overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-kb-card border-b border-kb-border px-6 py-4 flex items-center justify-between z-10">
          <div className="flex-1 min-w-0 mr-4">
            <Input
              value={localTitle}
              onChange={handleTitleChange}
              onBlur={flushUpdate}
              className="font-bold text-lg bg-transparent border-none px-0 py-0 focus:ring-0 w-full"
            />
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleDelete}
              title={t('note.deleteTooltip')}
              className="p-2 text-kb-text-secondary hover:text-red-400 rounded-lg hover:bg-kb-hover transition-colors"
            >
              <Trash2 size={18} />
            </button>
            <button
              onClick={() => { flushUpdate(); closeNoteDetail(); }}
              className="p-2 text-kb-text-secondary hover:text-kb-text rounded-lg hover:bg-kb-hover transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Prioridad */}
          <div>
            <label className="block text-xs text-kb-text-secondary mb-1.5 uppercase tracking-wide">
              Prioridad
            </label>
            <select
              value={note.priority || 'medium'}
              onChange={(e) => updateNote(note.id, { priority: e.target.value })}
              className="w-full bg-kb-bg border border-kb-border rounded-lg px-3 py-2 text-sm text-kb-text focus:outline-none focus:border-kb-text-secondary"
            >
              <option value="low">{t('note.priorityLow')}</option>
              <option value="medium">{t('note.priorityMedium')}</option>
              <option value="high">{t('note.priorityHigh')}</option>
            </select>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs text-kb-text-secondary mb-1.5 uppercase tracking-wide">
              Descripción
            </label>
            <RichTextEditor
              value={localDescription}
              onChange={handleDescriptionChange}
              onBlur={flushUpdate}
              placeholder={t('note.descriptionPlaceholder')}
            />
            <LinkList urls={allUrls} />
          </div>

          {/* Imágenes */}
          <div>
            <label className="block text-xs text-kb-text-secondary mb-1.5 uppercase tracking-wide">
              Imágenes
            </label>
            <div className="grid grid-cols-2 gap-2">
              {note.images.map((img, idx) => (
                <div key={idx} className="relative group rounded-lg overflow-hidden border border-kb-border">
                  <img
                    src={img}
                    alt={`Imagen ${idx + 1}`}
                    className="w-full h-32 object-cover"
                  />
                  <button
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-black/60 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="h-32 border-2 border-dashed border-kb-border rounded-lg flex flex-col items-center justify-center text-kb-text-secondary hover:border-kb-text-secondary hover:text-kb-text transition-all"
              >
                <Image size={24} className="mb-1" />
                <span className="text-xs">{t('note.addImage')}</span>
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        title={t('note.deleteConfirmTitle')}
        message={t('note.deleteConfirmMessage')}
        onConfirm={confirmDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}
