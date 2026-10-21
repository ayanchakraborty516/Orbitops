import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { releaseApi } from '../../api/releaseApi.js';
import { Card, CardHeader, CardBody } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Select } from '../../components/ui/Input.jsx';
import { Drawer } from '../../components/ui/Drawer.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import {
  Server,
  Terminal,
  CheckCircle2,
  Clock,
  GitCommit,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export function DeploymentsPage() {
  const [envFilter, setEnvFilter] = useState('all');
  const [activeDeployment, setActiveDeployment] = useState(null);

  const { data: deployments = [], isLoading, refetch } = useQuery({
    queryKey: ['deployments', { env: envFilter }],
    queryFn: () => releaseApi.listDeployments({ environment: envFilter !== 'all' ? envFilter : undefined }),
    refetchInterval: 15000,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-6 border-b border-stone-300/80 dark:border-stone-800">
        <div>
          <div className="text-[10px] font-mono tracking-widest uppercase text-terracotta-600 dark:text-terracotta-400 mb-1">
            MANIFEST // ROLLOUTS
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-medium tracking-tight text-charcoal-900 dark:text-stone-100 flex items-center gap-3">
            <Server className="w-6 h-6 text-terracotta-600 dark:text-terracotta-400 stroke-[1.5]" />
            Deployment Execution History
          </h1>
          <p className="text-xs text-charcoal-600 dark:text-stone-400 mt-1 max-w-xl">
            Cryptographically audited rollout records, container compilation pipelines, and terminal stdout traces.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={envFilter}
            onChange={(e) => setEnvFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Environments' },
              { value: 'production', label: 'Production' },
              { value: 'staging', label: 'Staging' },
              { value: 'development', label: 'Development' },
            ]}
            className="py-1.5 text-xs font-mono"
          />
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={() => refetch()}>
            Sync
          </Button>
        </div>
      </div>

      {/* Deployment Audit Table */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
        </div>
      ) : deployments.length === 0 ? (
        <EmptyState
          icon={Server}
          title="No recorded deployments"
          description="Deployments will appear here once executed and verified through release pipelines."
        />
      ) : (
        <div className="space-y-3">
          {deployments.map((dep) => (
            <Card
              key={dep._id}
              hover
              onClick={() => setActiveDeployment(dep)}
              className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer bg-stone-50/70 dark:bg-[#1E201C] border border-stone-300 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-700"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                    dep.status === 'successful'
                      ? 'bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 border-emerald-600/20'
                      : 'bg-rose-600/10 text-rose-600 dark:text-rose-400 border-rose-600/20'
                  }`}
                >
                  <Server className="w-4 h-4 stroke-[1.5]" />
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-charcoal-900 dark:text-stone-100">
                      {dep.releaseId?.version || 'Build'}
                    </span>
                    <Badge variant={dep.environment} size="xs" className="uppercase font-mono">
                      {dep.environment}
                    </Badge>
                    <Badge variant={dep.status === 'successful' ? 'done' : 'critical'} size="xs">
                      {dep.status}
                    </Badge>
                  </div>

                  <p className="text-xs text-charcoal-600 dark:text-stone-400 mt-1 flex items-center gap-2 flex-wrap">
                    <GitCommit className="w-3.5 h-3.5 text-terracotta-600 dark:text-terracotta-400" />
                    <span className="font-mono text-terracotta-600 dark:text-terracotta-400 font-medium">
                      {dep.commitHash || 'HEAD'}
                    </span>
                    <span>— {dep.commitMessage || 'Automated deployment run'}</span>
                  </p>

                  <div className="flex items-center gap-4 text-[11px] font-mono text-charcoal-500 dark:text-stone-400 mt-2">
                    <span>Target: <strong className="text-charcoal-800 dark:text-stone-200">{dep.projectId?.name || 'Platform'}</strong></span>
                    <span>Operator: {dep.deployedBy?.name || 'Engineer'}</span>
                    <span>Duration: {dep.durationSeconds}s</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-stone-200 dark:border-stone-800">
                <div className="text-right text-xs font-mono">
                  <p className="font-medium text-charcoal-800 dark:text-stone-200">
                    {new Date(dep.startedAt).toLocaleDateString()}
                  </p>
                  <p className="text-[10px] text-charcoal-500 dark:text-stone-400">
                    {new Date(dep.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <Button variant="outline" size="sm" icon={Terminal}>
                  View Stream Logs
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Deployment Logs Drawer */}
      <Drawer
        isOpen={!!activeDeployment}
        onClose={() => setActiveDeployment(null)}
        title={activeDeployment ? `Rollout Audit: ${activeDeployment.releaseId?.version || ''} (${activeDeployment.environment})` : 'Deployment Audit'}
        subtitle={`Execution duration: ${activeDeployment?.durationSeconds || 0} seconds`}
        width="max-w-3xl"
      >
        {activeDeployment && (
          <div className="space-y-6">
            <div className="p-4 rounded-lg border border-stone-300 dark:border-stone-800 bg-stone-100/60 dark:bg-[#1A1C18] grid grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <p className="text-[10px] text-charcoal-500 dark:text-stone-400 uppercase tracking-wider">Status & Verification</p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant={activeDeployment.status === 'successful' ? 'done' : 'critical'} size="sm">
                    {activeDeployment.status.toUpperCase()}
                  </Badge>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified
                  </span>
                </div>
              </div>

              <div>
                <p className="text-[10px] text-charcoal-500 dark:text-stone-400 uppercase tracking-wider">Operator</p>
                <p className="font-sans font-medium text-charcoal-900 dark:text-stone-200 mt-1">
                  {activeDeployment.deployedBy?.name} ({activeDeployment.deployedBy?.email})
                </p>
              </div>

              <div>
                <p className="text-[10px] text-charcoal-500 dark:text-stone-400 uppercase tracking-wider">Git Commit</p>
                <p className="font-mono text-terracotta-600 dark:text-terracotta-400 font-semibold mt-1">
                  {activeDeployment.commitHash}
                </p>
              </div>

              <div>
                <p className="text-[10px] text-charcoal-500 dark:text-stone-400 uppercase tracking-wider">Timestamp</p>
                <p className="text-charcoal-800 dark:text-stone-200 mt-1">
                  {new Date(activeDeployment.startedAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Terminal Log Console */}
            <div>
              <h4 className="text-[10px] font-mono uppercase tracking-wider text-charcoal-500 dark:text-stone-400 mb-2 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-terracotta-600 dark:text-terracotta-400" />
                Raw Execution Stdout Stream
              </h4>

              <div className="p-4 rounded-lg bg-[#141512] border border-[#2A2D25] text-stone-200 font-mono text-xs leading-relaxed overflow-x-auto space-y-1 shadow-inner">
                {activeDeployment.logs && activeDeployment.logs.length > 0 ? (
                  activeDeployment.logs.map((line, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="text-stone-500 select-none">[{idx + 1}]</span>
                      <span className={line.toLowerCase().includes('fail') || line.toLowerCase().includes('error') ? 'text-rose-400' : 'text-stone-300'}>{line}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-stone-500 italic">No execution stream captured.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

export default DeploymentsPage;
