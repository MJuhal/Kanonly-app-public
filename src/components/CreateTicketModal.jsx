import { useState } from 'react';
import { t } from '../i18n';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

export function CreateTicketModal({ isOpen, onClose, onCreate, columnTitle }) {
  const [title, setTitle] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreate(title.trim());
    setTitle('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Nuevo ticket en ${columnTitle}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder={t('modal.ticketTitlePlaceholder')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
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
