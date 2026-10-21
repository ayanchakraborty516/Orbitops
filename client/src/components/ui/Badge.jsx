import React from 'react';

export function Badge({ children, variant = 'default', size = 'sm', dot = false, className = '' }) {
  const variants = {
    // General Studio Tags
    default: 'bg-[#ECE7DE] dark:bg-[#2A2C27] text-[#57554D] dark:text-[#B8B5AC] border-[#D8D0C3] dark:border-[#353831]',
    primary: 'bg-[#FAF0EB] dark:bg-[#2F2420] text-[#C65D3A] dark:text-[#D9734E] border-[#F0D5C9] dark:border-[#523A31]',
    success: 'bg-[#EBF1ED] dark:bg-[#1E2822] text-[#345E40] dark:text-[#78A885] border-[#D3E2D7] dark:border-[#2D3E32]',
    warning: 'bg-[#F9F3E8] dark:bg-[#2D281E] text-[#8C6221] dark:text-[#D4B072] border-[#EADAC0] dark:border-[#463D2A]',
    danger: 'bg-[#F9ECE9] dark:bg-[#2F2120] text-[#A84332] dark:text-[#E28373] border-[#EACCC6] dark:border-[#523432]',
    info: 'bg-[#EAF0F6] dark:bg-[#1F262F] text-[#365A82] dark:text-[#88B0DE] border-[#CFDFEF] dark:border-[#2F3B4A]',

    // Service Status
    operational: 'bg-[#EBF1ED] dark:bg-[#1E2822] text-[#345E40] dark:text-[#78A885] border-[#D3E2D7] dark:border-[#2D3E32]',
    degraded_performance: 'bg-[#F9F3E8] dark:bg-[#2D281E] text-[#8C6221] dark:text-[#D4B072] border-[#EADAC0] dark:border-[#463D2A]',
    partial_outage: 'bg-[#FAF0EB] dark:bg-[#2F2420] text-[#C65D3A] dark:text-[#D9734E] border-[#F0D5C9] dark:border-[#523A31]',
    major_outage: 'bg-[#F9ECE9] dark:bg-[#2F2120] text-[#A84332] dark:text-[#E28373] border-[#EACCC6] dark:border-[#523432]',
    under_maintenance: 'bg-[#EAF0F6] dark:bg-[#1F262F] text-[#365A82] dark:text-[#88B0DE] border-[#CFDFEF] dark:border-[#2F3B4A]',

    // Priorities
    low: 'bg-[#ECE7DE] dark:bg-[#2A2C27] text-[#7E7B72] dark:text-[#87857C] border-[#D8D0C3] dark:border-[#353831]',
    medium: 'bg-[#EAF0F6] dark:bg-[#1F262F] text-[#365A82] dark:text-[#88B0DE] border-[#CFDFEF] dark:border-[#2F3B4A]',
    high: 'bg-[#F9F3E8] dark:bg-[#2D281E] text-[#8C6221] dark:text-[#D4B072] border-[#EADAC0] dark:border-[#463D2A]',
    critical: 'bg-[#F9ECE9] dark:bg-[#2F2120] text-[#A84332] dark:text-[#E28373] border-[#EACCC6] dark:border-[#523432] font-semibold',

    // Kanban Statuses
    backlog: 'bg-[#ECE7DE] dark:bg-[#2A2C27] text-[#7E7B72] dark:text-[#87857C] border-[#D8D0C3] dark:border-[#353831]',
    todo: 'bg-[#FAF7F2] dark:bg-[#20221E] text-[#57554D] dark:text-[#B8B5AC] border-[#D8D0C3] dark:border-[#353831]',
    in_progress: 'bg-[#FAF0EB] dark:bg-[#2F2420] text-[#C65D3A] dark:text-[#D9734E] border-[#F0D5C9] dark:border-[#523A31] font-medium',
    in_review: 'bg-[#F3EFF8] dark:bg-[#26202C] text-[#6E4B92] dark:text-[#B696D8] border-[#DFD4EC] dark:border-[#423450]',
    done: 'bg-[#EBF1ED] dark:bg-[#1E2822] text-[#345E40] dark:text-[#78A885] border-[#D3E2D7] dark:border-[#2D3E32]',
    canceled: 'bg-[#ECE7DE] dark:bg-[#2A2C27] text-[#7E7B72] line-through border-[#D8D0C3]',
  };

  const sizes = {
    xs: 'text-[9px] px-1.5 py-0.5 gap-1 font-mono uppercase tracking-wider',
    sm: 'text-[10px] px-2 py-0.5 gap-1.5 font-mono uppercase tracking-wider',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
  };

  const dotColors = {
    operational: 'bg-[#345E40] dark:bg-[#78A885]',
    degraded_performance: 'bg-[#8C6221] dark:bg-[#D4B072]',
    partial_outage: 'bg-[#C65D3A] dark:bg-[#D9734E]',
    major_outage: 'bg-[#A84332] dark:bg-[#E28373]',
    critical: 'bg-[#A84332] dark:bg-[#E28373]',
    in_progress: 'bg-[#C65D3A] dark:bg-[#D9734E]',
    done: 'bg-[#345E40] dark:bg-[#78A885]',
    default: 'bg-[#7E7B72]',
  };

  return (
    <span
      className={`inline-flex items-center rounded border select-none ${
        variants[variant] || variants.default
      } ${sizes[size] || sizes.sm} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant] || dotColors.default}`}
        />
      )}
      {children}
    </span>
  );
}

export default Badge;
