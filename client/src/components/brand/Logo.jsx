import React from 'react';

export function Logo({ size = 'md', showText = true, className = '' }) {
  const sizeMap = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-9 h-9',
    xl: 'w-11 h-11',
  };

  const textSizeMap = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Contemporary Studio Orbital Mark */}
      <svg
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeMap[size] || sizeMap.md} shrink-0`}
      >
        {/* Fine stone trajectory ring */}
        <circle
          cx="18"
          cy="18"
          r="15"
          className="stroke-[#C65D3A] dark:stroke-[#D9734E]"
          strokeWidth="1.5"
          strokeDasharray="4 2"
        />
        {/* Inner anchor orbit */}
        <ellipse
          cx="18"
          cy="18"
          rx="14"
          ry="7"
          transform="rotate(-25 18 18)"
          className="stroke-[#24251F] dark:stroke-[#EAE7E0]"
          strokeWidth="1.5"
        />
        {/* Core nucleus */}
        <circle cx="18" cy="18" r="4" className="fill-[#24251F] dark:fill-[#EAE7E0]" />
        {/* Satellite node in burnt orange */}
        <circle cx="28" cy="13" r="3" className="fill-[#C65D3A] dark:fill-[#D9734E]" />
      </svg>

      {showText && (
        <span className={`${textSizeMap[size] || textSizeMap.md} font-medium tracking-tight text-[#24251F] dark:text-[#EAE7E0] flex items-center gap-1`}>
          <span className="font-semibold tracking-normal">Orbit</span>
          <span className="font-editorial italic text-[#C65D3A] dark:text-[#D9734E] font-medium">Ops</span>
        </span>
      )}
    </div>
  );
}

export default Logo;
