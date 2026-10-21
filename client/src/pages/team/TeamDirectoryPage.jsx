import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workspaceApi } from '../../api/workspaceApi.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { Card, CardHeader, CardBody } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Input, Select } from '../../components/ui/Input.jsx';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Mail,
  Trash2,
  Clock,
  Crown,
  KeyRound,
} from 'lucide-react';

export function TeamDirectoryPage() {
  const queryClient = useQueryClient();
  const { activeWorkspace, user: currentUser } = useAuth();
  const { success, error: toastError } = useToast();

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Member');

  const { data, isLoading } = useQuery({
    queryKey: ['workspace-members', activeWorkspace?._id],
    queryFn: () => workspaceApi.getMembers(activeWorkspace?._id),
    enabled: !!activeWorkspace?._id,
  });

  const inviteMutation = useMutation({
    mutationFn: (payload) => workspaceApi.inviteMember(activeWorkspace?._id, payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['workspace-members'] });
      success(res?.message || `Invitation initiated for ${inviteEmail}!`);
      setIsInviteModalOpen(false);
      setInviteEmail('');
    },
    onError: (err) => {
      toastError(err.message || 'Failed to send invitation');
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ memberId, role }) =>
      workspaceApi.updateMemberRole(activeWorkspace?._id, memberId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-members'] });
      success('Member role permissions updated.');
    },
    onError: (err) => {
      toastError(err.message || 'Failed to update member role');
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberId) =>
      workspaceApi.removeMember(activeWorkspace?._id, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-members'] });
      success('Member removed from workspace.');
    },
    onError: (err) => {
      toastError(err.message || 'Failed to remove member');
    },
  });

  const handleInviteSubmit = (e) => {
    e.preventDefault();
    inviteMutation.mutate({ email: inviteEmail, role: inviteRole });
  };

  const members = data?.members || [];
  const invitations = data?.invitations || [];

  const isOwnerOrAdmin =
    activeWorkspace?.role === 'Owner' || activeWorkspace?.role === 'Admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-6 border-b border-stone-300/80 dark:border-stone-800">
        <div>
          <div className="text-[10px] font-mono tracking-widest uppercase text-terracotta-600 dark:text-terracotta-400 mb-1">
            GOVERNANCE // PERSONNEL
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-medium tracking-tight text-charcoal-900 dark:text-stone-100 flex items-center gap-3">
            <Users className="w-6 h-6 text-terracotta-600 dark:text-terracotta-400 stroke-[1.5]" />
            Team Directory & Access Control
          </h1>
          <p className="text-xs text-charcoal-600 dark:text-stone-400 mt-1 max-w-xl">
            Role-based permissions (RBAC) and multi-tenant authorization policies.
          </p>
        </div>

        {isOwnerOrAdmin && (
          <Button
            variant="primary"
            size="md"
            icon={UserPlus}
            onClick={() => setIsInviteModalOpen(true)}
          >
            Invite Member
          </Button>
        )}
      </div>

      {/* RBAC Policy Explainer Card */}
      <div className="p-4 rounded-lg border border-stone-300 dark:border-stone-800 bg-stone-100/70 dark:bg-[#1A1C18] text-xs text-charcoal-700 dark:text-stone-300 flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-terracotta-600 dark:text-terracotta-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-serif font-semibold text-charcoal-900 dark:text-stone-100">
            Tenant Permission Hierarchy:
          </span>{' '}
          <strong className="text-terracotta-600 dark:text-terracotta-400 font-mono text-[11px]">Owner:</strong> Complete organization governance & workspace provisioning.{' '}
          <strong className="text-terracotta-600 dark:text-terracotta-400 font-mono text-[11px]">Admin:</strong> Workstream creation, member invitations, and gate configuration.{' '}
          <strong className="text-terracotta-600 dark:text-terracotta-400 font-mono text-[11px]">Member:</strong> Issue triage, incident resolution, and release drafting.{' '}
          <strong className="text-terracotta-600 dark:text-terracotta-400 font-mono text-[11px]">Viewer:</strong> Read-only access to operational telemetry.
        </div>
      </div>

      {/* Members Table */}
      <Card>
        <CardHeader
          title={`Active Workspace Members (${members.length})`}
          description="Users with authorized access to this isolated workspace tenant"
        />
        <CardBody className="p-0 divide-y divide-stone-200 dark:divide-stone-800">
          {isLoading ? (
            <div className="p-4 space-y-3">
              <Skeleton className="h-12 rounded-lg" />
              <Skeleton className="h-12 rounded-lg" />
            </div>
          ) : (
            members.map((member) => {
              const u = member.userId;
              const isSelf = u?._id === currentUser?._id;
              const isOwner = member.role === 'Owner';

              return (
                <div key={member._id} className="p-4 flex items-center justify-between hover:bg-stone-100/50 dark:hover:bg-[#1E201C] transition-colors">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={u?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={u?.name}
                      className="w-9 h-9 rounded-full object-cover ring-1 ring-stone-300 dark:ring-stone-700"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-charcoal-900 dark:text-stone-100">{u?.name}</span>
                        {isSelf && (
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-terracotta-500/10 text-terracotta-600 dark:text-terracotta-400 border border-terracotta-500/20">
                            YOU
                          </span>
                        )}
                        {isOwner && (
                          <Crown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" title="Workspace Owner" />
                        )}
                      </div>
                      <p className="text-[11px] font-mono text-charcoal-500 dark:text-stone-400">{u?.email} • {u?.title || 'Engineer'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Role selector for Owner/Admin */}
                    {isOwnerOrAdmin && !isOwner && !isSelf ? (
                      <Select
                        value={member.role}
                        onChange={(e) =>
                          updateRoleMutation.mutate({
                            memberId: member._id,
                            role: e.target.value,
                          })
                        }
                        options={[
                          { value: 'Admin', label: 'Admin' },
                          { value: 'Member', label: 'Member' },
                          { value: 'Viewer', label: 'Viewer' },
                        ]}
                        className="py-1 text-xs font-mono w-28"
                      />
                    ) : (
                      <Badge variant={isOwner ? 'warning' : 'primary'} size="sm" className="font-mono">
                        {member.role}
                      </Badge>
                    )}

                    {isOwnerOrAdmin && !isOwner && !isSelf && (
                      <button
                        onClick={() => {
                          if (confirm(`Remove ${u?.name} from this workspace?`)) {
                            removeMemberMutation.mutate(member._id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-charcoal-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        title="Remove member"
                      >
                        <Trash2 className="w-4 h-4 stroke-[1.5]" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </CardBody>
      </Card>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <Card>
          <CardHeader
            title={`Pending Invitations (${invitations.length})`}
            description="Pending workspace authorization links"
          />
          <CardBody className="p-0 divide-y divide-stone-200 dark:divide-stone-800">
            {invitations.map((inv) => (
              <div key={inv._id} className="p-4 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-terracotta-600 dark:text-terracotta-400" />
                  <div>
                    <p className="font-medium text-charcoal-900 dark:text-stone-200">{inv.email}</p>
                    <p className="text-[11px] font-mono text-charcoal-500 dark:text-stone-400">
                      Invited as <strong className="text-terracotta-600 dark:text-terracotta-400">{inv.role}</strong> • Expires in 7 days
                    </p>
                  </div>
                </div>
                <Badge variant="todo" size="xs" className="font-mono">
                  PENDING
                </Badge>
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      {/* Invite Member Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite Team Member"
        description="Grant access to this workspace by email address."
      >
        <form onSubmit={handleInviteSubmit} className="space-y-4">
          <Input
            label="Work Email Address"
            type="email"
            placeholder="engineer@company.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
            autoFocus
          />

          <Select
            label="Assigned Role"
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            options={[
              { value: 'Admin', label: 'Admin (Can manage projects & invite others)' },
              { value: 'Member', label: 'Member (Can create & resolve issues/incidents)' },
              { value: 'Viewer', label: 'Viewer (Read-only access)' },
            ]}
          />

          <p className="text-[11px] text-charcoal-500 dark:text-stone-400">
            If the user already has an OrbitOps account, they will be granted immediate access. Otherwise, a secure invitation token is generated.
          </p>

          <div className="flex justify-end gap-2 pt-4 border-t border-stone-300 dark:border-stone-800">
            <Button variant="ghost" size="sm" onClick={() => setIsInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={inviteMutation.isPending}>
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default TeamDirectoryPage;
