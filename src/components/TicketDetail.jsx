import { useEffect, useMemo, useRef, useState } from 'react';
import { useBoardStore } from '../store/boardStore';
import { t } from '../i18n';
import { Input } from './ui/Input';
import { RichTextEditor } from './RichTextEditor';
import { ConfirmModal } from './ConfirmModal';
import { isHtml, markdownToHtml } from '../lib/htmlHelpers';
import { X, Trash2, Image } from 'lucide-react';

function formatDate(timestamp) {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatDateTime(timestamp) {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function toDateInputValue(timestamp) {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${year}-${month}-${day}`;
}

function fromDateInputValue(value) {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day).getTime();
}

function parseDeadline(deadline) {
  if (!deadline) return { day: '', month: '', year: '' };
  const d = new Date(deadline);
  if (isNaN(d.getTime())) return { day: '', month: '', year: '' };
  return {
    day: String(d.getDate()).padStart(2, '0'),
    month: String(d.getMonth() + 1).padStart(2, '0'),
    year: String(d.getFullYear()),
  };
}

function buildDeadline(day, month, year) {
  const d = Number(day);
  const m = Number(month);
  const y = Number(year);
  if (!d || !m || !y) return null;
  const date = new Date(y, m - 1, d);
  if (isNaN(date.getTime())) return null;
  if (date.getDate() !== d || date.getMonth() !== m - 1 || date.getFullYear() !== y) return null;
  return date.getTime();
}

function normalizeToDay(ts) {
  const d = new Date(ts);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function ensureHtml(text) {
  if (!text) return '';
  return isHtml(text) ? text : markdownToHtml(text);
}

export function TicketDetail() {
  const tickets = useBoardStore((s) => s.tickets);
  const columns = useBoardStore((s) => s.columns);
  const selectedTicketId = useBoardStore((s) => s.selectedTicketId);
  const closeTicketDetail = useBoardStore((s) => s.closeTicketDetail);
  const updateTicket = useBoardStore((s) => s.updateTicket);
  const deleteTicket = useBoardStore((s) => s.deleteTicket);
  const moveTicket = useBoardStore((s) => s.moveTicket);


  const ticket = useMemo(
    () => tickets.find((t) => t.id === selectedTicketId),
    [tickets, selectedTicketId]
  );

  const fileInputRef = useRef(null);
  const debounceRef = useRef(null);

  const [localTitle, setLocalTitle] = useState('');
  const [localDescription, setLocalDescription] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);



  const [hasDeadline, setHasDeadline] = useState(!!ticket?.deadline);
  const [deadlineDay, setDeadlineDay] = useState('');
  const [deadlineMonth, setDeadlineMonth] = useState('');
  const [deadlineYear, setDeadlineYear] = useState('');
  const [deadlineError, setDeadlineError] = useState('');

  useEffect(() => {
    if (ticket) {
      setLocalTitle(ticket.title);
      const desc = ensureHtml(ticket.description);
      if (desc !== ticket.description) {
        updateTicket(ticket.id, { description: desc });
      }
      setLocalDescription(desc);
      const dl = parseDeadline(ticket.deadline);
      setHasDeadline(!!ticket.deadline);
      setDeadlineDay(dl.day);
      setDeadlineMonth(dl.month);
      setDeadlineYear(dl.year);
      setDeadlineError('');
    }
  }, [ticket?.id]);

  if (!ticket) return null;

  const displayId = ticket.displayId || ticket.id;
  const currentColumn = columns.find((c) => c.id === ticket.columnId);
  const boardColumns = columns.filter((c) => c.boardId === currentColumn?.boardId);

  const flushUpdate = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    const updates = {};
    if (localTitle !== ticket.title) updates.title = localTitle;
    if (localDescription !== ticket.description) updates.description = localDescription;
    if (Object.keys(updates).length > 0) {
      updateTicket(ticket.id, updates);
    }
  };

  const scheduleUpdate = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      const updates = {};
      if (localTitle !== ticket.title) updates.title = localTitle;
      if (localDescription !== ticket.description) updates.description = localDescription;
      if (Object.keys(updates).length > 0) {
        updateTicket(ticket.id, updates);
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

  const validateAndSaveDeadline = (day, month, year, enabled) => {
    if (!enabled) {
      updateTicket(ticket.id, { deadline: null });
      setDeadlineError('');
      return;
    }
    const deadline = buildDeadline(day, month, year);
    if (!deadline) {
      setDeadlineError(t('ticket.deadlineInvalid'));
      return;
    }
    if (deadline < normalizeToDay(ticket.createdAt)) {
      setDeadlineError(t('ticket.deadlineBeforeCreation'));
      return;
    }
    setDeadlineError('');
    updateTicket(ticket.id, { deadline });
  };

  const handleDeadlineToggle = (enabled) => {
    setHasDeadline(enabled);
    if (!enabled) {
      updateTicket(ticket.id, { deadline: null });
      setDeadlineError('');
    } else {
      validateAndSaveDeadline(deadlineDay, deadlineMonth, deadlineYear, true);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      updateTicket(ticket.id, { images: [...ticket.images, reader.result] });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveImage = (idx) => {
    const updated = ticket.images.filter((_, i) => i !== idx);
    updateTicket(ticket.id, { images: updated });
  };

  const handleDelete = () => setShowConfirm(true);
  const confirmDelete = () => {
    deleteTicket(ticket.id);
    setShowConfirm(false);
    closeTicketDetail();
  };

  const linkify = (html) => {
    const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`\[\]]+|www\.[^\s<>"{}|\\^`\[\]]+\.[^\s<>"{}|\\^`\[\]]+)/g;
    return html.replace(urlRegex, (url) => {
      const href = url.startsWith('http') ? url : `https://${url}`;
      return `<a href="${href}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => { flushUpdate(); closeTicketDetail(); }}
      />

      <div className="relative w-full max-w-2xl bg-kb-card border-l border-kb-border h-full overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-kb-card border-b border-kb-border px-6 py-4 flex items-center justify-between z-10">
          <div className="flex-1 min-w-0 mr-4">
            <p className="text-xs text-kb-text-secondary mb-1">ID: {displayId}</p>
            <Input
              value={localTitle}
              onChange={handleTitleChange}
              onBlur={flushUpdate}
              className="font-bold text-lg bg-transparent border-none px-0 py-0 focus:ring-0 w-full font-neutra"
            />
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleDelete}
              title={t('ticket.deleteTooltip')}
              className="p-2 text-kb-text-secondary hover:text-red-400 rounded-lg hover:bg-kb-hover transition-colors"
            >
              <Trash2 size={18} />
            </button>
            <button
              onClick={() => { flushUpdate(); closeTicketDetail(); }}
              className="p-2 text-kb-text-secondary hover:text-kb-text rounded-lg hover:bg-kb-hover transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Estado y Prioridad */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-kb-text-secondary mb-1.5 uppercase tracking-wide">{t('ticket.state')}</label>
              <select
                value={ticket.columnId}
                onChange={(e) => moveTicket(ticket.id, e.target.value)}
                className="w-full bg-kb-bg border border-kb-border rounded-lg px-3 py-2 text-sm text-kb-text focus:outline-none focus:border-kb-text-secondary"
              >
                {boardColumns.map((col) => (
                  <option key={col.id} value={col.id}>{col.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-kb-text-secondary mb-1.5 uppercase tracking-wide">{t('ticket.priority')}</label>
              <PrioritySelect value={ticket.priority || 'medium'} onChange={(v) => updateTicket(ticket.id, { priority: v })} />
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-10">
            <div>
              <label className="block text-xs text-kb-text-secondary mb-1.5 uppercase tracking-wide">{t('ticket.creation')}</label>
              <div className="w-full bg-kb-bg border border-kb-border rounded-lg px-3 py-2 text-sm text-kb-text">
                {formatDate(ticket.createdAt)}
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs text-kb-text-secondary mb-1.5 uppercase tracking-wide cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasDeadline}
                  onChange={(e) => handleDeadlineToggle(e.target.checked)}
                  className="accent-kb-text-secondary"
                />
                {t('ticket.deadline')}
              </label>
              {hasDeadline && (
                <>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="31"
                      placeholder="DD"
                      value={deadlineDay}
                      onChange={(e) => {
                        setDeadlineDay(e.target.value);
                        validateAndSaveDeadline(e.target.value, deadlineMonth, deadlineYear, true);
                      }}
                      className="w-14 bg-kb-bg border border-kb-border rounded-lg px-2 py-2 text-sm text-kb-text focus:outline-none focus:border-kb-text-secondary text-center"
                    />
                    <span className="text-kb-text-secondary">/</span>
                    <select
                      value={deadlineMonth}
                      onChange={(e) => {
                        setDeadlineMonth(e.target.value);
                        validateAndSaveDeadline(deadlineDay, e.target.value, deadlineYear, true);
                      }}
                      className="w-24 bg-kb-bg border border-kb-border rounded-lg px-2 py-2 text-sm text-kb-text focus:outline-none focus:border-kb-text-secondary"
                    >
                      <option value="">Mes</option>
                      <option value="01">Enero</option>
                      <option value="02">Febrero</option>
                      <option value="03">Marzo</option>
                      <option value="04">Abril</option>
                      <option value="05">Mayo</option>
                      <option value="06">Junio</option>
                      <option value="07">Julio</option>
                      <option value="08">Agosto</option>
                      <option value="09">Septiembre</option>
                      <option value="10">Octubre</option>
                      <option value="11">Noviembre</option>
                      <option value="12">Diciembre</option>
                    </select>
                    <span className="text-kb-text-secondary">/</span>
                    <input
                      type="number"
                      min="1900"
                      max="9999"
                      placeholder="AAAA"
                      value={deadlineYear}
                      onChange={(e) => {
                        setDeadlineYear(e.target.value);
                        validateAndSaveDeadline(deadlineDay, deadlineMonth, e.target.value, true);
                      }}
                      className="w-20 bg-kb-bg border border-kb-border rounded-lg px-2 py-2 text-sm text-kb-text focus:outline-none focus:border-kb-text-secondary text-center"
                    />
                  </div>
                  {deadlineError && (
                    <p className="text-xs text-red-400 mt-1">{deadlineError}</p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Descripción con RichTextEditor */}
          <div>
            <label className="block text-xs text-kb-text-secondary mb-1.5 uppercase tracking-wide">Descripción</label>
            <RichTextEditor
              value={localDescription}
              onChange={handleDescriptionChange}
              onBlur={flushUpdate}
              placeholder={t('ticket.descriptionPlaceholder')}
            />
          </div>

          {/* Imágenes */}
          <div>
            <label className="block text-xs text-kb-text-secondary mb-1.5 uppercase tracking-wide">Imágenes</label>
            <div
              className="grid grid-cols-2 gap-2"
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
                files.forEach((file) => {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    updateTicket(ticket.id, { images: [...ticket.images, reader.result] });
                  };
                  reader.readAsDataURL(file);
                });
              }}
            >
              {ticket.images.map((img, idx) => (
                <div key={idx} className="relative group rounded-lg overflow-hidden border border-kb-border">
                  <img src={img} alt={`Imagen ${idx + 1}`} className="w-full h-32 object-cover" />
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
                <span className="text-xs">{t('ticket.addImage')}</span>
              </button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </div>


        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        title={t('ticket.deleteConfirmTitle')}
        message={t('ticket.deleteConfirmMessage')}
        onConfirm={confirmDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}

function PrioritySelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const config = {
    low: { label: t('ticket.priorityLow'), color: 'bg-green-500' },
    medium: { label: t('ticket.priorityMedium'), color: 'bg-yellow-500' },
    high: { label: t('ticket.priorityHigh'), color: 'bg-red-500' },
  };

  const current = config[value] || config.medium;

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full bg-kb-bg border border-kb-border rounded-lg px-3 py-2 text-sm text-kb-text focus:outline-none focus:border-kb-text-secondary flex items-center justify-between"
      >
        <span className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${current.color}`} />
          {current.label}
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-kb-text-secondary"><path d="m6 9 6 6 6-6"/></svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-kb-card border border-kb-border rounded-lg shadow-xl z-30 overflow-hidden">
          {Object.entries(config).map(([key, conf]) => (
            <button
              key={key}
              onClick={() => { onChange(key); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-kb-hover transition-colors ${value === key ? 'text-kb-text' : 'text-kb-text-secondary'}`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${conf.color}`} />
              {conf.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
