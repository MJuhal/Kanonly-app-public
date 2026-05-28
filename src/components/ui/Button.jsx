export function Button({ children, variant = 'primary', className = '', ...props }) {
  const base = 'px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2';
  const styles = {
    primary: 'bg-white text-black hover:bg-gray-200',
    outline: 'border border-kb-text-secondary text-kb-text hover:border-kb-text hover:bg-kb-hover',
    ghost: 'text-kb-text-secondary hover:text-kb-text hover:bg-kb-hover',
    danger: 'bg-red-600 text-white hover:bg-red-500',
  };
  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
