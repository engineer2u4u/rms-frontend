// Tailwind-styled Button primitive. Mirrors the Roster `.btn` look so this
// primitive and class-based buttons feel identical across the app.

const variants = {
  primary:   'bg-[#5566f2] hover:bg-[#7c8bff] text-white border-[#5566f2] shadow-sm',
  secondary: 'bg-white hover:bg-slate-50 text-slate-900 border-slate-200',
  outline:   'bg-white hover:bg-slate-50 text-slate-900 border-slate-200',
  ghost:     'bg-transparent hover:bg-slate-100 text-slate-700 border-transparent',
  danger:    'bg-red-600 hover:bg-red-500 text-white border-red-600 shadow-sm',
  success:   'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-600 shadow-sm',
  warn:      'bg-amber-500 hover:bg-amber-400 text-white border-amber-500 shadow-sm',
};

const sizes = {
  sm: 'h-7 px-3 text-[11px] rounded-md',
  md: 'h-8 px-3.5 text-[13px] rounded-lg',
  lg: 'h-10 px-5 text-[14px] font-semibold rounded-[10px]',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 border font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
