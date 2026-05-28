import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function parseMarkdown(text) {
  if (!text) return '';

  let html = escapeHtml(text);

  // Bloques de código multilinea (```...```)
  html = html.replace(/```([\s\S]*?)```/g, (match, code) => {
    const cleanCode = code.replace(/^\n/, '').replace(/\n$/, '');
    return `<div class="code-block" data-code="${encodeURIComponent(cleanCode)}"><pre><code>${escapeHtml(cleanCode)}</code></pre></div>`;
  });

  // Negrita **texto**
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-white">$1</strong>');

  // Cursiva *texto* (pero no si ya es parte de **)
  html = html.replace(/(^|[^*])\*(?!\*)(.+?)\*(?!\*)/g, '$1<em class="italic">$2</em>');

  // Tachado ~~texto~~
  html = html.replace(/~~(.+?)~~/g, '<s class="line-through opacity-70">$1</s>');

  // Código inline `texto`
  html = html.replace(/`(.+?)`/g, '<code class="inline-code bg-kb-bg px-1 py-0.5 rounded text-xs font-mono text-yellow-300">$1</code>');

  // URLs autodetectadas
  html = html.replace(/(https?:\/\/[^\s<>"{}|\\^`\[\]]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300">$1</a>');

  // Saltos de línea
  html = html.replace(/\n/g, '<br>');

  return html;
}

function CodeBlock({ code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const textarea = document.createElement('textarea');
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative group my-3">
      <div className="bg-[#1a1a1a] border border-kb-border rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-kb-border bg-[#141414]">
          <span className="text-xs text-kb-text-secondary">Código</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs text-kb-text-secondary hover:text-kb-text transition-colors px-2 py-1 rounded hover:bg-kb-hover"
          >
            {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
            {copied ? 'Copiado' : 'Copiar'}
          </button>
        </div>
        <pre className="p-3 overflow-x-auto text-sm text-kb-text font-mono leading-relaxed">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

export function MarkdownPreview({ text }) {
  if (!text || !text.trim()) {
    return <p className="text-kb-text-secondary text-sm italic">Sin descripción</p>;
  }

  // Parsear bloques de código primero para manejarlos como componentes React
  const parts = [];
  let lastIndex = 0;
  const codeBlockRegex = /```([\s\S]*?)```/g;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    const before = text.slice(lastIndex, match.index);
    if (before) {
      parts.push({ type: 'html', content: parseMarkdown(before) });
    }
    parts.push({ type: 'code', code: match[1].replace(/^\n/, '').replace(/\n$/, '') });
    lastIndex = match.index + match[0].length;
  }

  const after = text.slice(lastIndex);
  if (after) {
    parts.push({ type: 'html', content: parseMarkdown(after) });
  }

  if (parts.length === 0) {
    parts.push({ type: 'html', content: parseMarkdown(text) });
  }

  return (
    <div className="text-sm text-kb-text leading-relaxed">
      {parts.map((part, idx) =>
        part.type === 'code' ? (
          <CodeBlock key={idx} code={part.code} />
        ) : (
          <div key={idx} dangerouslySetInnerHTML={{ __html: part.content }} />
        )
      )}
    </div>
  );
}
