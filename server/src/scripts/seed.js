import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../config/db.js';
import {
  User,
  Workspace,
  Membership,
  Project,
  Issue,
  Comment,
  Activity,
  Service,
  Incident,
  Release,
  Deployment,
  Notification,
} from '../models/index.js';
import { logActivity } from '../services/activityService.js';

export async function seedDatabase() {
  console.log('[Seed] Connecting to MongoDB...');
  await connectDB();

  console.log('[Seed] Clearing existing demo data...');
  await Promise.all([
    User.deleteMany({}),
    Workspace.deleteMany({}),
    Membership.deleteMany({}),
    Project.deleteMany({}),
    Issue.deleteMany({}),
    Comment.deleteMany({}),
    Activity.deleteMany({}),
    Service.deleteMany({}),
    Incident.deleteMany({}),
    Release.deleteMany({}),
    Deployment.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  console.log('[Seed] Creating demo users...');
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Password123!', salt);

  const [adminUser, engUser, devUser] = await Promise.all([
    User.create({
      name: 'Elena Rostova',
      email: 'admin@orbitops.dev',
      passwordHash,
      title: 'Principal Systems Architect & Lead',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      bio: 'Managing distributed platform operations and zero-downtime releases.',
      themePreference: 'dark',
    }),
    User.create({
      name: 'Marcus Chen',
      email: 'marcus@orbitops.dev',
      passwordHash,
      title: 'Senior Site Reliability Engineer',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      bio: 'Focused on telemetry metrics, edge networks, and incident resolution.',
      themePreference: 'dark',
    }),
    User.create({
      name: 'Aria Vance',
      email: 'aria@orbitops.dev',
      passwordHash,
      title: 'Senior Frontend Engineer',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      bio: 'Building accessible, fast, and responsive user interfaces.',
      themePreference: 'dark',
    }),
  ]);

  console.log('[Seed] Creating workspace...');
  const workspace = await Workspace.create({
    name: 'OrbitOps Core Engineering',
    slug: 'orbitops-core',
    description: 'Mission-critical software operations, service telemetry, and continuous deployments.',
    ownerId: adminUser._id,
    plan: 'enterprise',
  });

  console.log('[Seed] Creating memberships...');
  await Promise.all([
    Membership.create({ workspaceId: workspace._id, userId: adminUser._id, role: 'Owner' }),
    Membership.create({ workspaceId: workspace._id, userId: engUser._id, role: 'Admin' }),
    Membership.create({ workspaceId: workspace._id, userId: devUser._id, role: 'Member' }),
  ]);

  console.log('[Seed] Creating monitored services...');
  const [apiGateway, authCluster, dbShards, eventPipeline, edgeCDN] = await Promise.all([
    Service.create({
      workspaceId: workspace._id,
      name: 'API Gateway (Envoy)',
      description: 'Reverse proxy and global routing layer for all customer traffic',
      status: 'operational',
      uptimePercentage: 99.99,
      latencyMs: 38,
      environment: 'production',
      isDemo: true,
    }),
    Service.create({
      workspaceId: workspace._id,
      name: 'Authentication Service',
      description: 'OAuth2 / JWT token issuer and session cache',
      status: 'operational',
      uptimePercentage: 99.98,
      latencyMs: 42,
      environment: 'production',
      isDemo: true,
    }),
    Service.create({
      workspaceId: workspace._id,
      name: 'Primary Database Shards',
      description: 'MongoDB Atlas primary replica sets with automated failover',
      status: 'operational',
      uptimePercentage: 99.95,
      latencyMs: 12,
      environment: 'production',
      isDemo: true,
    }),
    Service.create({
      workspaceId: workspace._id,
      name: 'Event Stream Ingestion (Kafka)',
      description: 'High-throughput real-time telemetry and user event broker',
      status: 'degraded_performance',
      uptimePercentage: 99.85,
      latencyMs: 145,
      environment: 'production',
      isDemo: true,
    }),
    Service.create({
      workspaceId: workspace._id,
      name: 'Edge CDN & Static Assets',
      description: 'Global Cloudflare edge caching for client single-page apps',
      status: 'operational',
      uptimePercentage: 100.0,
      latencyMs: 19,
      environment: 'production',
      isDemo: true,
    }),
  ]);

  console.log('[Seed] Creating projects...');
  const [projPlatform, projIngestion, projUI] = await Promise.all([
    Project.create({
      workspaceId: workspace._id,
      name: 'Cloud Platform 3.0',
      key: 'PLAT',
      description: 'Zero-trust infrastructure modernization, Kubernetes auto-scaling, and telemetry overhaul.',
      status: 'active',
      priority: 'high',
      startDate: new Date(Date.now() - 30 * 86400000),
      targetDate: new Date(Date.now() + 45 * 86400000),
      ownerId: adminUser._id,
      members: [adminUser._id, engUser._id],
      tags: ['infrastructure', 'kubernetes', 'security'],
      issueCounter: 5,
    }),
    Project.create({
      workspaceId: workspace._id,
      name: 'Telemetry Ingestion Pipeline',
      key: 'TELEM',
      description: 'High-volume streaming consumer pipeline for server vitals and distributed traces.',
      status: 'active',
      priority: 'critical',
      startDate: new Date(Date.now() - 15 * 86400000),
      targetDate: new Date(Date.now() + 20 * 86400000),
      ownerId: engUser._id,
      members: [engUser._id, devUser._id],
      tags: ['kafka', 'streaming', 'backend'],
      issueCounter: 4,
    }),
    Project.create({
      workspaceId: workspace._id,
      name: 'OrbitOps Design System v2',
      key: 'ORB',
      description: 'Dark-first component library with accessible WCAG AAA contrast and rapid micro-interactions.',
      status: 'active',
      priority: 'medium',
      startDate: new Date(Date.now() - 10 * 86400000),
      targetDate: new Date(Date.now() + 15 * 86400000),
      ownerId: devUser._id,
      members: [devUser._id, adminUser._id],
      tags: ['frontend', 'react', 'design-system'],
      issueCounter: 3,
    }),
  ]);

  console.log('[Seed] Creating kanban issues...');
  const issues = await Promise.all([
    // Project 1 issues
    Issue.create({
      workspaceId: workspace._id,
      projectId: projPlatform._id,
      key: 'PLAT-1',
      title: 'Configure mutual TLS on ingress gateways',
      description: 'Implement SPIFFE/SPIRE certificates and enforce mTLS across all microservice boundaries.',
      type: 'task',
      priority: 'critical',
      status: 'in_progress',
      assigneeId: engUser._id,
      reporterId: adminUser._id,
      labels: ['security', 'network'],
      dueDate: new Date(Date.now() + 3 * 86400000),
      order: 1,
    }),
    Issue.create({
      workspaceId: workspace._id,
      projectId: projPlatform._id,
      key: 'PLAT-2',
      title: 'Auto-scaling policy calibration for burst traffic',
      description: 'Tune HPA CPU/memory thresholds to prevent thrashing during morning traffic surges.',
      type: 'task',
      priority: 'high',
      status: 'todo',
      assigneeId: engUser._id,
      reporterId: adminUser._id,
      labels: ['k8s', 'performance'],
      dueDate: new Date(Date.now() + 7 * 86400000),
      order: 2,
    }),
    Issue.create({
      workspaceId: workspace._id,
      projectId: projPlatform._id,
      key: 'PLAT-3',
      title: 'Upgrade cluster control planes to Kubernetes v1.31',
      description: 'Perform rolling upgrade across staging and test failover resilience.',
      type: 'story',
      priority: 'medium',
      status: 'done',
      assigneeId: adminUser._id,
      reporterId: adminUser._id,
      labels: ['upgrade'],
      dueDate: new Date(Date.now() - 2 * 86400000),
      order: 3,
    }),
    Issue.create({
      workspaceId: workspace._id,
      projectId: projPlatform._id,
      key: 'PLAT-4',
      title: 'Database connection pool saturation under peak load',
      description: 'Mongoose connection pool occasionally maxes out during batched data syncs.',
      type: 'bug',
      priority: 'high',
      status: 'in_review',
      assigneeId: engUser._id,
      reporterId: devUser._id,
      labels: ['database', 'bug'],
      dueDate: new Date(Date.now() + 1 * 86400000),
      order: 4,
    }),

    // Project 2 issues
    Issue.create({
      workspaceId: workspace._id,
      projectId: projIngestion._id,
      key: 'TELEM-1',
      title: 'Partition rebalancing latency in Kafka topic ingest-v1',
      description: 'Consumer lag spikes during worker pod recreation.',
      type: 'bug',
      priority: 'critical',
      status: 'in_progress',
      assigneeId: engUser._id,
      reporterId: engUser._id,
      labels: ['kafka', 'p1'],
      dueDate: new Date(Date.now() + 2 * 86400000),
      order: 1,
    }),
    Issue.create({
      workspaceId: workspace._id,
      projectId: projIngestion._id,
      key: 'TELEM-2',
      title: 'Add backpressure handling for websocket dispatch',
      description: 'Socket.IO payload buffers should drop stale metrics when subscriber slow.',
      type: 'task',
      priority: 'medium',
      status: 'done',
      assigneeId: devUser._id,
      reporterId: engUser._id,
      labels: ['realtime'],
      dueDate: new Date(Date.now() - 4 * 86400000),
      order: 2,
    }),

    // Project 3 issues
    Issue.create({
      workspaceId: workspace._id,
      projectId: projUI._id,
      key: 'ORB-1',
      title: 'Accessible keyboard navigation for kanban board cards',
      description: 'Support arrow keys and Space/Enter to select and move cards across columns without a mouse.',
      type: 'task',
      priority: 'high',
      status: 'done',
      assigneeId: devUser._id,
      reporterId: devUser._id,
      labels: ['a11y', 'kanban'],
      dueDate: new Date(Date.now() - 1 * 86400000),
      order: 1,
    }),
    Issue.create({
      workspaceId: workspace._id,
      projectId: projUI._id,
      key: 'ORB-2',
      title: 'Add status indicator tooltips and dark theme contrast polish',
      description: 'Ensure color token consistency across service health badges and incident severity badges.',
      type: 'task',
      priority: 'medium',
      status: 'in_progress',
      assigneeId: devUser._id,
      reporterId: adminUser._id,
      labels: ['ui', 'theme'],
      dueDate: new Date(Date.now() + 4 * 86400000),
      order: 2,
    }),
  ]);

  console.log('[Seed] Adding comments and activity log...');
  await Comment.create({
    workspaceId: workspace._id,
    issueId: issues[0]._id,
    userId: adminUser._id,
    content: 'Certificates generated for us-east-1 and eu-central-1. Ready for integration test.',
  });

  await logActivity({
    workspaceId: workspace._id,
    userId: adminUser._id,
    action: 'created issue',
    entityType: 'issue',
    entityId: issues[0]._id,
    entityTitle: 'PLAT-1: Configure mutual TLS',
  });

  console.log('[Seed] Creating incidents...');
  await Incident.create({
    workspaceId: workspace._id,
    title: 'Elevated latency in Event Stream Ingestion',
    description: 'Kafka partition rebalancing causing consumer lag up to 4500ms.',
    severity: 'major',
    status: 'investigating',
    serviceIds: [eventPipeline._id],
    leadId: engUser._id,
    timeline: [
      {
        status: 'investigating',
        message: 'Alert triggered: consumer group lag exceeded 5,000 messages. SRE team paged.',
        updatedBy: engUser._id,
        timestamp: new Date(Date.now() - 45 * 60000),
      },
      {
        status: 'identified',
        message: 'Identified node eviction in broker cluster. Commencing stateful recovery.',
        updatedBy: engUser._id,
        timestamp: new Date(Date.now() - 15 * 60000),
      },
    ],
  });

  console.log('[Seed] Creating releases and deployments...');
  const release = await Release.create({
    workspaceId: workspace._id,
    projectId: projPlatform._id,
    version: 'v2.4.0',
    title: 'Core Observability & Security Hardening',
    description: 'Production release bundling mTLS support, optimized db pool sizes, and low-latency incident streaming.',
    status: 'completed',
    targetDate: new Date(),
    releasedDate: new Date(),
    checklists: [
      { item: 'All blockers and critical issues resolved', completed: true, completedBy: adminUser._id },
      { item: 'Unit and end-to-end test suite passing', completed: true, completedBy: devUser._id },
      { item: 'Staging verification approved by QA', completed: true, completedBy: engUser._id },
      { item: 'Database migrations reviewed and tested', completed: true, completedBy: adminUser._id },
      { item: 'Changelog documentation drafted', completed: true, completedBy: adminUser._id },
    ],
    issueIds: [issues[0]._id, issues[2]._id],
    createdBy: adminUser._id,
  });

  await Deployment.create({
    workspaceId: workspace._id,
    releaseId: release._id,
    projectId: projPlatform._id,
    environment: 'production',
    status: 'successful',
    commitHash: '8b3c41a',
    commitMessage: 'feat(core): release v2.4.0 with hardened cluster configs',
    deployedBy: adminUser._id,
    durationSeconds: 34,
    logs: [
      'Pre-flight deployment checks completed: all 5 checklist items passed',
      'Container images pulled: registry.orbitops.dev/core:2.4.0',
      'Traffic canary route verified (0% errors over 180s)',
      '100% production rollout completed without errors',
    ],
    startedAt: new Date(Date.now() - 3600000),
    completedAt: new Date(Date.now() - 3600000 + 34000),
  });

  console.log('[Seed] Database seed completed successfully!');
  console.log('--------------------------------------------------');
  console.log(' Demo credentials:');
  console.log('   Email:    admin@orbitops.dev');
  console.log('   Password: Password123!');
  console.log('   Email:    marcus@orbitops.dev');
  console.log('   Email:    aria@orbitops.dev');
  console.log('--------------------------------------------------');
}

if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase()
    .then(() => disconnectDB())
    .catch((err) => {
      console.error('[Seed Error]:', err);
      process.exit(1);
    });
}
