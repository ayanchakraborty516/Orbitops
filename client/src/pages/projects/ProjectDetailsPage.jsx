import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectApi } from '../../api/projectApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Card, CardHeader, CardBody } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Input, Select, Textarea } from '../../components/ui/Input.jsx';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import {
  ArrowLeft,
  KanbanSquare,
  Trash2,
  Edit,
} from 'lucide-react';

export function ProjectDetailsPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Edit form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');
  const [priority, setPriority] = useState('medium');

  const { data: project, isLoading, isError } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectApi.get(projectId),
  });

  const updateMutation = useMutation({
    mutationFn: (updatedData) => projectApi.update(projectId, updatedData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      success('Project updated successfully');
      setIsEditModalOpen(false);
    },
    onError: (err) => {
      toastError(err.message || 'Failed to update project');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => projectApi.delete(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      success('Project deleted');
      navigate('/app/projects');
    },
    onError: (err) => {
      toastError(err.message || 'Failed to delete project');
    },
  });

  const openEditModal = () => {
    if (project) {
      setName(project.name);
      setDescription(project.description || '');
      setStatus(project.status);
      setPriority(project.priority);
      setIsEditModalOpen(true);
    }
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    updateMutation.mutate({ name, description, status, priority });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="w-32 h-6" />
        <Skeleton className="w-96 h-12" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 md:col-span-2 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="p-8 text-center border border-[#C65D3A]/30 bg-[#C65D3A]/5 rounded-xl max-w-lg mx-auto">
        <h3 className="text-base font-serif font-semibold text-[#24251F] dark:text-[#F3EFE7]">
          Workstream not found or access denied
        </h3>
        <Link to="/app/projects" className="mt-3 inline-block">
          <Button variant="outline" size="sm">Back to Projects</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top back link & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D8D0C3] dark:border-[#2C2F28] pb-5">
        <div className="flex items-center gap-3">
          <Link
            to="/app/projects"
            className="p-2 rounded-lg border border-[#D8D0C3] dark:border-[#353831] bg-[#FAF7F2] dark:bg-[#20221E] text-[#5A5C54] hover:text-[#24251F] dark:hover:text-[#F3EFE7] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#C65D3A]/10 text-[#C65D3A] dark:text-[#D97753] border border-[#C65D3A]/20">
                {project.key}
              </span>
              <h1 className="text-2xl font-serif font-medium tracking-tight text-[#24251F] dark:text-[#F3EFE7]">
                {project.name}
              </h1>
              <Badge variant={project.status} size="xs">
                {project.status}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to={`/app/issues?projectId=${project._id}`}>
            <Button variant="primary" size="sm" icon={KanbanSquare}>
              Open Project Kanban
            </Button>
          </Link>
          <Button variant="outline" size="sm" icon={Edit} onClick={openEditModal}>
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={Trash2}
            onClick={() => setIsDeleteModalOpen(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Info & Description */}
        <Card className="lg:col-span-2">
          <CardHeader title="Overview & Objectives" />
          <CardBody className="space-y-6">
            <p className="text-sm text-[#5A5C54] dark:text-[#A6A89E] leading-relaxed whitespace-pre-wrap font-sans">
              {project.description || 'No detailed description written for this project yet.'}
            </p>

            {/* Derived Progress */}
            <div className="p-4 rounded-xl border border-[#D8D0C3] dark:border-[#2C2F28] bg-[#ECE7DE]/40 dark:bg-[#1A1C18]">
              <div className="flex items-center justify-between mb-2 font-mono">
                <span className="text-xs uppercase text-[#7C7E74]">
                  Overall Completion
                </span>
                <span className="text-base font-bold text-[#C65D3A] dark:text-[#D97753]">
                  {project.progress}%
                </span>
              </div>
              <div className="w-full bg-[#E5DED2] dark:bg-[#282B24] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#C65D3A] h-full rounded-full transition-all duration-300"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
              <p className="text-xs font-mono text-[#7C7E74] mt-2">
                Derived directly from {project.issueStats?.total || 0} associated kanban issues (
                {project.issueStats?.done || 0} marked done).
              </p>
            </div>

            {/* Status Breakdown Grid */}
            <div>
              <h4 className="text-[10px] font-mono uppercase tracking-widest text-[#7C7E74] dark:text-[#9A9C92] mb-3">
                ISSUE STATUS BREAKDOWN
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(project.issueStats?.statusBreakdown || {}).map(([st, cnt]) => (
                  <div key={st} className="p-3 rounded-lg border border-[#D8D0C3] dark:border-[#353831] bg-[#FAF7F2] dark:bg-[#20221E]">
                    <p className="text-[10px] uppercase font-mono text-[#7C7E74]">{st.replace('_', ' ')}</p>
                    <p className="text-lg font-serif font-bold text-[#24251F] dark:text-[#F3EFE7] mt-0.5">{cnt}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Project Metadata & Owner */}
        <div className="space-y-6">
          <Card>
            <CardHeader title="Workstream Attributes" />
            <CardBody className="space-y-4 text-xs font-mono">
              <div>
                <p className="text-[#7C7E74] text-[10px] uppercase">Project Lead</p>
                <div className="flex items-center gap-2 mt-1">
                  <img
                    src={project.ownerId?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50'}
                    alt={project.ownerId?.name}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  <span className="font-semibold text-[#24251F] dark:text-[#F3EFE7]">
                    {project.ownerId?.name || 'Owner'}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-[#7C7E74] text-[10px] uppercase">Priority Level</p>
                <div className="mt-1">
                  <Badge variant={project.priority} size="sm">
                    {project.priority.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-[#7C7E74] text-[10px] uppercase">Created On</p>
                <p className="font-semibold text-[#24251F] dark:text-[#F3EFE7] mt-1">
                  {new Date(project.createdAt).toLocaleDateString()}
                </p>
              </div>

              {project.targetDate && (
                <div>
                  <p className="text-[#7C7E74] text-[10px] uppercase">Target Delivery</p>
                  <p className="font-semibold text-[#24251F] dark:text-[#F3EFE7] mt-1">
                    {new Date(project.targetDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Project"
        description="Update project details and priority."
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <Input
            label="Project Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'critical', label: 'Critical' },
              ]}
            />
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'planning', label: 'Planning' },
                { value: 'on_hold', label: 'On Hold' },
                { value: 'completed', label: 'Completed' },
              ]}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-[#D8D0C3] dark:border-[#2C2F28]">
            <Button variant="ghost" size="sm" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={updateMutation.isPending}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Project?"
        description="Are you sure you want to permanently delete this project and all of its associated issues?"
      >
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="ghost" size="sm" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            isLoading={deleteMutation.isPending}
            onClick={() => deleteMutation.mutate()}
          >
            Confirm Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default ProjectDetailsPage;
