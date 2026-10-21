import React from 'react';
import { Link } from 'react-router-dom';
import { PublicNavbar } from '../components/layout/PublicNavbar.jsx';
import { Footer } from '../components/layout/Footer.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import {
  ArrowRight,
  ShieldCheck,
  Activity,
  Rocket,
  CheckCircle2,
  Terminal,
  Radio,
  Clock,
  KanbanSquare,
  Sparkles,
  Layers,
  Check,
} from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F3EFE7] dark:bg-[#161714] text-[#24251F] dark:text-[#EDE8DF] transition-colors">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-6 sm:px-12 border-b border-[#D8D0C3] dark:border-[#2C2F28]">
        <div className="max-w-5xl mx-auto text-center relative z-10 flex flex-col items-center">
          {/* Studio Catalog Stamp */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#D8D0C3] dark:border-[#353831] bg-[#FAF7F2] dark:bg-[#20221E] text-[#5A5C54] dark:text-[#A6A89E] text-xs font-mono mb-8">
            <span className="w-2 h-2 rounded-full bg-[#C65D3A]" />
            <span>STUDIO MONOGRAPH // ORBITOPS 2.4</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-medium tracking-tight text-[#24251F] dark:text-[#F3EFE7] leading-[1.15] mb-6 max-w-4xl">
            The architectural desk for high-velocity software engineering.
          </h1>

          <p className="text-base sm:text-xl text-[#5A5C54] dark:text-[#A6A89E] max-w-2xl mb-10 leading-relaxed font-sans">
            OrbitOps unifies issue streams, service mesh observability, live war rooms, and verified release pipelines into an understated, characterful command center.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link to="/register" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" icon={ArrowRight} className="w-full text-base px-8 py-3.5">
                Initialize Workspace
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full text-base px-8 py-3.5">
                Sign In to Workspace
              </Button>
            </Link>
          </div>

          {/* Key metrics callouts */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-4xl pt-8 border-t border-[#D8D0C3] dark:border-[#2C2F28]">
            <div className="text-left">
              <p className="text-2xl sm:text-3xl font-serif text-[#24251F] dark:text-[#F3EFE7]">99.98%</p>
              <p className="text-xs font-mono text-[#7C7E74] dark:text-[#8E9086] mt-1">SLA Target Baseline</p>
            </div>
            <div className="text-left">
              <p className="text-2xl sm:text-3xl font-serif text-[#24251F] dark:text-[#F3EFE7]">&lt; 15 min</p>
              <p className="text-xs font-mono text-[#7C7E74] dark:text-[#8E9086] mt-1">MTTD Detection</p>
            </div>
            <div className="text-left">
              <p className="text-2xl sm:text-3xl font-serif text-[#24251F] dark:text-[#F3EFE7]">100%</p>
              <p className="text-xs font-mono text-[#7C7E74] dark:text-[#8E9086] mt-1">Audited Deployments</p>
            </div>
            <div className="text-left">
              <p className="text-2xl sm:text-3xl font-serif text-[#24251F] dark:text-[#F3EFE7]">SOC-2</p>
              <p className="text-xs font-mono text-[#7C7E74] dark:text-[#8E9086] mt-1">RBAC & Isolation</p>
            </div>
          </div>
        </div>

        {/* Live Studio Console Preview Mockup */}
        <div className="max-w-5xl mx-auto mt-16 rounded-xl border border-[#D8D0C3] dark:border-[#353831] bg-[#FAF7F2] dark:bg-[#20221E] shadow-sm overflow-hidden p-2 sm:p-4">
          <div className="flex items-center justify-between pb-3 px-3 border-b border-[#D8D0C3] dark:border-[#2C2F28]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C65D3A]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#D8D0C3] dark:bg-[#353831]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#D8D0C3] dark:bg-[#353831]" />
              <span className="ml-3 text-xs font-mono text-[#7C7E74]">orbitops.dev/app/dashboard</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#4A6B53]/10 text-[#4A6B53] dark:text-[#78A885] border border-[#4A6B53]/25">
                ARCHITECTURE
              </span>
            </div>
          </div>

          <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border border-[#D8D0C3] dark:border-[#353831] bg-[#ECE7DE]/50 dark:bg-[#1A1C18]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-mono uppercase text-[#7C7E74] tracking-wider">Fleet Mesh</span>
                <span className="w-2 h-2 rounded-full bg-[#4A6B53]" />
              </div>
              <p className="text-2xl font-serif text-[#24251F] dark:text-[#F3EFE7]">Service Vitals</p>
              <p className="text-xs font-mono text-[#4A6B53] dark:text-[#78A885] mt-1">Real-time latency & SLA checks</p>
            </div>

            <div className="p-4 rounded-lg border border-[#D8D0C3] dark:border-[#353831] bg-[#ECE7DE]/50 dark:bg-[#1A1C18]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-mono uppercase text-[#7C7E74] tracking-wider">Dispatch Board</span>
                <Activity className="w-3.5 h-3.5 text-[#C65D3A]" />
              </div>
              <p className="text-2xl font-serif text-[#24251F] dark:text-[#F3EFE7]">Kanban Velocity</p>
              <p className="text-xs font-mono text-[#C65D3A] mt-1">Sprint triage & drag-and-drop state</p>
            </div>

            <div className="p-4 rounded-lg border border-[#D8D0C3] dark:border-[#353831] bg-[#ECE7DE]/50 dark:bg-[#1A1C18]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-mono uppercase text-[#7C7E74] tracking-wider">Release Gates</span>
                <Rocket className="w-3.5 h-3.5 text-[#7C7E74]" />
              </div>
              <p className="text-2xl font-serif text-[#24251F] dark:text-[#F3EFE7]">Verified Pipelines</p>
              <p className="text-xs font-mono text-[#7C7E74] mt-1">Audited rollouts & environment history</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillar Grid */}
      <section id="features" className="py-24 px-6 sm:px-12 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-mono uppercase tracking-widest text-[#C65D3A] mb-2">
            ENGINEERED FOR TEAMS WHO CARE
          </p>
          <h2 className="text-3xl sm:text-4xl font-serif font-medium text-[#24251F] dark:text-[#F3EFE7]">
            Everything your team needs to ship with composure
          </h2>
          <p className="text-sm text-[#5A5C54] dark:text-[#A6A89E] mt-3 leading-relaxed">
            Replace noisy, disconnected dashboards with a unified operations canvas built on deliberate whitespace and fine typography.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl border border-[#D8D0C3] dark:border-[#2C2F28] bg-[#FAF7F2] dark:bg-[#20221E]">
            <div className="w-10 h-10 rounded-lg bg-[#C65D3A]/10 text-[#C65D3A] flex items-center justify-center mb-4">
              <KanbanSquare className="w-5 h-5" />
            </div>
            <h3 className="text-base font-serif font-semibold text-[#24251F] dark:text-[#F3EFE7] mb-2">
              Kanban Issue Stream
            </h3>
            <p className="text-xs text-[#5A5C54] dark:text-[#A6A89E] leading-relaxed mb-4">
              Fluid drag-and-drop workflow tracking with custom labels, assignees, priorities, and instant Socket.IO real-time card synchronization.
            </p>
            <ul className="text-xs font-mono text-[#7C7E74] dark:text-[#8E9086] space-y-2">
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#4A6B53]" /> Real-time state replication</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#4A6B53]" /> Rich inline issue drawers</li>
            </ul>
          </div>

          <div className="p-6 rounded-xl border border-[#D8D0C3] dark:border-[#2C2F28] bg-[#FAF7F2] dark:bg-[#20221E]">
            <div className="w-10 h-10 rounded-lg bg-[#C65D3A]/10 text-[#C65D3A] flex items-center justify-center mb-4">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-base font-serif font-semibold text-[#24251F] dark:text-[#F3EFE7] mb-2">
              Service Mesh & Incidents
            </h3>
            <p className="text-xs text-[#5A5C54] dark:text-[#A6A89E] leading-relaxed mb-4">
              Live fleet health tracking, rolling uptime percentages, and chronological incident war room timelines with verified resolution steps.
            </p>
            <ul className="text-xs font-mono text-[#7C7E74] dark:text-[#8E9086] space-y-2">
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#4A6B53]" /> Microsecond latency tracking</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#4A6B53]" /> Incident war room logs</li>
            </ul>
          </div>

          <div className="p-6 rounded-xl border border-[#D8D0C3] dark:border-[#2C2F28] bg-[#FAF7F2] dark:bg-[#20221E]">
            <div className="w-10 h-10 rounded-lg bg-[#C65D3A]/10 text-[#C65D3A] flex items-center justify-center mb-4">
              <Rocket className="w-5 h-5" />
            </div>
            <h3 className="text-base font-serif font-semibold text-[#24251F] dark:text-[#F3EFE7] mb-2">
              Releases & Deployments
            </h3>
            <p className="text-xs text-[#5A5C54] dark:text-[#A6A89E] leading-relaxed mb-4">
              Version management with verifiable release checklists, linked commits and issues, and continuous deployment event streams.
            </p>
            <ul className="text-xs font-mono text-[#7C7E74] dark:text-[#8E9086] space-y-2">
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#4A6B53]" /> Enforceable checklist gates</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#4A6B53]" /> Auditable deployment log history</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 sm:px-12 bg-[#ECE7DE] dark:bg-[#1A1C18] border-t border-[#D8D0C3] dark:border-[#2C2F28] text-center">
        <div className="max-w-2xl mx-auto flex flex-col items-center">
          <span className="w-2.5 h-2.5 rounded-full bg-[#C65D3A] mb-4" />
          <h2 className="text-3xl sm:text-4xl font-serif font-medium text-[#24251F] dark:text-[#F3EFE7] mb-3">
            Take command of your operations today
          </h2>
          <p className="text-sm text-[#5A5C54] dark:text-[#A6A89E] max-w-lg mb-8 leading-relaxed font-sans">
            Launch your isolated workspace in seconds. Includes pre-seeded demo clusters or a pristine production slate.
          </p>
          <Link to="/register">
            <Button variant="primary" size="lg" icon={ArrowRight} className="px-8 py-3.5">
              Initialize Your Workspace
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default LandingPage;
