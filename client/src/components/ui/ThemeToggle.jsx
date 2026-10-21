import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.jsx';

export function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-label="Toggle visual theme"
      className={`p-1.5 rounded-md border border-[#D8D0C3] dark:border-[#353831] bg-[#FAF7F2] dark:bg-[#20221E] text-[#57554D] dark:text-[#B8B5AC] hover:text-[#24251F] dark:hover:text-[#EAE7E0] hover:bg-[#E5DED2] dark:hover:bg-[#2A2C27] transition-colors focus:outline-none focus:ring-1 focus:ring-[#C65D3A] ${className}`}
    >
      {isDark ? <Sun className="w-3.5 h-3.5 text-[#D9734E]" /> : <Moon className="w-3.5 h-3.5 text-[#57554D]" />}
    </button>
  );
}

export default ThemeToggle;
