import { useState } from 'react';
import { t } from '../i18n';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { EmojiPicker } from './EmojiPicker';

export function CreateNoteModal({ isOpen, onClose, onCreate }) {
  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreate(title.trim(), icon);
    setTitle('');
    setIcon(null);
    onClose();
  };

  const handleClose = () => {
    setTitle('');
    setIcon(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('modal.createNote')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-2">
          <EmojiPicker
            selected={icon}
            onSelect={setIcon}
            onClear={() => setIcon(null)}
          />
          <Input
            placeholder={t('modal.noteTitlePlaceholder')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            className="flex-1"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={handleClose}>
            {t('modal.cancel')}
          </Button>
          <Button type="submit">Crear</Button>
        </div>
      </form>
    </Modal>
  );
}
