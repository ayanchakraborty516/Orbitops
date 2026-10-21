import React from 'react';
import { Loader2 } from 'lucide-react';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  icon: Icon,
  type = 'button',
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-md transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-[#C65D3A] disabled:opacity-50 disabled:cursor-not-allowed select-none border text-xs tracking-wide';

  const variants = {
    primary:
      'bg-[#C65D3A] hover:bg-[#B24F2E] text-white border-[#B24F2E] dark:bg-[#D9734E] dark:hover:bg-[#C65D3A] dark:border-[#C65D3A] shadow-xs active:translate-y-px',
    secondary:
      'bg-[#FAF7F2] hover:bg-[#E5DED2] text-[#24251F] border-[#D8D0C3] dark:bg-[#20221E] dark:hover:bg-[#2A2C27] dark:text-[#EAE7E0] dark:border-[#353831]',
    outline:
      'bg-transparent hover:bg-[#FAF7F2] dark:hover:bg-[#20221E] text-[#24251F] dark:text-[#EAE7E0] border-[#D8D0C3] dark:border-[#353831]',
    ghost:
      'bg-transparent hover:bg-[#E5DED2]/50 dark:hover:bg-[#2A2C27] text-[#57554D] dark:text-[#B8B5AC] hover:text-[#24251F] dark:hover:text-[#EAE7E0] border-transparent',
    danger:
      'bg-[#A84332] hover:bg-[#913728] text-white border-[#913728] shadow-xs active:translate-y-px',
  };

  const sizes = {
    sm: 'text-[11px] px-2.5 py-1.5 gap-1.5 font-medium',
    md: 'text-xs px-3.5 py-2 gap-2 font-medium',
    lg: 'text-sm px-5 py-2.5 gap-2.5 font-semibold',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
      ) : Icon ? (
        <Icon className="w-3.5 h-3.5 shrink-0" />
      ) : null}
      {children}
    </button>
  );
}

export default Button;
