import { useState } from 'react';
import { t } from '../i18n';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

const COLUMN_COLORS = [
  '#FFFFFF', '#E5A853', '#4ADE80', '#EF4444', '#60A5FA',
  '#A78BFA', '#FB923C', '#F472B6', '#22D3EE', '#888888',
];

export function CreateColumnModal({ isOpen, onClose, onCreate }) {
  const [title, setTitle] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLUMN_COLORS[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreate(title.trim(), selectedColor);
    setTitle('');
    setSelectedColor(COLUMN_COLORS[0]);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('modal.createColumn')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder={t('modal.columnNamePlaceholder')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
        <div>
          <label className="block text-xs text-kb-text-secondary mb-2 uppercase tracking-wide">
            Color del título
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {COLUMN_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedColor(c)}
                className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${
                  selectedColor === c ? 'border-white scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            {t('modal.cancel')}
          </Button>
          <Button type="submit">Crear</Button>
        </div>
      </form>
    </Modal>
  );
}
