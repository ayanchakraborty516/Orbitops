import React from 'react';
import { Logo } from '../brand/Logo.jsx';
import { ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-[#D8D0C3] dark:border-[#2C2F28] bg-[#ECE7DE] dark:bg-[#161714] py-12 px-6 sm:px-12 text-[#5A5C54] dark:text-[#A6A89E] text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-2">
          <Logo size="sm" />
          <p className="text-[#7C7E74] dark:text-[#8E9086]">
            Architectural operations desk and telemetry orchestration for high-velocity software engineering teams.
          </p>
        </div>

        <div className="flex items-center gap-6 font-mono text-[11px]">
          <span className="flex items-center gap-1.5 text-[#4A6B53] dark:text-[#78A885] font-medium">
            <ShieldCheck className="w-4 h-4" /> SOC2 Type II Certified
          </span>
          <span className="text-[#D8D0C3] dark:text-[#353831]">•</span>
          <span>Zero-Downtime Pipeline</span>
          <span className="text-[#D8D0C3] dark:text-[#353831]">•</span>
          <span>Air-Gapped Telemetry</span>
        </div>

        <p className="font-mono text-[11px] text-[#7C7E74] dark:text-[#8E9086]">
          © {new Date().getFullYear()} OrbitOps Studio. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
