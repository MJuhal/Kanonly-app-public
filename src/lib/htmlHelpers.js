export function isHtml(text) {
  if (!text) return false;
  return /<\/?(b|i|em|strong|strike|s|code|pre|a|br|div|span|p|ul|ol|li|h[1-6]|blockquote)[\s>]/i.test(text);
}

export function markdownToHtml(text) {
  if (!text) return '';

  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  html = html.replace(/```([\s\S]*?)```/g, (match, code) => {
    const clean = code.replace(/^\n/, '').replace(/\n$/, '');
    return `<pre><code>${clean.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
  });

  html = html.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  html = html.replace(/(^|[^*])\*(?!\*)(.+?)\*(?!\*)/g, '$1<i>$2</i>');
  html = html.replace(/~~(.+?)~~/g, '<strike>$1</strike>');
  html = html.replace(/`(.+?)`/g, '<code class="inline-code">$1</code>');
  html = html.replace(/(https?:\/\/[^\s<>"{}|\\^`\[\]]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
  html = html.replace(/\n/g, '<br>');

  return html;
}
