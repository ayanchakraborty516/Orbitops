import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { releaseApi } from '../../api/releaseApi.js';
import { projectApi } from '../../api/projectApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Card, CardHeader, CardBody } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Drawer } from '../../components/ui/Drawer.jsx';
import { Input, Select, Textarea } from '../../components/ui/Input.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import {
  Rocket,
  Plus,
  CheckCircle2,
  Clock,
  Server,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Terminal,
} from 'lucide-react';

export function ReleasesPage() {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeReleaseId, setActiveReleaseId] = useState(null);
  const [deployEnv, setDeployEnv] = useState('staging');

  // New release state
  const [version, setVersion] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [targetDate, setTargetDate] = useState('');

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectApi.list(),
  });

  const { data: releases = [], isLoading } = useQuery({
    queryKey: ['releases', { search }],
    queryFn: () => releaseApi.list({ search: search || undefined }),
  });

  const { data: activeRelease, refetch: refetchActiveRelease } = useQuery({
    queryKey: ['release', activeReleaseId],
    queryFn: () => releaseApi.get(activeReleaseId),
    enabled: !!activeReleaseId,
  });

  const createReleaseMutation = useMutation({
    mutationFn: (data) => releaseApi.create(data),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['releases'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      success(`Release ${created.version} drafted!`);
      setIsCreateModalOpen(false);
      setVersion('');
      setTitle('');
      setDescription('');
    },
    onError: (err) => {
      toastError(err.message || 'Failed to create release');
    },
  });

  const toggleChecklistMutation = useMutation({
    mutationFn: ({ releaseId, itemId }) => releaseApi.toggleChecklist(releaseId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['releases'] });
      if (activeReleaseId) refetchActiveRelease();
      success('Checklist updated');
    },
    onError: (err) => {
      toastError(err.message || 'Failed to toggle checklist');
    },
  });

  const triggerDeployMutation = useMutation({
    mutationFn: ({ releaseId, environment }) =>
      releaseApi.triggerDeploy(releaseId, { environment }),
    onSuccess: (deployment) => {
      queryClient.invalidateQueries({ queryKey: ['releases'] });
      queryClient.invalidateQueries({ queryKey: ['deployments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      if (activeReleaseId) refetchActiveRelease();
      success(`Deployment to ${deployment.environment} recorded as successful!`);
    },
    onError: (err) => {
      toastError(err.message || 'Deployment execution failed');
    },
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    const pId = projectId || (projects[0] ? projects[0]._id : null);
    if (!pId) {
      toastError('Please create a project first.');
      return;
    }
    createReleaseMutation.mutate({
      projectId: pId,
      version,
      title,
      description,
      targetDate: targetDate || null,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-6 border-b border-stone-300/80 dark:border-stone-800">
        <div>
          <div className="text-[10px] font-mono tracking-widest uppercase text-terracotta-600 dark:text-terracotta-400 mb-1">
            GATEWAYS // RELEASE-01
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-medium tracking-tight text-charcoal-900 dark:text-stone-100 flex items-center gap-3">
            <Rocket className="w-6 h-6 text-terracotta-600 dark:text-terracotta-400 stroke-[1.5]" />
            Release Milestones & Checklists
          </h1>
          <p className="text-xs text-charcoal-600 dark:text-stone-400 mt-1 max-w-xl">
            Stage-gate sign-offs, production checklists, and verified binary deployments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/app/deployments">
            <Button variant="outline" size="sm" icon={Server}>
              Audit Deployments
            </Button>
          </Link>
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => {
              if (projects.length > 0 && !projectId) {
                setProjectId(projects[0]._id);
              }
              setIsCreateModalOpen(true);
            }}
          >
            Draft Release
          </Button>
        </div>
      </div>

      {/* Release List */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
        </div>
      ) : releases.length === 0 ? (
        <EmptyState
          icon={Rocket}
          title="No releases drafted yet"
          description="Draft your next release milestone with verifiable checklist items and stage gates."
          actionLabel="Draft Release"
          onAction={() => setIsCreateModalOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {releases.map((rel) => {
            const completedCount = rel.checklists?.filter((c) => c.completed).length || 0;
            const totalCount = rel.checklists?.length || 1;
            const percent = Math.round((completedCount / totalCount) * 100);

            return (
              <Card
                key={rel._id}
                hover
                onClick={() => setActiveReleaseId(rel._id)}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 cursor-pointer bg-stone-50/70 dark:bg-[#1E201C] border border-stone-300 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-700"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-stone-200/80 dark:bg-stone-800 text-terracotta-600 dark:text-terracotta-400 flex items-center justify-center shrink-0 border border-stone-300 dark:border-stone-700">
                    <Rocket className="w-5 h-5 stroke-[1.5]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-terracotta-500/10 text-terracotta-700 dark:text-terracotta-400 border border-terracotta-500/30">
                        {rel.version}
                      </span>
                      <h3 className="text-base font-serif font-medium text-charcoal-900 dark:text-stone-100 hover:text-terracotta-600 dark:hover:text-terracotta-400 transition-colors">
                        {rel.title}
                      </h3>
                      <Badge variant={rel.status === 'completed' ? 'done' : 'in_progress'} size="xs">
                        {rel.status}
                      </Badge>
                    </div>

                    <p className="text-xs text-charcoal-600 dark:text-stone-400 mt-1 max-w-2xl line-clamp-2">
                      {rel.description || 'Pre-flight release checks and build manifests.'}
                    </p>

                    <div className="flex items-center gap-4 text-[11px] font-mono text-charcoal-500 dark:text-stone-400 mt-2">
                      <span>Workstream: <strong className="text-charcoal-800 dark:text-stone-200">{rel.projectId?.name || 'Core'}</strong></span>
                      <span>Target: {rel.targetDate ? new Date(rel.targetDate).toLocaleDateString() : 'Continuous'}</span>
                      <span>Sign-off: {rel.createdBy?.name || 'Engineer'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-stone-200 dark:border-stone-800">
                  <div className="w-40 text-right">
                    <div className="flex justify-between text-xs mb-1 font-mono">
                      <span className="text-charcoal-500 dark:text-stone-400 text-[11px]">Gates Passed</span>
                      <span className="font-semibold text-charcoal-900 dark:text-stone-200">{completedCount}/{totalCount}</span>
                    </div>
                    <div className="w-full bg-stone-200 dark:bg-stone-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-terracotta-600 dark:bg-terracotta-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  <Button variant="outline" size="sm">
                    Inspect Gates
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Release Details & Checklist Drawer */}
      <Drawer
        isOpen={!!activeReleaseId}
        onClose={() => setActiveReleaseId(null)}
        title={activeRelease ? `${activeRelease.version} — ${activeRelease.title}` : 'Release Details'}
        subtitle={activeRelease?.projectId?.name}
        width="max-w-2xl"
      >
        {activeRelease && (
          <div className="space-y-6">
            <div className="p-4 rounded-lg border border-stone-300 dark:border-stone-800 bg-stone-100/60 dark:bg-[#1A1C18] flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-charcoal-500 dark:text-stone-400">Gate Status</p>
                <Badge variant={activeRelease.status === 'completed' ? 'done' : 'in_progress'} size="md" className="mt-1 font-mono">
                  {activeRelease.status.toUpperCase()}
                </Badge>
              </div>

              {/* Deployment Trigger */}
              <div className="flex items-center gap-2">
                <Select
                  value={deployEnv}
                  onChange={(e) => setDeployEnv(e.target.value)}
                  options={[
                    { value: 'staging', label: 'Deploy to Staging' },
                    { value: 'production', label: 'Deploy to Production' },
                    { value: 'development', label: 'Deploy to Dev' },
                  ]}
                  className="py-1 text-xs font-mono"
                />
                <Button
                  variant="primary"
                  size="sm"
                  icon={Rocket}
                  isLoading={triggerDeployMutation.isPending}
                  onClick={() =>
                    triggerDeployMutation.mutate({
                      releaseId: activeRelease._id,
                      environment: deployEnv,
                    })
                  }
                >
                  Deploy
                </Button>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-[10px] font-mono uppercase tracking-wider text-charcoal-500 dark:text-stone-400 mb-2">Changelog & Notes</h4>
              <p className="text-xs text-charcoal-700 dark:text-stone-300 p-4 rounded-lg border border-stone-300 dark:border-stone-800 bg-stone-50 dark:bg-[#1E201C] leading-relaxed whitespace-pre-wrap">
                {activeRelease.description || 'No changelog description provided.'}
              </p>
            </div>

            {/* Stage-Gate Checklists */}
            <div>
              <h4 className="text-[10px] font-mono uppercase tracking-wider text-charcoal-500 dark:text-stone-400 mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Pre-Flight Release Checklists
              </h4>

              <div className="space-y-2">
                {activeRelease.checklists?.map((chk) => (
                  <div
                    key={chk._id}
                    onClick={() =>
                      toggleChecklistMutation.mutate({
                        releaseId: activeRelease._id,
                        itemId: chk._id,
                      })
                    }
                    className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between text-xs select-none ${
                      chk.completed
                        ? 'border-emerald-600/30 bg-emerald-600/5 text-charcoal-900 dark:text-stone-200'
                        : 'border-stone-300 dark:border-stone-800 bg-stone-50 dark:bg-[#1E201C] text-charcoal-700 dark:text-stone-300 hover:border-terracotta-500'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                          chk.completed
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-stone-400 dark:border-stone-600'
                        }`}
                      >
                        {chk.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <span className={chk.completed ? 'line-through opacity-70 font-mono text-[11px]' : 'font-medium'}>
                        {chk.item}
                      </span>
                    </div>

                    {chk.completed && (
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                        Verified by {chk.completedBy?.name || 'Engineer'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Past Deployments History for this Release */}
            <div>
              <h4 className="text-[10px] font-mono uppercase tracking-wider text-charcoal-500 dark:text-stone-400 mb-3 flex items-center gap-2">
                <Server className="w-4 h-4 text-terracotta-600 dark:text-terracotta-400" />
                Recorded Deployment Executions ({activeRelease.deployments?.length || 0})
              </h4>

              <div className="space-y-2">
                {(!activeRelease.deployments || activeRelease.deployments.length === 0) ? (
                  <p className="text-xs font-mono text-charcoal-500 dark:text-stone-400 p-4 border border-dashed border-stone-300 dark:border-stone-800 rounded-lg text-center">
                    No verified deployments recorded yet for this version.
                  </p>
                ) : (
                  activeRelease.deployments.map((dep) => (
                    <div key={dep._id} className="p-3.5 rounded-lg border border-stone-300 dark:border-stone-800 bg-stone-50 dark:bg-[#1E201C] text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-charcoal-900 dark:text-stone-100 uppercase font-mono text-[11px]">
                            {dep.environment}
                          </span>
                          <Badge variant={dep.status === 'successful' ? 'done' : 'critical'} size="xs">
                            {dep.status}
                          </Badge>
                        </div>
                        <span className="text-[10px] font-mono text-charcoal-500 dark:text-stone-400">
                          {new Date(dep.startedAt).toLocaleString()} ({dep.durationSeconds}s)
                        </span>
                      </div>
                      <p className="text-[11px] text-charcoal-500 dark:text-stone-400">
                        Commit: <span className="font-mono text-terracotta-600 dark:text-terracotta-400">{dep.commitHash}</span> • By {dep.deployedBy?.name}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Create Release Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Draft New Release"
        description="Bundle completed issues, define versions, and establish sign-off checklists."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Release Version"
              placeholder="e.g. v2.5.0"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              required
              autoFocus
            />

            <Select
              label="Target Project"
              value={projectId || (projects[0]?._id || '')}
              onChange={(e) => setProjectId(e.target.value)}
              options={projects.map((p) => ({ value: p._id, label: `${p.key} - ${p.name}` }))}
              required
            />
          </div>

          <Input
            label="Release Title"
            placeholder="e.g. Observability & Zero-Trust TLS Hardening"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Textarea
            label="Release Description & Changelog"
            placeholder="Document key changes, migrations, or breaking updates..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <Input
            label="Target Release Date"
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-stone-300 dark:border-stone-800">
            <Button variant="ghost" size="sm" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={createReleaseMutation.isPending}>
              Create Release
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ReleasesPage;
