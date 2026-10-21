import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { issueApi } from '../../api/issueApi.js';
import { projectApi } from '../../api/projectApi.js';
import { workspaceApi } from '../../api/workspaceApi.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Drawer } from '../../components/ui/Drawer.jsx';
import { Input, Select, Textarea } from '../../components/ui/Input.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import {
  KanbanSquare,
  Plus,
  Search,
  MessageSquare,
  Trash2,
  Send,
  User as UserIcon,
  ArrowUpRight,
} from 'lucide-react';

const COLUMNS = [
  { id: 'todo', index: '01', title: 'To Do', accent: 'border-t-[#7C7E74]' },
  { id: 'in_progress', index: '02', title: 'In Progress', accent: 'border-t-[#C65D3A]' },
  { id: 'in_review', index: '03', title: 'In Review', accent: 'border-t-[#D97753]' },
  { id: 'done', index: '04', title: 'Completed', accent: 'border-t-[#4A6B53]' },
];

export function KanbanBoardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [selectedProjectId, setSelectedProjectId] = useState('all');
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Modals & Drawers
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeIssueId, setActiveIssueId] = useState(null);
  const [newComment, setNewComment] = useState('');

  // Drag and drop state
  const [draggedIssueId, setDraggedIssueId] = useState(null);

  // New Issue Form
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newProject, setNewProject] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [newStatus, setNewStatus] = useState('todo');
  const [newAssignee, setNewAssignee] = useState('');
  const [newType, setNewType] = useState('task');
  const [newDueDate, setNewDueDate] = useState('');

  // Fetch projects for filter & creation
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectApi.list(),
  });

  // Fetch workspace members for assignment
  const { data: membersData } = useQuery({
    queryKey: ['workspace-members'],
    queryFn: () => workspaceApi.getMembers(),
  });
  const members = membersData?.members || [];

  // Fetch issues
  const { data: issues = [], isLoading } = useQuery({
    queryKey: ['issues', { projectId: selectedProjectId, search, priority: priorityFilter }],
    queryFn: () =>
      issueApi.list({
        projectId: selectedProjectId !== 'all' ? selectedProjectId : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        search: search || undefined,
      }),
  });

  // Fetch active issue details when drawer is opened
  const { data: activeIssue, refetch: refetchActiveIssue } = useQuery({
    queryKey: ['issue', activeIssueId],
    queryFn: () => issueApi.get(activeIssueId),
    enabled: !!activeIssueId,
  });

  // Mutations
  const createIssueMutation = useMutation({
    mutationFn: (data) => issueApi.create(data),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      success(`Issue ${created.key} created!`);
      setIsCreateModalOpen(false);
      setNewTitle('');
      setNewDesc('');
    },
    onError: (err) => {
      toastError(err.message || 'Failed to create issue');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => issueApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      if (activeIssueId) refetchActiveIssue();
    },
    onError: (err) => {
      toastError(err.message || 'Failed to move issue');
    },
  });

  const deleteIssueMutation = useMutation({
    mutationFn: (id) => issueApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      success('Issue deleted');
      setActiveIssueId(null);
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: ({ id, content }) => issueApi.addComment(id, content),
    onSuccess: () => {
      refetchActiveIssue();
      setNewComment('');
      success('Comment added');
    },
    onError: (err) => {
      toastError(err.message || 'Failed to add comment');
    },
  });

  // Drag and Drop handlers
  const handleDragStart = (e, issueId) => {
    e.dataTransfer.setData('text/plain', issueId);
    setDraggedIssueId(issueId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    const issueId = e.dataTransfer.getData('text/plain') || draggedIssueId;
    if (issueId) {
      updateStatusMutation.mutate({ id: issueId, status: targetStatus });
    }
    setDraggedIssueId(null);
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    const projId = newProject || (projects[0] ? projects[0]._id : null);
    if (!projId) {
      toastError('Please create or select a project first.');
      return;
    }
    createIssueMutation.mutate({
      projectId: projId,
      title: newTitle,
      description: newDesc,
      priority: newPriority,
      status: newStatus,
      type: newType,
      assigneeId: newAssignee || null,
      dueDate: newDueDate || null,
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D8D0C3] dark:border-[#2C2F28] pb-5">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#7C7E74] dark:text-[#9A9C92] mb-1">
            <span>STREAM // ISSUES</span>
            <span>•</span>
            <span>REAL-TIME DISPATCH</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-medium tracking-tight text-[#24251F] dark:text-[#F3EFE7]">
            Kanban Issue Stream
          </h1>
          <p className="text-xs text-[#5A5C54] dark:text-[#A6A89E] mt-0.5 font-sans">
            Interactive drag-and-drop workflow tracking with live state synchronization
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={() => {
            if (projects.length > 0 && !newProject) {
              setNewProject(projects[0]._id);
            }
            setIsCreateModalOpen(true);
          }}
        >
          New Issue
        </Button>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-3 bg-[#FAF7F2] dark:bg-[#20221E]">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="w-full md:flex-1 relative">
            <Input
              icon={Search}
              placeholder="Search issues by title, key, or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="py-1.5 text-xs font-mono"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              options={[
                { value: 'all', label: 'All Projects' },
                ...projects.map((p) => ({ value: p._id, label: `${p.key} - ${p.name}` })),
              ]}
              className="py-1.5 text-xs max-w-[200px]"
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

      {/* Kanban Board Columns */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={KanbanSquare}
          title="No projects configured for workflow tracking"
          description="Issues and workstreams require an active project container. Create your first project to enable the Kanban board."
          actionLabel="Create Engineering Project"
          onAction={() => navigate('/app/projects')}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {COLUMNS.map((col) => {
            const columnIssues = issues.filter((i) => i.status === col.id);

            return (
              <div
                key={col.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
                className={`bg-[#ECE7DE]/50 dark:bg-[#1A1C18] border border-[#D8D0C3] dark:border-[#2C2F28] rounded-xl flex flex-col min-h-[520px] border-t-2 ${col.accent} p-3 transition-colors`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 px-1 border-b border-[#D8D0C3]/60 dark:border-[#2C2F28]">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[#7C7E74]">
                      {col.index}
                    </span>
                    <span className="text-xs font-semibold text-[#24251F] dark:text-[#F3EFE7] tracking-tight">
                      {col.title}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#FAF7F2] dark:bg-[#20221E] text-[#5A5C54] dark:text-[#A6A89E] border border-[#D8D0C3] dark:border-[#353831]">
                      {columnIssues.length}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setNewStatus(col.id);
                      setIsCreateModalOpen(true);
                    }}
                    className="p-1 rounded text-[#7C7E74] hover:text-[#24251F] dark:hover:text-[#F3EFE7] hover:bg-[#FAF7F2] dark:hover:bg-[#20221E]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Cards Container */}
                <div className="space-y-2.5 mt-3 flex-1 overflow-y-auto">
                  {columnIssues.length === 0 ? (
                    <div className="h-28 flex items-center justify-center border border-dashed border-[#D8D0C3] dark:border-[#2C2F28] rounded-lg text-[#7C7E74] text-xs font-mono text-center p-2">
                      Drop cards here
                    </div>
                  ) : (
                    columnIssues.map((issue) => (
                      <div
                        key={issue._id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, issue._id)}
                        onClick={() => setActiveIssueId(issue._id)}
                        className="p-3.5 rounded-lg border border-[#D8D0C3] dark:border-[#353831] bg-[#FAF7F2] dark:bg-[#20221E] hover:border-[#C65D3A] dark:hover:border-[#C65D3A] shadow-xs cursor-grab active:cursor-grabbing transition-all select-none space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#C65D3A]/10 text-[#C65D3A] dark:text-[#D97753] border border-[#C65D3A]/20">
                            {issue.key}
                          </span>
                          <Badge variant={issue.priority} size="xs">
                            {issue.priority}
                          </Badge>
                        </div>

                        <h4 className="text-xs font-semibold text-[#24251F] dark:text-[#F3EFE7] line-clamp-2 leading-snug">
                          {issue.title}
                        </h4>

                        <div className="flex items-center justify-between pt-1 border-t border-[#D8D0C3]/60 dark:border-[#2C2F28] text-[11px] font-mono text-[#7C7E74]">
                          <span className="truncate max-w-[120px]">
                            {issue.projectId?.name || 'Project'}
                          </span>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {issue.assigneeId ? (
                              <img
                                src={issue.assigneeId.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50'}
                                alt={issue.assigneeId.name}
                                title={`Assigned to ${issue.assigneeId.name}`}
                                className="w-5 h-5 rounded-full object-cover ring-1 ring-[#D8D0C3] dark:ring-[#353831]"
                              />
                            ) : (
                              <div
                                title="Unassigned"
                                className="w-5 h-5 rounded-full bg-[#E5DED2] dark:bg-[#282B24] flex items-center justify-center text-[#7C7E74]"
                              >
                                <UserIcon className="w-3 h-3" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Issue Details Drawer */}
      <Drawer
        isOpen={!!activeIssueId}
        onClose={() => setActiveIssueId(null)}
        title={activeIssue ? `${activeIssue.key}: ${activeIssue.title}` : 'Issue Details'}
        subtitle={activeIssue?.projectId?.name}
      >
        {activeIssue && (
          <div className="space-y-6">
            {/* Status and Priority Pill Bar */}
            <div className="flex items-center gap-2">
              <Badge variant={activeIssue.status} size="md">
                {activeIssue.status.replace('_', ' ').toUpperCase()}
              </Badge>
              <Badge variant={activeIssue.priority} size="md">
                {activeIssue.priority.toUpperCase()}
              </Badge>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-[10px] font-mono uppercase tracking-widest text-[#7C7E74] dark:text-[#9A9C92] mb-2">
                SCOPE & CONTEXT
              </h4>
              <div className="p-4 rounded-xl border border-[#D8D0C3] dark:border-[#2C2F28] bg-[#ECE7DE]/50 dark:bg-[#1A1C18] text-xs text-[#24251F] dark:text-[#EDE8DF] leading-relaxed whitespace-pre-wrap">
                {activeIssue.description || 'No description provided.'}
              </div>
            </div>

            {/* Meta Attributes */}
            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <p className="text-[#7C7E74] text-[10px] uppercase">Assignee</p>
                <div className="flex items-center gap-2 mt-1">
                  <img
                    src={activeIssue.assigneeId?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50'}
                    alt={activeIssue.assigneeId?.name}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  <span className="font-semibold text-[#24251F] dark:text-[#F3EFE7]">
                    {activeIssue.assigneeId?.name || 'Unassigned'}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-[#7C7E74] text-[10px] uppercase">Reporter</p>
                <p className="font-semibold text-[#24251F] dark:text-[#F3EFE7] mt-1">
                  {activeIssue.reporterId?.name || 'Reporter'}
                </p>
              </div>

              <div>
                <p className="text-[#7C7E74] text-[10px] uppercase">Created Date</p>
                <p className="font-semibold text-[#24251F] dark:text-[#F3EFE7] mt-1">
                  {new Date(activeIssue.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className="text-[#7C7E74] text-[10px] uppercase">Due Date</p>
                <p className="font-semibold text-[#24251F] dark:text-[#F3EFE7] mt-1">
                  {activeIssue.dueDate ? new Date(activeIssue.dueDate).toLocaleDateString() : 'None set'}
                </p>
              </div>
            </div>

            {/* Change Status Fast Buttons */}
            <div>
              <h4 className="text-[10px] font-mono uppercase tracking-widest text-[#7C7E74] dark:text-[#9A9C92] mb-2">
                TRANSITION STATE
              </h4>
              <div className="flex flex-wrap gap-2">
                {['todo', 'in_progress', 'in_review', 'done'].map((st) => (
                  <button
                    key={st}
                    onClick={() => updateStatusMutation.mutate({ id: activeIssue._id, status: st })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors border ${
                      activeIssue.status === st
                        ? 'bg-[#24251F] text-[#F3EFE7] dark:bg-[#FAF7F2] dark:text-[#24251F] border-[#24251F] font-semibold'
                        : 'border-[#D8D0C3] dark:border-[#353831] bg-[#FAF7F2] dark:bg-[#20221E] text-[#5A5C54] dark:text-[#A6A89E] hover:bg-[#ECE7DE]'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Comment Thread */}
            <div className="border-t border-[#D8D0C3] dark:border-[#2C2F28] pt-5">
              <h4 className="text-[10px] font-mono uppercase tracking-widest text-[#7C7E74] dark:text-[#9A9C92] mb-4 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#C65D3A]" />
                Activity & Updates ({activeIssue.comments?.length || 0})
              </h4>

              <div className="space-y-3 mb-4">
                {activeIssue.comments?.map((comment) => (
                  <div key={comment._id} className="p-3.5 rounded-lg border border-[#D8D0C3] dark:border-[#2C2F28] bg-[#ECE7DE]/50 dark:bg-[#1A1C18] text-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <img
                          src={comment.userId?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50'}
                          alt={comment.userId?.name}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span className="font-semibold text-[#24251F] dark:text-[#F3EFE7]">
                          {comment.userId?.name}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[#7C7E74]">
                        {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[#5A5C54] dark:text-[#A6A89E] leading-relaxed whitespace-pre-wrap pl-7">
                      {comment.content}
                    </p>
                  </div>
                ))}
              </div>

              {/* Add Comment Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Post an operational update or comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="text-xs font-mono"
                />
                <Button
                  variant="primary"
                  size="sm"
                  icon={Send}
                  isLoading={addCommentMutation.isPending}
                  onClick={() => {
                    if (newComment.trim()) {
                      addCommentMutation.mutate({ id: activeIssue._id, content: newComment });
                    }
                  }}
                >
                  Post
                </Button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="pt-4 border-t border-[#D8D0C3] dark:border-[#2C2F28] flex justify-end">
              <Button
                variant="danger"
                size="sm"
                icon={Trash2}
                isLoading={deleteIssueMutation.isPending}
                onClick={() => {
                  if (confirm('Permanently delete this issue?')) {
                    deleteIssueMutation.mutate(activeIssue._id);
                  }
                }}
              >
                Delete Issue
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      {/* Create Issue Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Issue"
        description="Add a task, bug, or feature story to your project backlog."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="Issue Title"
            placeholder="e.g. Configure mutual TLS certificates on ingress"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
            autoFocus
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Project"
              value={newProject || (projects[0]?._id || '')}
              onChange={(e) => setNewProject(e.target.value)}
              options={projects.map((p) => ({ value: p._id, label: `${p.key} - ${p.name}` }))}
              required
            />

            <Select
              label="Type"
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              options={[
                { value: 'task', label: 'Task' },
                { value: 'bug', label: 'Bug' },
                { value: 'story', label: 'Story' },
                { value: 'epic', label: 'Epic' },
              ]}
            />
          </div>

          <Textarea
            label="Description & Acceptance Criteria"
            placeholder="Provide context, logs, or reproduction steps..."
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
          />

          <div className="grid grid-cols-3 gap-3">
            <Select
              label="Priority"
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value)}
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'critical', label: 'Critical' },
              ]}
            />

            <Select
              label="Status"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              options={[
                { value: 'todo', label: 'To Do' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'in_review', label: 'In Review' },
                { value: 'done', label: 'Completed' },
              ]}
            />

            <Select
              label="Assignee"
              value={newAssignee}
              onChange={(e) => setNewAssignee(e.target.value)}
              options={[
                { value: '', label: 'Unassigned' },
                ...members.map((m) => ({
                  value: m.userId?._id,
                  label: m.userId?.name || 'Member',
                })),
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
              isLoading={createIssueMutation.isPending}
            >
              Create Issue
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default KanbanBoardPage;
