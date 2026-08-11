import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  icon?: ReactNode;
  iconRight?: ReactNode;
}

export function Button({ variant = 'primary', size = 'md', children, icon, iconRight, className = '', ...props }: ButtonProps) {
  const base = 'inline-flex items-center gap-2 font-medium transition-all duration-150 cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants: Record<string, string> = {
    primary: 'bg-cyan-400 text-[#070A0F] hover:bg-cyan-300 active:bg-cyan-500 focus-visible:outline-cyan-400 shadow-[0_0_16px_rgba(0,212,255,0.2)] hover:shadow-[0_0_24px_rgba(0,212,255,0.35)]',
    secondary: 'bg-violet-600 text-white hover:bg-violet-500 active:bg-violet-700 focus-visible:outline-violet-500',
    ghost: 'text-slate-300 hover:text-white hover:bg-white/5 active:bg-white/10 focus-visible:outline-white/30',
    danger: 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 focus-visible:outline-red-400',
    outline: 'border border-white/10 text-slate-300 hover:border-white/20 hover:text-white hover:bg-white/5 focus-visible:outline-white/30',
  };

  const sizes: Record<string, string> = {
    sm: 'text-[12px] px-3 py-1.5 rounded',
    md: 'text-[13px] px-4 py-2 rounded-md',
    lg: 'text-[14px] px-5 py-2.5 rounded-md font-semibold',
  };

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
      {iconRight && <span className="flex-shrink-0">{iconRight}</span>}
    </button>
  );
}
