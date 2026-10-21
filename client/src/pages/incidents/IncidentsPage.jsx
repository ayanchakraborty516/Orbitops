import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { incidentApi } from '../../api/incidentApi.js';
import { serviceApi } from '../../api/serviceApi.js';
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
  AlertTriangle,
  Plus,
  Clock,
  CheckCircle2,
  Send,
  Trash2,
  Search,
} from 'lucide-react';

export function IncidentsPage() {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeIncidentId, setActiveIncidentId] = useState(null);

  // New incident form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('minor');
  const [status, setStatus] = useState('investigating');
  const [selectedServices, setSelectedServices] = useState([]);
  const [initialMessage, setInitialMessage] = useState('');

  // Timeline update form
  const [updateMessage, setUpdateMessage] = useState('');
  const [newStatus, setNewStatus] = useState('');

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => serviceApi.list(),
  });

  const { data: incidentsData, isLoading } = useQuery({
    queryKey: ['incidents', { status: statusFilter, severity: severityFilter }],
    queryFn: () =>
      incidentApi.list({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        severity: severityFilter !== 'all' ? severityFilter : undefined,
      }),
    refetchInterval: 15000,
  });

  const { data: activeIncident, refetch: refetchActiveIncident } = useQuery({
    queryKey: ['incident', activeIncidentId],
    queryFn: () => incidentApi.get(activeIncidentId),
    enabled: !!activeIncidentId,
  });

  const createMutation = useMutation({
    mutationFn: (data) => incidentApi.create(data),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      success(`Incident "${created.title}" opened.`);
      setIsCreateModalOpen(false);
      setTitle('');
      setDescription('');
      setInitialMessage('');
      setSelectedServices([]);
    },
    onError: (err) => {
      toastError(err.message || 'Failed to create incident');
    },
  });

  const timelineMutation = useMutation({
    mutationFn: ({ id, data }) => incidentApi.addTimelineUpdate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      refetchActiveIncident();
      setUpdateMessage('');
      success('Timeline update posted to incident war room.');
    },
    onError: (err) => {
      toastError(err.message || 'Failed to add timeline update');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => incidentApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      success('Incident record removed');
      setActiveIncidentId(null);
    },
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      title,
      description,
      severity,
      status,
      serviceIds: selectedServices,
      initialMessage,
    });
  };

  const handleTimelineSubmit = (e) => {
    e.preventDefault();
    if (!updateMessage.trim() || !activeIncidentId) return;
    timelineMutation.mutate({
      id: activeIncidentId,
      data: {
        message: updateMessage,
        status: newStatus || activeIncident.status,
      },
    });
  };

  const incidents = incidentsData || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D8D0C3] dark:border-[#2C2F28] pb-5">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#7C7E74] dark:text-[#9A9C92] mb-1">
            <span>WAR ROOMS // ESCALATIONS</span>
            <span>•</span>
            <span>INCIDENT POST-MORTEMS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-medium tracking-tight text-[#24251F] dark:text-[#F3EFE7]">
            Incident War Rooms & Diagnostics
          </h1>
          <p className="text-xs text-[#5A5C54] dark:text-[#A6A89E] mt-0.5 font-sans">
            Active investigations, severity escalations, and timeline remediation audits
          </p>
        </div>

        <Button
          variant="danger"
          size="md"
          icon={Plus}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Report Incident
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="p-3 bg-[#FAF7F2] dark:bg-[#20221E]">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="w-full md:flex-1 relative">
            <Input
              placeholder="Filter incidents by title or service..."
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
                { value: 'investigating', label: 'Investigating' },
                { value: 'identified', label: 'Identified' },
                { value: 'monitoring', label: 'Monitoring' },
                { value: 'resolved', label: 'Resolved' },
              ]}
              className="py-1.5 text-xs"
            />

            <Select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Severities' },
                { value: 'critical', label: 'Critical (P0)' },
                { value: 'major', label: 'Major (P1)' },
                { value: 'minor', label: 'Minor (P2)' },
              ]}
              className="py-1.5 text-xs"
            />
          </div>
        </div>
      </Card>

      {/* Incidents List */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      ) : incidents.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No active incidents reported"
          description="All engineering services and platform dependencies are operating nominal."
          actionLabel="Report An Outage"
          onAction={() => setIsCreateModalOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {incidents.map((incident) => (
            <Card
              key={incident._id}
              hover
              onClick={() => setActiveIncidentId(incident._id)}
              className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <Badge variant={incident.severity} size="md" className="shrink-0 mt-0.5">
                  {incident.severity.toUpperCase()}
                </Badge>
                <div>
                  <h3 className="text-sm font-semibold text-[#24251F] dark:text-[#F3EFE7] hover:text-[#C65D3A] transition-colors">
                    {incident.title}
                  </h3>
                  <p className="text-xs text-[#5A5C54] dark:text-[#A6A89E] mt-1 max-w-2xl line-clamp-2 font-sans">
                    {incident.description || 'Active incident undergoing triage.'}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-[#7C7E74] mt-2.5">
                    <span>
                      Lead: <strong className="text-[#24251F] dark:text-[#F3EFE7]">{incident.leadId?.name || 'Unassigned'}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Updates: <strong className="text-[#24251F] dark:text-[#F3EFE7]">{incident.timeline?.length || 0}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Opened: {new Date(incident.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {incident.serviceIds && incident.serviceIds.length > 0 && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          {incident.serviceIds.map((srv) => (
                            <span key={srv._id || srv} className="px-1.5 py-0.2 rounded bg-[#ECE7DE] dark:bg-[#1A1C18] text-[#5A5C54] dark:text-[#A6A89E] text-[10px] font-mono border border-[#D8D0C3] dark:border-[#353831]">
                              {srv.name || 'Service'}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#D8D0C3]/60 dark:border-[#2C2F28]">
                <Badge
                  variant={incident.status === 'resolved' ? 'done' : 'in_progress'}
                  size="sm"
                >
                  {incident.status.toUpperCase()}
                </Badge>
                <Button variant="outline" size="sm">
                  War Room
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Incident War Room Details Drawer */}
      <Drawer
        isOpen={!!activeIncidentId}
        onClose={() => setActiveIncidentId(null)}
        title={activeIncident ? activeIncident.title : 'War Room Details'}
        subtitle={`Incident Severity: ${activeIncident?.severity?.toUpperCase() || ''}`}
        width="max-w-3xl"
      >
        {activeIncident && (
          <div className="space-y-6">
            {/* Severity and Status Bar */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-[#D8D0C3] dark:border-[#2C2F28] bg-[#ECE7DE]/40 dark:bg-[#1A1C18]">
              <div className="flex items-center gap-2">
                <Badge variant={activeIncident.severity} size="md">
                  {activeIncident.severity.toUpperCase()}
                </Badge>
                <Badge
                  variant={activeIncident.status === 'resolved' ? 'done' : 'in_progress'}
                  size="md"
                >
                  {activeIncident.status.toUpperCase()}
                </Badge>
              </div>

              {activeIncident.status !== 'resolved' && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={CheckCircle2}
                  onClick={() => {
                    timelineMutation.mutate({
                      id: activeIncident._id,
                      data: {
                        message: 'Root cause remediated. All systems verified and restored to operational status.',
                        status: 'resolved',
                      },
                    });
                  }}
                >
                  Resolve Incident
                </Button>
              )}
            </div>

            {/* Description */}
            <div>
              <h4 className="text-[10px] font-mono uppercase tracking-widest text-[#7C7E74] dark:text-[#9A9C92] mb-2">
                SCOPE & IMPACT
              </h4>
              <p className="text-xs text-[#24251F] dark:text-[#EDE8DF] p-4 rounded-xl border border-[#D8D0C3] dark:border-[#2C2F28] bg-[#FAF7F2] dark:bg-[#20221E] leading-relaxed whitespace-pre-wrap font-sans">
                {activeIncident.description || 'No additional scope details entered.'}
              </p>
            </div>

            {/* Chronological Timeline */}
            <div>
              <h4 className="text-[10px] font-mono uppercase tracking-widest text-[#7C7E74] dark:text-[#9A9C92] mb-4 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#C65D3A]" />
                Chronological Incident Timeline ({activeIncident.timeline?.length || 0})
              </h4>

              <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#D8D0C3] dark:before:bg-[#2C2F28]">
                {activeIncident.timeline?.map((item, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-[#C65D3A] ring-4 ring-[#FAF7F2] dark:ring-[#20221E]" />
                    <div className="p-4 rounded-xl border border-[#D8D0C3] dark:border-[#2C2F28] bg-[#FAF7F2] dark:bg-[#20221E] text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#24251F] dark:text-[#F3EFE7]">
                            {item.updatedBy?.name || 'Engineer'}
                          </span>
                          <Badge variant={item.status === 'resolved' ? 'done' : 'default'} size="xs">
                            {item.status}
                          </Badge>
                        </div>
                        <span className="text-[10px] font-mono text-[#7C7E74]">
                          {new Date(item.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-[#5A5C54] dark:text-[#A6A89E] mt-1.5 leading-relaxed whitespace-pre-wrap font-sans">
                        {item.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Post Timeline Update Form */}
            {activeIncident.status !== 'resolved' && (
              <form onSubmit={handleTimelineSubmit} className="p-4 rounded-xl border border-[#D8D0C3] dark:border-[#2C2F28] bg-[#FAF7F2] dark:bg-[#20221E] space-y-3">
                <h4 className="text-xs font-semibold text-[#24251F] dark:text-[#F3EFE7] flex items-center gap-1.5 font-mono">
                  <Send className="w-3.5 h-3.5 text-[#C65D3A]" />
                  Post War Room Update
                </h4>

                <Textarea
                  placeholder="Describe latest diagnostics, remediation actions, or status changes..."
                  value={updateMessage}
                  onChange={(e) => setUpdateMessage(e.target.value)}
                  className="font-mono text-xs"
                  required
                />

                <div className="flex items-center justify-between">
                  <div className="w-48">
                    <Select
                      value={newStatus || activeIncident.status}
                      onChange={(e) => setNewStatus(e.target.value)}
                      options={[
                        { value: 'investigating', label: 'Investigating' },
                        { value: 'identified', label: 'Identified' },
                        { value: 'monitoring', label: 'Monitoring' },
                        { value: 'resolved', label: 'Resolved' },
                      ]}
                    />
                  </div>

                  <Button type="submit" variant="primary" size="sm" isLoading={timelineMutation.isPending}>
                    Post Update
                  </Button>
                </div>
              </form>
            )}

            {/* Delete button */}
            <div className="pt-4 border-t border-[#D8D0C3] dark:border-[#2C2F28] flex justify-end">
              <Button
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={() => {
                  if (confirm('Permanently delete this incident record?')) {
                    deleteMutation.mutate(activeIncident._id);
                  }
                }}
              >
                Delete Record
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      {/* Report Incident Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Report System Incident"
        description="Declare an incident, page the on-call engineer, and open a live war room."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="Incident Title"
            placeholder="e.g. Intermittent 502 Bad Gateway on Payment Gateway"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
          />

          <Textarea
            label="Scope & Symptoms"
            placeholder="Describe customer impact, error rates, or triggered alerts..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Severity"
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              options={[
                { value: 'critical', label: 'Critical (P0 - Service Down)' },
                { value: 'major', label: 'Major (P1 - High Error Rate)' },
                { value: 'minor', label: 'Minor (P2 - Non-critical)' },
              ]}
            />

            <Select
              label="Initial Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: 'investigating', label: 'Investigating' },
                { value: 'identified', label: 'Identified' },
                { value: 'monitoring', label: 'Monitoring' },
              ]}
            />
          </div>

          <Textarea
            label="Initial War Room Message"
            placeholder="e.g. Alert triggered: error budget depleted. On-call engineer investigating logs."
            value={initialMessage}
            onChange={(e) => setInitialMessage(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-[#D8D0C3] dark:border-[#2C2F28]">
            <Button variant="ghost" size="sm" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" size="sm" isLoading={createMutation.isPending}>
              Open War Room
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default IncidentsPage;
