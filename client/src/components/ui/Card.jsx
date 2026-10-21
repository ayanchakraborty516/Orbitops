import React from 'react';

export function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={`bg-[#FAF7F2] dark:bg-[#20221E] border border-[#D8D0C3] dark:border-[#353831] rounded-lg shadow-xs transition-all duration-150 ${
        hover ? 'hover:border-[#C4BCAC] dark:hover:border-[#4B4E46]' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', title, description, action }) {
  return (
    <div className={`p-4 sm:p-5 border-b border-[#E5DED2] dark:border-[#2D302A] flex items-center justify-between ${className}`}>
      <div>
        {title && <h3 className="font-editorial text-base sm:text-lg font-medium text-[#24251F] dark:text-[#EAE7E0] tracking-tight">{title}</h3>}
        {description && <p className="text-[11px] text-[#7E7B72] dark:text-[#87857C] mt-0.5">{description}</p>}
        {children}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function CardBody({ children, className = '' }) {
  return <div className={`p-4 sm:p-5 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={`p-3.5 sm:p-4 border-t border-[#E5DED2] dark:border-[#2D302A] bg-[#F3EFE7]/50 dark:bg-[#181916]/50 rounded-b-lg flex items-center justify-between text-xs ${className}`}>
      {children}
    </div>
  );
}

export default Card;
