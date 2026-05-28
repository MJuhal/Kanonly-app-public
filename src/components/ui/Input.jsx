export function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full bg-kb-card border border-kb-border rounded-lg px-3 py-2 text-kb-text placeholder-kb-text-secondary focus:outline-none focus:border-kb-text-secondary transition-colors ${className}`}
      {...props}
    />
  );
}

export function TextArea({ className = '', ...props }) {
  return (
    <textarea
      className={`w-full bg-kb-card border border-kb-border rounded-lg px-3 py-2 text-kb-text placeholder-kb-text-secondary focus:outline-none focus:border-kb-text-secondary transition-colors resize-y ${className}`}
      {...props}
    />
  );
}
