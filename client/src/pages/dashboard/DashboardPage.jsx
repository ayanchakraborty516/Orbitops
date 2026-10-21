import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { dashboardApi } from '../../api/dashboardApi.js';
import { Card, CardHeader, CardBody } from '../../components/ui/Card.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import {
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  RefreshCw,
  Layers,
  Plus,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export function DashboardPage() {
  const [filterRange, setFilterRange] = useState('7d');
  const { activeWorkspace } = useAuth();

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['dashboard', activeWorkspace?._id],
    queryFn: () => dashboardApi.getStats(),
    enabled: !!activeWorkspace?._id,
    refetchInterval: 30000,
  });

  if (!activeWorkspace?._id) {
    return (
      <div className="p-10 text-center border border-[#D8D0C3] dark:border-[#353831] bg-[#FAF7F2] dark:bg-[#20221E] rounded-xl max-w-xl mx-auto my-12">
        <Layers className="w-8 h-8 text-[#C65D3A] mx-auto mb-3" />
        <h3 className="text-base font-serif font-bold text-[#24251F] dark:text-[#F3EFE7]">No Active Workspace Selected</h3>
        <p className="text-xs text-[#5A5C54] dark:text-[#A6A89E] mt-1.5 mb-5 font-mono">
          Select or initialize an operations workspace to view real-time fleet telemetry.
        </p>
        <Link to="/app/settings/workspace">
          <Button variant="primary" size="sm">
            Workspace Settings
          </Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="w-56 h-10" />
          <Skeleton className="w-32 h-8" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-44 lg:col-span-2 rounded-xl" />
          <Skeleton className="h-44 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 lg:col-span-2 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-10 text-center border border-[#C65D3A]/30 bg-[#C65D3A]/5 rounded-xl max-w-xl mx-auto my-12">
        <AlertTriangle className="w-8 h-8 text-[#C65D3A] mx-auto mb-3" />
        <h3 className="text-base font-serif font-bold text-[#24251F] dark:text-[#F3EFE7]">Telemetry stream disrupted</h3>
        <p className="text-xs text-[#5A5C54] dark:text-[#A6A89E] mt-1.5 mb-5 font-mono">
          {error?.message || 'Unable to establish query channel to the operations database.'}
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button variant="primary" size="sm" onClick={() => refetch()} icon={RefreshCw}>
            Retry Telemetry Sync
          </Button>
        </div>
      </div>
    );
  }

  const {
    metrics = {},
    priorityCounts = {},
    resolutionTrend = [],
    services = [],
    recentIncidents = [],
    upcomingReleases = [],
    teamWorkload = [],
    recentActivities = [],
  } = data || {};

  const safeServices = Array.isArray(services) ? services : [];
  const safeIncidents = Array.isArray(recentIncidents) ? recentIncidents : [];
  const safeReleases = Array.isArray(upcomingReleases) ? upcomingReleases : [];
  const safeWorkload = Array.isArray(teamWorkload) ? teamWorkload : [];
  const safeActivities = Array.isArray(recentActivities) ? recentActivities : [];
  const safeTrend = Array.isArray(resolutionTrend) ? resolutionTrend : [];

  const openIssues = metrics?.openIssues ?? 0;
  const resolvedIssues = metrics?.resolvedIssues ?? 0;
  const overdueIssues = metrics?.overdueIssues ?? 0;
  const activeIncidents = metrics?.activeIncidents ?? 0;
  const totalProjects = metrics?.totalProjects ?? 0;
  const activeProjects = metrics?.activeProjects ?? 0;
  const averageUptime = metrics?.averageUptime ?? 0;
  const servicesOperational = metrics?.servicesOperational ?? 0;
  const servicesDegraded = metrics?.servicesDegraded ?? 0;

  const totalSprintIssues = (metrics?.totalIssues !== undefined && metrics.totalIssues > 0)
    ? metrics.totalIssues
    : (openIssues + resolvedIssues);
  const sprintProgress = totalSprintIssues > 0
    ? Math.round((resolvedIssues / totalSprintIssues) * 100)
    : 0;

  const totalIncidentsCount = metrics?.totalIncidents ?? safeIncidents.length;

  const priorityPieData = [
    { name: 'Critical', value: priorityCounts?.critical || 0, color: '#C65D3A' },
    { name: 'High', value: priorityCounts?.high || 0, color: '#D97753' },
    { name: 'Medium', value: priorityCounts?.medium || 0, color: '#7C7E74' },
    { name: 'Low', value: priorityCounts?.low || 0, color: '#B5AFA4' },
  ].filter((p) => p.value > 0);

  const hasPriorityData = priorityPieData.length > 0;
  const chartPieData = hasPriorityData
    ? priorityPieData
    : [{ name: 'None', value: 1, color: '#D8D0C3' }];

  // Custom Recharts Tooltip for Studio Palette
  const CustomChartTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#FAF7F2] dark:bg-[#20221E] border border-[#D8D0C3] dark:border-[#353831] px-3 py-2 rounded-lg shadow-md text-xs font-mono">
          <p className="text-[#7C7E74] dark:text-[#8E9086] text-[10px] uppercase tracking-wider mb-1">{label}</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C65D3A]" />
            <span className="font-semibold text-[#24251F] dark:text-[#F3EFE7]">
              {payload[0].value} issues resolved
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 pb-10">
      {/* 1. EDITORIAL PAGE HEADING & OPERATIONAL SUMMARY */}
      <div className="border-b border-[#D8D0C3] dark:border-[#2C2F28] pb-6">
        <div className="flex items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-[#7C7E74] dark:text-[#9A9C92]">
            <span>DESK // OPS-01</span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-[#4A6B53] dark:text-[#78A885]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4A6B53] dark:bg-[#78A885]" />
              MESH NOMINAL
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-lg border border-[#D8D0C3] dark:border-[#353831] p-0.5 bg-[#FAF7F2] dark:bg-[#20221E] text-xs">
              {['7d', '14d', '30d'].map((range) => (
                <button
                  key={range}
                  onClick={() => setFilterRange(range)}
                  className={`px-3 py-1 rounded-md text-xs font-mono transition-colors ${
                    filterRange === range
                      ? 'bg-[#24251F] text-[#F3EFE7] dark:bg-[#FAF7F2] dark:text-[#24251F] font-semibold'
                      : 'text-[#5A5C54] dark:text-[#A6A89E] hover:text-[#24251F] dark:hover:text-[#F3EFE7]'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={() => refetch()}
              className={isFetching ? 'animate-spin' : ''}
            >
              Sync
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl font-serif font-medium tracking-tight text-[#24251F] dark:text-[#F3EFE7]">
              Operations Desk & Fleet Reliability
            </h1>
            <p className="mt-2 text-sm text-[#5A5C54] dark:text-[#A6A89E] leading-relaxed">
              {safeServices.length > 0 ? (
                <>Global service availability holds at <span className="font-semibold text-[#24251F] dark:text-[#F3EFE7]">{averageUptime}%</span> across {servicesOperational} operational cluster{servicesOperational !== 1 ? 's' : ''}.</>
              ) : (
                <>No monitored services registered yet.</>
              )}{' '}
              Currently tracking <span className="font-semibold text-[#24251F] dark:text-[#F3EFE7]">{openIssues} active task{openIssues !== 1 ? 's' : ''}</span>, {activeIncidents} ongoing war room{activeIncidents !== 1 ? 's' : ''}, and {safeReleases.length} targeted release pipeline{safeReleases.length !== 1 ? 's' : ''}.
            </p>
          </div>
        </div>
      </div>

      {/* 2. ASYMMETRICAL TELEMETRY & HERO HIERARCHY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Hero Card: Prominent Fleet Vitals Strip (8 Cols) */}
        <div className="lg:col-span-8 bg-[#FAF7F2] dark:bg-[#20221E] border border-[#D8D0C3] dark:border-[#2C2F28] rounded-xl p-6 sm:p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#D8D0C3]/60 dark:border-[#2C2F28]">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#7C7E74] dark:text-[#9A9C92]">
                TELEMETRY REPORT // SPRINT RUNTIME
              </span>
              {safeServices.length > 0 ? (
                <span className="font-mono text-xs text-[#4A6B53] dark:text-[#78A885] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#4A6B53] dark:bg-[#78A885]" />
                  {servicesDegraded > 0 ? `${servicesDegraded} Degraded` : 'Fleet Healthy'}
                </span>
              ) : (
                <span className="font-mono text-xs text-[#7C7E74] dark:text-[#8E9086] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#7C7E74]" />
                  No Services Configured
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-6 border-b border-[#D8D0C3]/60 dark:border-[#2C2F28]">
              {/* Primary Anchor Metric: Uptime */}
              <div className="sm:col-span-1 border-b sm:border-b-0 sm:border-r border-[#D8D0C3]/60 dark:border-[#2C2F28] pb-4 sm:pb-0 sm:pr-6">
                <span className="text-[11px] font-mono text-[#7C7E74] dark:text-[#9A9C92] block mb-1">
                  01 // FLEET UPTIME
                </span>
                <div className="text-4xl sm:text-5xl font-serif font-light text-[#24251F] dark:text-[#F3EFE7]">
                  {safeServices.length > 0 ? averageUptime : '—'}
                  {safeServices.length > 0 && <span className="text-xl font-sans text-[#7C7E74]">%</span>}
                </div>
                <p className="text-xs text-[#5A5C54] dark:text-[#A6A89E] mt-1.5 font-mono">
                  {safeServices.length > 0 ? `${servicesOperational} of ${safeServices.length} services live` : 'Add a service to track uptime'}
                </p>
              </div>

              {/* Secondary Metric: Work Backlog */}
              <div className="sm:col-span-1 border-b sm:border-b-0 sm:border-r border-[#D8D0C3]/60 dark:border-[#2C2F28] pb-4 sm:pb-0 sm:pr-6">
                <span className="text-[11px] font-mono text-[#7C7E74] dark:text-[#9A9C92] block mb-1">
                  02 // ISSUE QUEUE
                </span>
                <div className="text-4xl sm:text-5xl font-serif font-light text-[#24251F] dark:text-[#F3EFE7]">
                  {openIssues}
                </div>
                <p className="text-xs text-[#5A5C54] dark:text-[#A6A89E] mt-1.5 font-mono">
                  {resolvedIssues} closed this sprint {overdueIssues > 0 && <span className="text-[#C65D3A]">({overdueIssues} overdue)</span>}
                </p>
              </div>

              {/* Tertiary Metric: Release & Active Projects */}
              <div className="sm:col-span-1">
                <span className="text-[11px] font-mono text-[#7C7E74] dark:text-[#9A9C92] block mb-1">
                  03 // PROJECTS IN MOTION
                </span>
                <div className="text-4xl sm:text-5xl font-serif font-light text-[#24251F] dark:text-[#F3EFE7]">
                  {activeProjects}
                  <span className="text-lg font-sans text-[#7C7E74]">/{totalProjects}</span>
                </div>
                <p className="text-xs text-[#5A5C54] dark:text-[#A6A89E] mt-1.5 font-mono">
                  Active workspace initiatives
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-4 text-[#5A5C54] dark:text-[#A6A89E] font-mono text-[11px]">
              <span>WAR ROOMS: <strong className={activeIncidents > 0 ? 'text-[#C65D3A]' : 'text-[#24251F] dark:text-[#F3EFE7]'}>{activeIncidents}</strong></span>
              <span>•</span>
              <span>SERVICES DEGRADED: <strong>{servicesDegraded}</strong></span>
              <span>•</span>
              <span>SPRINT PROGRESS: <strong>{sprintProgress}%</strong></span>
            </div>

            <Link to="/app/issues" className="inline-flex items-center gap-1.5 text-xs font-medium text-[#C65D3A] hover:text-[#B24F2E]">
              <span>View Backlog</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right Hero Card: Incident War Room Focal Digest (4 Cols) */}
        <div className="lg:col-span-4 bg-[#FAF7F2] dark:bg-[#20221E] border border-[#D8D0C3] dark:border-[#2C2F28] rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#D8D0C3]/60 dark:border-[#2C2F28]">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#7C7E74] dark:text-[#9A9C92]">
                INCIDENT STATUS
              </span>
              <Badge variant={activeIncidents > 0 ? 'critical' : 'done'} size="xs">
                {activeIncidents > 0 ? `${activeIncidents} Active` : 'All Clear'}
              </Badge>
            </div>

            <div className="mt-4">
              {safeIncidents.length === 0 ? (
                <div className="py-8 text-center">
                  <CheckCircle2 className="w-7 h-7 text-[#4A6B53] mx-auto mb-2 opacity-80" />
                  <p className="text-xs font-serif font-medium text-[#24251F] dark:text-[#F3EFE7]">
                    Zero Active Incidents
                  </p>
                  <p className="text-[11px] text-[#7C7E74] dark:text-[#9A9C92] font-mono mt-1">
                    All services running within nominal performance parameters.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {safeIncidents.slice(0, 2).map((inc) => (
                    <div
                      key={inc._id}
                      className="p-3 rounded-lg border border-[#D8D0C3] dark:border-[#353831] bg-[#ECE7DE]/40 dark:bg-[#161714]/40"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <Badge variant={inc.severity || 'low'} size="xs">
                          {(inc.severity || 'low').toUpperCase()}
                        </Badge>
                        <span className="text-[10px] font-mono text-[#7C7E74]">
                          {inc.status || 'investigating'}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[#24251F] dark:text-[#F3EFE7] line-clamp-1">
                        {inc.title}
                      </p>
                      <p className="text-[10px] text-[#7C7E74] dark:text-[#9A9C92] font-mono mt-1">
                        Lead: {inc.leadId?.name || 'Unassigned'} • {inc.timeline?.length || 0} updates
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[#D8D0C3]/60 dark:border-[#2C2F28] flex justify-between items-center text-xs">
            <span className="font-mono text-[11px] text-[#7C7E74]">Total Logged: {totalIncidentsCount}</span>
            <Link to="/app/incidents" className="text-xs font-medium text-[#C65D3A] hover:text-[#B24F2E] inline-flex items-center gap-1">
              <span>War Rooms</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3. DISTINCTIVE DATA VISUALIZATION SECTION (Asymmetrical 8 / 4 split) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Chart: Real Resolution Throughput in Burnt Orange & Stone (8 Cols) */}
        <Card className="lg:col-span-8">
          <CardHeader
            title="Resolution Velocity"
            description="Historical cadence of closed issues over the selected rolling period"
            action={
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#FAF7F2] dark:bg-[#20221E] border border-[#D8D0C3] dark:border-[#353831] text-[#7C7E74]">
                DB TELEMETRY
              </span>
            }
          />
          <CardBody>
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={safeTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="studioResolvedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C65D3A" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#C65D3A" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#D8D0C3" strokeOpacity={0.4} />
                  <XAxis
                    dataKey="label"
                    stroke="#7C7E74"
                    fontSize={11}
                    tickLine={false}
                    fontFamily="JetBrains Mono, monospace"
                  />
                  <YAxis
                    stroke="#7C7E74"
                    fontSize={11}
                    tickLine={false}
                    allowDecimals={false}
                    domain={[0, 'auto']}
                    fontFamily="JetBrains Mono, monospace"
                  />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="resolved"
                    name="Closed"
                    stroke="#C65D3A"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#studioResolvedGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 pt-3 border-t border-[#D8D0C3]/60 dark:border-[#2C2F28] flex items-center justify-between text-xs text-[#5A5C54] dark:text-[#A6A89E] font-mono">
              <span>ACTIVE INTERVAL: {filterRange.toUpperCase()}</span>
              <span>RESOLVED TOTAL: <strong className="text-[#24251F] dark:text-[#F3EFE7]">{resolvedIssues}</strong></span>
            </div>
          </CardBody>
        </Card>

        {/* Priority Severity Breakdown & Fleet Services Stack (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Priority Distribution */}
          <Card>
            <CardHeader
              title="Priority Severity"
              description="Active workload severity breakdown"
            />
            <CardBody className="flex flex-col items-center">
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartPieData}
                      innerRadius={46}
                      outerRadius={68}
                      paddingAngle={hasPriorityData && priorityPieData.length > 1 ? 4 : 0}
                      dataKey="value"
                    >
                      {chartPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FAF7F2',
                        borderColor: '#D8D0C3',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontFamily: 'JetBrains Mono',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 w-full mt-2 font-mono text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#C65D3A]" />
                  <span className="text-[#5A5C54] dark:text-[#A6A89E]">Critical ({priorityCounts?.critical ?? 0})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#D97753]" />
                  <span className="text-[#5A5C54] dark:text-[#A6A89E]">High ({priorityCounts?.high ?? 0})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#7C7E74]" />
                  <span className="text-[#5A5C54] dark:text-[#A6A89E]">Medium ({priorityCounts?.medium ?? 0})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#B5AFA4]" />
                  <span className="text-[#5A5C54] dark:text-[#A6A89E]">Low ({priorityCounts?.low ?? 0})</span>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Microservices Quick Strip */}
          <Card>
            <CardHeader
              title="Monitored Services"
              description="Real-time latency & health"
              action={
                <Link to="/app/services">
                  <Button variant="ghost" size="sm" icon={ArrowUpRight}>
                    Grid
                  </Button>
                </Link>
              }
            />
            <CardBody className="p-0 divide-y divide-[#D8D0C3]/60 dark:divide-[#2C2F28]">
              {safeServices.length === 0 ? (
                <div className="p-6 text-center text-xs font-mono text-[#7C7E74] space-y-2">
                  <p>No monitored services registered.</p>
                  <Link to="/app/services">
                    <Button variant="outline" size="sm" icon={Plus}>
                      Add Service
                    </Button>
                  </Link>
                </div>
              ) : (
                safeServices.slice(0, 3).map((srv) => (
                  <div key={srv._id} className="p-3.5 flex items-center justify-between hover:bg-[#FAF7F2]/50 dark:hover:bg-[#20221E]/50 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          srv.status === 'operational'
                            ? 'bg-[#4A6B53]'
                            : srv.status === 'degraded_performance'
                            ? 'bg-[#D97753]'
                            : 'bg-[#C65D3A]'
                        }`}
                      />
                      <div>
                        <span className="text-xs font-semibold text-[#24251F] dark:text-[#F3EFE7] block">
                          {srv.name}
                        </span>
                        <span className="text-[10px] font-mono text-[#7C7E74]">
                          {srv.environment || 'production'} • {srv.latencyMs ?? 0}ms
                        </span>
                      </div>
                    </div>
                    <Badge variant={srv.status || 'operational'} size="xs">
                      {srv.uptimePercentage ?? 100}%
                    </Badge>
                  </div>
                ))
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* 4. LOWER EDITORIAL SPLIT: RELEASES, ACTIVITY STREAM & TEAM WORKLOAD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upcoming Releases (6 Cols) */}
        <Card className="lg:col-span-6">
          <CardHeader
            title="Release Manifests"
            description="Scheduled version rollouts and verification checks"
            action={
              <Link to="/app/releases">
                <Button variant="ghost" size="sm" icon={ArrowUpRight}>
                  Manifests
                </Button>
              </Link>
            }
          />
          <CardBody className="p-0 divide-y divide-[#D8D0C3]/60 dark:divide-[#2C2F28]">
            {safeReleases.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#7C7E74] font-mono">
                No scheduled releases pending deployment.
              </div>
            ) : (
              safeReleases.map((rel) => {
                const completedCount = rel.checklists?.filter((c) => c.completed).length || 0;
                const totalCount = rel.checklists?.length || 1;
                const percent = Math.round((completedCount / totalCount) * 100);

                return (
                  <div
                    key={rel._id}
                    className="p-4 flex items-center justify-between hover:bg-[#FAF7F2]/50 dark:hover:bg-[#20221E]/50 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[#C65D3A]">
                          {rel.version || 'v1.0.0'}
                        </span>
                        <span className="text-xs font-semibold text-[#24251F] dark:text-[#F3EFE7]">
                          {rel.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#7C7E74] dark:text-[#9A9C92] font-mono mt-1">
                        Target: {rel.targetDate ? new Date(rel.targetDate).toLocaleDateString() : 'TBD'} • {rel.projectId?.name || 'Core'}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-2 justify-end mb-1">
                        <div className="w-16 bg-[#E5DED2] dark:bg-[#282B24] h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#C65D3A] h-full rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono font-semibold text-[#24251F] dark:text-[#F3EFE7]">
                          {percent}%
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[#7C7E74]">
                        {completedCount}/{totalCount} checks
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </CardBody>
        </Card>

        {/* Real Activity Stream & Team Workload (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Real Chronological Activity Feed from DB */}
          <Card>
            <CardHeader
              title="Audit & Activity Stream"
              description="Verified chronological operational events"
            />
            <CardBody className="p-0">
              {safeActivities.length > 0 ? (
                <div className="p-4 space-y-3.5 max-h-56 overflow-y-auto">
                  {safeActivities.slice(0, 5).map((act) => (
                    <div key={act._id} className="flex items-start gap-3 text-xs">
                      <div className="w-2 h-2 rounded-full bg-[#C65D3A] mt-1.5 shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs text-[#24251F] dark:text-[#F3EFE7]">
                          <strong className="font-semibold">{act.userId?.name || 'Engineer'}</strong>{' '}
                          <span className="text-[#5A5C54] dark:text-[#A6A89E]">{act.action}</span>{' '}
                          <span className="font-mono text-[11px] text-[#C65D3A]">{act.details?.title || act.entity}</span>
                        </p>
                        <span className="text-[10px] font-mono text-[#7C7E74] dark:text-[#8E9086]">
                          {act.createdAt ? new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''} • {act.entity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs font-mono text-[#7C7E74]">
                  No operational activity recorded yet.
                </div>
              )}
            </CardBody>
          </Card>

          {/* Team Workload */}
          <Card>
            <CardHeader
              title="Team Allocation"
              description="Active assignments by engineer"
              action={
                <Link to="/app/team">
                  <Button variant="ghost" size="sm" icon={ArrowUpRight}>
                    Directory
                  </Button>
                </Link>
              }
            />
            <CardBody className="p-4 space-y-3">
              {safeWorkload.length === 0 ? (
                <div className="py-6 text-center text-xs font-mono text-[#7C7E74]">
                  No active issue allocations recorded.
                </div>
              ) : (
                safeWorkload.slice(0, 3).map((member) => (
                  <div key={member._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={member.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(member.email || member.name || 'user')}`}
                        alt={member.name || 'Engineer'}
                        className="w-6 h-6 rounded-full object-cover ring-1 ring-[#D8D0C3] dark:ring-[#353831]"
                      />
                      <div>
                        <p className="text-xs font-semibold text-[#24251F] dark:text-[#F3EFE7]">{member.name || 'Engineer'}</p>
                        <p className="text-[10px] font-mono text-[#7C7E74]">{member.title || 'Engineer'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-[#E5DED2] dark:bg-[#282B24] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#C65D3A] h-full rounded-full"
                          style={{ width: `${Math.min(100, (((member.openIssues || 0) / 6) * 100))}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono font-bold text-[#24251F] dark:text-[#F3EFE7] min-w-[16px] text-right">
                        {member.openIssues ?? 0}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
