import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { projectApi } from '../../api/projectApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Card, CardBody } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input, Select, Textarea } from '../../components/ui/Input.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import {
  FolderKanban,
  Plus,
  Search,
  ArrowRight,
} from 'lucide-react';

export function ProjectsListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Project Form State
  const [projectName, setProjectName] = useState('');
  const [projectKey, setProjectKey] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [projectPriority, setProjectPriority] = useState('medium');
  const [projectStatus, setProjectStatus] = useState('active');

  const { data, isLoading } = useQuery({
    queryKey: ['projects', { search, status: statusFilter, priority: priorityFilter }],
    queryFn: () =>
      projectApi.list({
        search: search || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
      }),
  });

  const createProjectMutation = useMutation({
    mutationFn: (newProj) => projectApi.create(newProj),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      success(`Project "${created.name}" created successfully!`);
      setIsCreateModalOpen(false);
      setProjectName('');
      setProjectKey('');
      setProjectDesc('');
    },
    onError: (err) => {
      toastError(err.message || 'Failed to create project');
    },
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    createProjectMutation.mutate({
      name: projectName,
      key: projectKey,
      description: projectDesc,
      priority: projectPriority,
      status: projectStatus,
    });
  };

  const projects = data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D8D0C3] dark:border-[#2C2F28] pb-5">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#7C7E74] dark:text-[#9A9C92] mb-1">
            <span>INDEX // WORKSTREAMS</span>
            <span>•</span>
            <span>EPICS & REPOSITORIES</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-medium tracking-tight text-[#24251F] dark:text-[#F3EFE7]">
            Projects & Workstreams
          </h1>
          <p className="text-xs text-[#5A5C54] dark:text-[#A6A89E] mt-0.5 font-sans">
            Organize engineering epics, issue backlogs, and milestone progress
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={() => setIsCreateModalOpen(true)}
        >
          New Project
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-3 bg-[#FAF7F2] dark:bg-[#20221E]">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="w-full md:flex-1 relative">
            <Input
              icon={Search}
              placeholder="Search by project name or key..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="py-1.5 text-xs font-mono"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'active', label: 'Active' },
                { value: 'planning', label: 'Planning' },
                { value: 'on_hold', label: 'On Hold' },
                { value: 'completed', label: 'Completed' },
              ]}
              className="py-1.5 text-xs"
            />

            <Select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Priorities' },
                { value: 'critical', label: 'Critical' },
                { value: 'high', label: 'High' },
                { value: 'medium', label: 'Medium' },
                { value: 'low', label: 'Low' },
              ]}
              className="py-1.5 text-xs"
            />
          </div>
        </div>
      </Card>

      {/* Project Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-56 rounded-xl" />
          <Skeleton className="h-56 rounded-xl" />
          <Skeleton className="h-56 rounded-xl" />
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects found"
          description="Create your first engineering project or adjust your filters."
          actionLabel="Create Project"
          onAction={() => setIsCreateModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card
              key={project._id}
              hover
              className="flex flex-col justify-between cursor-pointer"
              onClick={() => navigate(`/app/projects/${project._id}`)}
            >
              <CardBody className="p-5 flex-1">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#C65D3A]/10 text-[#C65D3A] dark:text-[#D97753] border border-[#C65D3A]/20">
                      {project.key}
                    </span>
                    <h3 className="text-base font-serif font-semibold text-[#24251F] dark:text-[#F3EFE7] mt-2 group-hover:text-[#C65D3A] transition-colors">
                      {project.name}
                    </h3>
                  </div>
                  <Badge variant={project.status} size="xs">
                    {project.status}
                  </Badge>
                </div>

                <p className="text-xs text-[#5A5C54] dark:text-[#A6A89E] line-clamp-2 mb-4 leading-relaxed font-sans">
                  {project.description || 'No description provided.'}
                </p>

                {/* Progress bar derived from issues */}
                <div className="space-y-1.5 pt-3 border-t border-[#D8D0C3]/60 dark:border-[#2C2F28]">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[#7C7E74]">Issue Progress</span>
                    <span className="font-semibold text-[#24251F] dark:text-[#F3EFE7]">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-[#E5DED2] dark:bg-[#282B24] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#C65D3A] h-full rounded-full transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <p className="text-[10px] font-mono text-[#7C7E74]">
                    {project.doneIssueCount || 0} of {project.issueCount || 0} issues resolved
                  </p>
                </div>
              </CardBody>

              <div className="p-4 border-t border-[#D8D0C3]/60 dark:border-[#2C2F28] bg-[#FAF7F2] dark:bg-[#20221E] rounded-b-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <Badge variant={project.priority} size="xs">
                    {project.priority}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-[#C65D3A] dark:text-[#D97753] font-medium text-xs">
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Project"
        description="Initialize a new operational workstream with an issue prefix."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="Project Name"
            placeholder="e.g. Distributed Consensus Engine"
            value={projectName}
            onChange={(e) => {
              setProjectName(e.target.value);
              if (!projectKey) {
                const words = e.target.value.trim().split(' ');
                const generated = words.map((w) => w[0]).join('').slice(0, 4).toUpperCase();
                setProjectKey(generated);
              }
            }}
            required
            autoFocus
          />

          <Input
            label="Project Key (Prefix for issues, e.g. DCS)"
            placeholder="DCS"
            value={projectKey}
            onChange={(e) => setProjectKey(e.target.value.toUpperCase())}
            required
          />

          <Textarea
            label="Project Description"
            placeholder="Provide context on objectives and scope..."
            value={projectDesc}
            onChange={(e) => setProjectDesc(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Priority"
              value={projectPriority}
              onChange={(e) => setProjectPriority(e.target.value)}
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'critical', label: 'Critical' },
              ]}
            />
            <Select
              label="Initial Status"
              value={projectStatus}
              onChange={(e) => setProjectStatus(e.target.value)}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'planning', label: 'Planning' },
                { value: 'on_hold', label: 'On Hold' },
              ]}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-[#D8D0C3] dark:border-[#2C2F28]">
            <Button variant="ghost" size="sm" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={createProjectMutation.isPending}
            >
              Create Project
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ProjectsListPage;
