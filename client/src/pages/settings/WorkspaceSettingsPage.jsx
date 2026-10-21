import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { workspaceApi } from '../../api/workspaceApi.js';
import { Card, CardHeader, CardBody } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Input, Textarea } from '../../components/ui/Input.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Building, Plus, ShieldCheck, Save, KeyRound } from 'lucide-react';

export function WorkspaceSettingsPage() {
  const { activeWorkspace, refreshWorkspaces, switchWorkspace } = useAuth();
  const { success, error: toastError } = useToast();

  const [name, setName] = useState(activeWorkspace?.name || '');
  const [description, setDescription] = useState(activeWorkspace?.description || '');
  const [isCreateWsModalOpen, setIsCreateWsModalOpen] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [newWsDesc, setNewWsDesc] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!activeWorkspace?._id) return;
    setIsLoading(true);

    try {
      await workspaceApi.update(activeWorkspace._id, { name, description });
      await refreshWorkspaces();
      success('Workspace settings updated successfully!');
    } catch (err) {
      toastError(err.message || 'Failed to update workspace');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    try {
      const created = await workspaceApi.create({
        name: newWsName,
        description: newWsDesc,
      });
      success(`Workspace "${created.name}" created!`);
      setIsCreateWsModalOpen(false);
      setNewWsName('');
      setNewWsDesc('');
      await refreshWorkspaces();
      switchWorkspace(created);
    } catch (err) {
      toastError(err.message || 'Failed to create workspace');
    }
  };

  const isOwnerOrAdmin =
    activeWorkspace?.role === 'Owner' || activeWorkspace?.role === 'Admin';

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-6 border-b border-stone-300/80 dark:border-stone-800">
        <div>
          <div className="text-[10px] font-mono tracking-widest uppercase text-terracotta-600 dark:text-terracotta-400 mb-1">
            WORKSPACE // GOVERNANCE
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-medium tracking-tight text-charcoal-900 dark:text-stone-100 flex items-center gap-3">
            <Building className="w-6 h-6 text-terracotta-600 dark:text-terracotta-400 stroke-[1.5]" />
            Workspace Governance & Settings
          </h1>
          <p className="text-xs text-charcoal-600 dark:text-stone-400 mt-1 max-w-xl">
            Configure organization branding, multi-tenant boundaries, and governance policies.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={() => setIsCreateWsModalOpen(true)}
        >
          New Workspace
        </Button>
      </div>

      <Card>
        <CardHeader
          title="Active Workspace Profile"
          description={`Slug: ${activeWorkspace?.slug || 'orbitops'} • Plan: ${activeWorkspace?.plan || 'pro'}`}
          action={
            <Badge variant="warning" size="sm" className="font-mono">
              YOUR ROLE: {activeWorkspace?.role || 'Member'}
            </Badge>
          }
        />
        <CardBody>
          <form onSubmit={handleUpdate} className="space-y-4">
            <Input
              label="Organization / Workspace Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!isOwnerOrAdmin}
              required
            />

            <Input
              label="Workspace Identifier Slug (Immutable URL Tenant)"
              value={activeWorkspace?.slug || ''}
              disabled
              helperText="Workspace slugs enforce backend tenant boundary isolation."
            />

            <Textarea
              label="Workspace Purpose & Scope"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={!isOwnerOrAdmin}
              rows={3}
            />

            {isOwnerOrAdmin && (
              <div className="pt-4 border-t border-stone-300 dark:border-stone-800 flex justify-end">
                <Button type="submit" variant="primary" size="md" icon={Save} isLoading={isLoading}>
                  Save Workspace Settings
                </Button>
              </div>
            )}
          </form>
        </CardBody>
      </Card>

      {/* Create Workspace Modal */}
      <Modal
        isOpen={isCreateWsModalOpen}
        onClose={() => setIsCreateWsModalOpen(false)}
        title="Create New Organization Workspace"
        description="Provision an entirely isolated multi-tenant operations environment."
      >
        <form onSubmit={handleCreateWorkspace} className="space-y-4">
          <Input
            label="Workspace Name"
            placeholder="e.g. Edge Infrastructure Team"
            value={newWsName}
            onChange={(e) => setNewWsName(e.target.value)}
            required
            autoFocus
          />

          <Textarea
            label="Description"
            placeholder="Team purpose and operations scope..."
            value={newWsDesc}
            onChange={(e) => setNewWsDesc(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-stone-300 dark:border-stone-800">
            <Button variant="ghost" size="sm" onClick={() => setIsCreateWsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Provision Workspace
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default WorkspaceSettingsPage;
