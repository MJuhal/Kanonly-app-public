import { X } from 'lucide-react';
import { t } from '../i18n';

export function ConfirmModal({ isOpen, title, message, confirmText = t('confirm.confirm'), cancelText = t('confirm.cancel'), onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-kb-card border border-kb-border rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 p-1 text-kb-text-secondary hover:text-kb-text rounded-lg hover:bg-kb-hover transition-colors"
        >
          <X size={18} />
        </button>

        <h3 className="text-lg font-bold mb-2 pr-6">{title}</h3>
        <p className="text-sm text-kb-text-secondary mb-6">{message}</p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-kb-text-secondary hover:text-kb-text bg-kb-bg hover:bg-kb-hover rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
