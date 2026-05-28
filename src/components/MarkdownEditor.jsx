import { useState, useRef, useCallback } from 'react';
import { Bold, Italic, Strikethrough, Code, Eye, Pencil } from 'lucide-react';
import { MarkdownPreview } from './MarkdownPreview';

function insertAround(textarea, before, after) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const value = textarea.value;
  const selected = value.slice(start, end);

  const newValue = value.slice(0, start) + before + selected + after + value.slice(end);
  const newCursor = start + before.length + selected.length;

  return { newValue, cursorStart: newCursor, cursorEnd: newCursor };
}

export function MarkdownEditor({ value, onChange, onBlur, placeholder, rows = 16 }) {
  const [mode, setMode] = useState('edit'); // 'edit' | 'preview'
  const textareaRef = useRef(null);

  const handleFormat = useCallback((type) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    let result;
    switch (type) {
      case 'bold':
        result = insertAround(textarea, '**', '**');
        break;
      case 'italic':
        result = insertAround(textarea, '*', '*');
        break;
      case 'strike':
        result = insertAround(textarea, '~~', '~~');
        break;
      case 'code':
        result = insertAround(textarea, '\n```\n', '\n```\n');
        break;
      default:
        return;
    }

    onChange({ target: { value: result.newValue } });

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(result.cursorStart, result.cursorEnd);
    });
  }, [onChange]);

  const handleKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          handleFormat('bold');
          break;
        case 'i':
          e.preventDefault();
          handleFormat('italic');
          break;
        case 'u':
          e.preventDefault();
          handleFormat('strike');
          break;
      }
    }
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleFormat('bold')}
            title="Negrita (Ctrl+B)"
            className="p-1.5 text-kb-text-secondary hover:text-kb-text hover:bg-kb-hover rounded transition-colors"
          >
            <Bold size={14} />
          </button>
          <button
            onClick={() => handleFormat('italic')}
            title="Cursiva (Ctrl+I)"
            className="p-1.5 text-kb-text-secondary hover:text-kb-text hover:bg-kb-hover rounded transition-colors"
          >
            <Italic size={14} />
          </button>
          <button
            onClick={() => handleFormat('strike')}
            title="Tachado (Ctrl+U)"
            className="p-1.5 text-kb-text-secondary hover:text-kb-text hover:bg-kb-hover rounded transition-colors"
          >
            <Strikethrough size={14} />
          </button>
          <button
            onClick={() => handleFormat('code')}
            title="Bloque de código"
            className="p-1.5 text-kb-text-secondary hover:text-kb-text hover:bg-kb-hover rounded transition-colors"
          >
            <Code size={14} />
          </button>
        </div>

        <button
          onClick={() => setMode(mode === 'edit' ? 'preview' : 'edit')}
          className="flex items-center gap-1 text-xs text-kb-text-secondary hover:text-kb-text px-2 py-1 rounded hover:bg-kb-hover transition-colors"
        >
          {mode === 'edit' ? <><Eye size={12} /> Vista previa</> : <><Pencil size={12} /> Editar</>}
        </button>
      </div>

      {mode === 'edit' ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={rows}
          className="w-full bg-kb-card border border-kb-border rounded-lg px-3 py-2 text-kb-text placeholder-kb-text-secondary focus:outline-none focus:border-kb-text-secondary transition-colors resize-y font-mono text-sm leading-relaxed"
        />
      ) : (
        <div className="w-full bg-kb-bg border border-kb-border rounded-lg px-3 py-2 min-h-[200px]">
          <MarkdownPreview text={value} />
        </div>
      )}
    </div>
  );
}
