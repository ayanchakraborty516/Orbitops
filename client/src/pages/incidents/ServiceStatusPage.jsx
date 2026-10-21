import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceApi } from '../../api/serviceApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { Input, Select, Textarea } from '../../components/ui/Input.jsx';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import {
  Activity,
  Plus,
  RefreshCw,
  Radio,
  Trash2,
  Edit,
} from 'lucide-react';

export function ServiceStatusPage() {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('operational');
  const [environment, setEnvironment] = useState('production');

  const { data: services = [], isLoading, refetch } = useQuery({
    queryKey: ['services'],
    queryFn: () => serviceApi.list(),
    refetchInterval: 15000,
  });

  const createMutation = useMutation({
    mutationFn: (data) => serviceApi.create(data),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      success(`Service "${created.name}" registered in monitoring!`);
      setIsAddModalOpen(false);
      setName('');
      setDescription('');
    },
    onError: (err) => {
      toastError(err.message || 'Failed to create service');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => serviceApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      success('Service health state updated!');
      setEditingService(null);
    },
    onError: (err) => {
      toastError(err.message || 'Failed to update service');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => serviceApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      success('Service removed from monitoring');
    },
  });

  const handleCreate = (e) => {
    e.preventDefault();
    createMutation.mutate({
      name,
      description,
      status,
      environment,
    });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!editingService) return;
    updateMutation.mutate({
      id: editingService._id,
      data: {
        name: editingService.name,
        description: editingService.description,
        status: editingService.status,
        environment: editingService.environment,
        uptimePercentage: editingService.uptimePercentage,
      },
    });
  };

  const operationalCount = services.filter((s) => s.status === 'operational').length;
  const degradedCount = services.filter((s) => s.status !== 'operational').length;
  const averageUptime =
    services.length > 0
      ? (
          services.reduce((acc, s) => acc + (s.uptimePercentage || 99.9), 0) /
          services.length
        ).toFixed(2)
      : '0.00';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D8D0C3] dark:border-[#2C2F28] pb-5">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#7C7E74] dark:text-[#9A9C92] mb-1">
            <span>STREAM // FLEET MESH</span>
            <span>•</span>
            <span>INFRASTRUCTURE VITALS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-medium tracking-tight text-[#24251F] dark:text-[#F3EFE7]">
            Service Status & Infrastructure Health
          </h1>
          <p className="text-xs text-[#5A5C54] dark:text-[#A6A89E] mt-0.5 font-sans">
            Distributed microservices telemetry, environment uptime, and SLA verification
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={() => refetch()}>
            Sync
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Monitored Service
          </Button>
        </div>
      </div>

      {/* Global Status Banner */}
      <div
        className={`p-5 rounded-xl border flex items-center justify-between transition-colors ${
          services.length === 0
            ? 'bg-[#FAF7F2] dark:bg-[#20221E] border-[#D8D0C3] dark:border-[#353831] text-[#24251F] dark:text-[#EDE8DF]'
            : degradedCount === 0
            ? 'bg-[#4A6B53]/10 border-[#4A6B53]/25 text-[#24251F] dark:text-[#EDE8DF]'
            : 'bg-[#C65D3A]/10 border-[#C65D3A]/25 text-[#24251F] dark:text-[#EDE8DF]'
        }`}
      >
        <div className="flex items-center gap-3">
          <span
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              services.length === 0
                ? 'bg-[#7C7E74]'
                : degradedCount === 0
                ? 'bg-[#4A6B53]'
                : 'bg-[#C65D3A]'
            }`}
          />
          <div>
            <h3 className="font-serif font-semibold text-sm">
              {services.length === 0
                ? 'No Infrastructure Services Configured'
                : degradedCount === 0
                ? 'All Core Engineering Microservices are Nominal'
                : `${degradedCount} Monitored Service(s) Experiencing Degraded Latency`}
            </h3>
            <p className="text-xs font-mono text-[#7C7E74] dark:text-[#8E9086] mt-0.5">
              {services.length === 0
                ? 'Register microservices below to begin collecting telemetry metrics'
                : `Live checks performed continuously • Global Fleet Uptime: ${averageUptime}%`}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-xs font-mono">
          <span className="px-3 py-1 rounded bg-[#FAF7F2] dark:bg-[#20221E] border border-[#D8D0C3] dark:border-[#353831] text-[#4A6B53]">
            {operationalCount} Nominal
          </span>
          {degradedCount > 0 && (
            <span className="px-3 py-1 rounded bg-[#C65D3A]/15 text-[#C65D3A] border border-[#C65D3A]/25">
              {degradedCount} Degraded
            </span>
          )}
        </div>
      </div>

      {/* Services List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
          </div>
        ) : services.length === 0 ? (
          <EmptyState
            icon={Radio}
            title="No monitored services configured"
            description="Register your microservices, APIs, or databases to track real-time availability and health metrics."
            actionLabel="Register Service"
            onAction={() => setIsAddModalOpen(true)}
          />
        ) : (
          services.map((service) => (
            <Card key={service._id} hover className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                    service.status === 'operational'
                      ? 'bg-[#4A6B53]'
                      : service.status === 'degraded_performance'
                      ? 'bg-[#D97753]'
                      : 'bg-[#C65D3A]'
                  }`}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-[#24251F] dark:text-[#F3EFE7]">{service.name}</h3>
                    <Badge variant={service.status} dot size="xs">
                      {service.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-xs text-[#5A5C54] dark:text-[#A6A89E] mt-1 max-w-xl font-sans">
                    {service.description || 'Monitored microservice endpoint.'}
                  </p>
                  <div className="flex items-center gap-4 text-[11px] font-mono text-[#7C7E74] mt-2">
                    <span>Env: <strong className="text-[#24251F] dark:text-[#F3EFE7] capitalize">{service.environment}</strong></span>
                    <span>Latency: <strong className="text-[#24251F] dark:text-[#F3EFE7]">{service.latencyMs}ms</strong></span>
                    <span>Checked: {new Date(service.lastCheckedAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#D8D0C3]/60 dark:border-[#2C2F28]">
                <div className="text-right sm:mr-3 font-mono">
                  <p className="text-sm font-bold text-[#24251F] dark:text-[#F3EFE7]">{service.uptimePercentage}%</p>
                  <p className="text-[10px] text-[#7C7E74]">30-day uptime</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  icon={Edit}
                  onClick={() => setEditingService({ ...service })}
                >
                  Edit Status
                </Button>
                <button
                  onClick={() => {
                    if (confirm(`Remove ${service.name} from monitoring?`)) {
                      deleteMutation.mutate(service._id);
                    }
                  }}
                  className="p-1.5 rounded-lg text-[#7C7E74] hover:text-[#C65D3A] hover:bg-[#C65D3A]/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Add Service Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register Monitored Service"
        description="Add a service or infrastructure component to health telemetry tracking."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Service Name"
            placeholder="e.g. Ingestion Gateway (Kafka)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />

          <Textarea
            label="Description"
            placeholder="Describe role, dependencies, and SLAs..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Environment"
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
              options={[
                { value: 'production', label: 'Production' },
                { value: 'staging', label: 'Staging' },
                { value: 'development', label: 'Development' },
              ]}
            />

            <Select
              label="Initial Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: 'operational', label: 'Operational' },
                { value: 'degraded_performance', label: 'Degraded Performance' },
                { value: 'partial_outage', label: 'Partial Outage' },
                { value: 'major_outage', label: 'Major Outage' },
                { value: 'under_maintenance', label: 'Under Maintenance' },
              ]}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-[#D8D0C3] dark:border-[#2C2F28]">
            <Button variant="ghost" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={createMutation.isPending}>
              Register Service
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Service Status Modal */}
      <Modal
        isOpen={!!editingService}
        onClose={() => setEditingService(null)}
        title={editingService ? `Update ${editingService.name}` : 'Update Service'}
        description="Change health status state or update description."
      >
        {editingService && (
          <form onSubmit={handleUpdate} className="space-y-4">
            <Select
              label="Service Health Status"
              value={editingService.status}
              onChange={(e) => setEditingService({ ...editingService, status: e.target.value })}
              options={[
                { value: 'operational', label: 'Operational' },
                { value: 'degraded_performance', label: 'Degraded Performance' },
                { value: 'partial_outage', label: 'Partial Outage' },
                { value: 'major_outage', label: 'Major Outage' },
                { value: 'under_maintenance', label: 'Under Maintenance' },
              ]}
            />

            <Input
              label="Uptime Percentage (%)"
              type="number"
              step="0.01"
              value={editingService.uptimePercentage}
              onChange={(e) =>
                setEditingService({ ...editingService, uptimePercentage: parseFloat(e.target.value) })
              }
            />

            <Textarea
              label="Description"
              value={editingService.description}
              onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
            />

            <div className="flex justify-end gap-2 pt-4 border-t border-[#D8D0C3] dark:border-[#2C2F28]">
              <Button variant="ghost" size="sm" onClick={() => setEditingService(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={updateMutation.isPending}>
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

export default ServiceStatusPage;
