import { useRef, useEffect, useCallback } from 'react';
import { Bold, Italic, Strikethrough, Code, FileCode } from 'lucide-react';

function insertHtmlAtCursor(html) {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;
  const range = selection.getRangeAt(0);
  range.deleteContents();
  const fragment = range.createContextualFragment(html);
  range.insertNode(fragment);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

export function RichTextEditor({ value, onChange, onBlur, placeholder }) {
  const ref = useRef(null);
  const isComposing = useRef(false);

  // Sincronizar valor externo con el div
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.innerHTML !== value) {
      el.innerHTML = value || '';
      if (!value && placeholder) {
        el.setAttribute('data-placeholder', placeholder);
      }
    }
  }, [value]);

  const emit = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const html = el.innerHTML;
    onChange({ target: { value: html } });
  }, [onChange]);

  const handleFormat = useCallback((type) => {
    const el = ref.current;
    if (!el) return;
    el.focus();

    switch (type) {
      case 'bold':
        document.execCommand('bold', false, null);
        break;
      case 'italic':
        document.execCommand('italic', false, null);
        break;
      case 'strike':
        document.execCommand('strikeThrough', false, null);
        break;
      case 'codeInline': {
        const sel = window.getSelection();
        const text = sel.toString();
        insertHtmlAtCursor(`<code class="inline-code">${text || 'código'}</code>&nbsp;`);
        break;
      }
      case 'codeBlock': {
        const sel2 = window.getSelection();
        const text2 = sel2.toString();
        insertHtmlAtCursor(`<pre><code>${text2 || 'Escribí tu código aquí...'}</code></pre><br>`);
        break;
      }
      default:
        return;
    }

    emit();
  }, [emit]);

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

  const handleInput = () => {
    if (isComposing.current) return;
    emit();
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-1 mb-2">
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
          onClick={() => handleFormat('codeInline')}
          title="Código inline"
          className="p-1.5 text-kb-text-secondary hover:text-kb-text hover:bg-kb-hover rounded transition-colors"
        >
          <Code size={14} />
        </button>
        <button
          onClick={() => handleFormat('codeBlock')}
          title="Bloque de código"
          className="p-1.5 text-kb-text-secondary hover:text-kb-text hover:bg-kb-hover rounded transition-colors"
        >
          <FileCode size={14} />
        </button>
      </div>

      {/* Editor */}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={onBlur}
        onKeyDown={handleKeyDown}
        onCompositionStart={() => { isComposing.current = true; }}
        onCompositionEnd={() => { isComposing.current = false; emit(); }}
        data-placeholder={placeholder}
        className="rich-text w-full min-h-[200px] bg-kb-card border border-kb-border rounded-lg px-3 py-2 text-sm text-kb-text focus:outline-none focus:border-kb-text-secondary transition-colors overflow-y-auto"
        style={{ maxHeight: '400px' }}
      />
    </div>
  );
}
