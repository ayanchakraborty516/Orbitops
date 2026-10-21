import React from 'react';
import { Button } from './Button.jsx';

export function EmptyState({
  icon: Icon,
  title = 'No records in view',
  description = 'There are no active records matching the selected studio parameters.',
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-10 sm:p-14 text-center border border-dashed border-[#D8D0C3] dark:border-[#353831] rounded-lg bg-[#FAF7F2]/60 dark:bg-[#20221E]/60 ${className}`}>
      {Icon && (
        <div className="w-10 h-10 rounded-md bg-[#ECE7DE] dark:bg-[#2A2C27] text-[#C65D3A] dark:text-[#D9734E] flex items-center justify-center mb-3.5 border border-[#D8D0C3] dark:border-[#353831]">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <h3 className="font-editorial text-base font-medium text-[#24251F] dark:text-[#EAE7E0] mb-1">{title}</h3>
      <p className="text-xs text-[#7E7B72] dark:text-[#87857C] max-w-sm mb-4 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
