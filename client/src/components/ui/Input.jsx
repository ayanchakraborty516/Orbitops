import React from 'react';

export function Input({ label, error, helperText, className = '', id, icon: Icon, ...props }) {
  const inputId = id || props.name || Math.random().toString(36).substring(2, 9);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-[11px] font-semibold uppercase tracking-wider text-[#57554D] dark:text-[#B8B5AC]">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3 pointer-events-none text-[#7E7B72] dark:text-[#87857C]">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={inputId}
          className={`w-full text-xs rounded-md border bg-[#FAF7F2] dark:bg-[#181916] text-[#24251F] dark:text-[#EAE7E0] placeholder-[#7E7B72]/70 dark:placeholder-[#87857C]/60 transition-colors focus:outline-none focus:ring-1 focus:ring-[#C65D3A] focus:border-[#C65D3A] ${
            Icon ? 'pl-9 pr-3 py-2' : 'px-3 py-2'
          } ${
            error
              ? 'border-[#A84332] focus:ring-[#A84332]'
              : 'border-[#D8D0C3] dark:border-[#353831]'
          } ${className}`}
          {...props}
        />
      </div>
      {error ? (
        <p className="text-[11px] text-[#A84332] mt-0.5">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-[#7E7B72] dark:text-[#87857C] mt-0.5">{helperText}</p>
      ) : null}
    </div>
  );
}

export function Select({ label, error, options = [], className = '', id, ...props }) {
  const selectId = id || props.name || Math.random().toString(36).substring(2, 9);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-[11px] font-semibold uppercase tracking-wider text-[#57554D] dark:text-[#B8B5AC]">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full text-xs rounded-md border bg-[#FAF7F2] dark:bg-[#181916] text-[#24251F] dark:text-[#EAE7E0] px-3 py-2 transition-colors focus:outline-none focus:ring-1 focus:ring-[#C65D3A] focus:border-[#C65D3A] ${
          error ? 'border-[#A84332]' : 'border-[#D8D0C3] dark:border-[#353831]'
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#FAF7F2] dark:bg-[#20221E] text-[#24251F] dark:text-[#EAE7E0]">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-[11px] text-[#A84332] mt-0.5">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, helperText, className = '', id, rows = 3, ...props }) {
  const textareaId = id || props.name || Math.random().toString(36).substring(2, 9);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={textareaId} className="text-[11px] font-semibold uppercase tracking-wider text-[#57554D] dark:text-[#B8B5AC]">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        className={`w-full text-xs rounded-md border bg-[#FAF7F2] dark:bg-[#181916] text-[#24251F] dark:text-[#EAE7E0] placeholder-[#7E7B72]/70 dark:placeholder-[#87857C]/60 px-3 py-2 transition-colors focus:outline-none focus:ring-1 focus:ring-[#C65D3A] focus:border-[#C65D3A] leading-relaxed ${
          error ? 'border-[#A84332]' : 'border-[#D8D0C3] dark:border-[#353831]'
        } ${className}`}
        {...props}
      />
      {error ? (
        <p className="text-[11px] text-[#A84332] mt-0.5">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-[#7E7B72] dark:text-[#87857C] mt-0.5">{helperText}</p>
      ) : null}
    </div>
  );
}
