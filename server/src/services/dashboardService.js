import mongoose from 'mongoose';
import { Project } from '../models/Project.js';
import { Issue } from '../models/Issue.js';
import { Service } from '../models/Service.js';
import { Incident } from '../models/Incident.js';
import { Release } from '../models/Release.js';
import { Activity } from '../models/Activity.js';
import { Membership } from '../models/Membership.js';

export async function getDashboardStats(workspaceId) {
  const wId = new mongoose.Types.ObjectId(workspaceId);
  const now = new Date();

  // 1. Projects stats
  const [totalProjects, activeProjects] = await Promise.all([
    Project.countDocuments({ workspaceId: wId }),
    Project.countDocuments({ workspaceId: wId, status: 'active' }),
  ]);

  // 2. Issues stats
  const issuesAgg = await Issue.aggregate([
    { $match: { workspaceId: wId } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const issueStatusCounts = {
    backlog: 0,
    todo: 0,
    in_progress: 0,
    in_review: 0,
    done: 0,
    canceled: 0,
  };
  issuesAgg.forEach((item) => {
    if (issueStatusCounts[item._id] !== undefined) {
      issueStatusCounts[item._id] = item.count;
    }
  });

  const openIssuesCount =
    issueStatusCounts.todo + issueStatusCounts.in_progress + issueStatusCounts.in_review;
  const resolvedIssuesCount = issueStatusCounts.done;

  const overdueIssuesCount = await Issue.countDocuments({
    workspaceId: wId,
    status: { $nin: ['done', 'canceled'] },
    dueDate: { $lt: now },
  });

  // 3. Priority distribution
  const priorityAgg = await Issue.aggregate([
    { $match: { workspaceId: wId } },
    {
      $group: {
        _id: '$priority',
        count: { $sum: 1 },
      },
    },
  ]);
  const priorityCounts = { low: 0, medium: 0, high: 0, critical: 0 };
  priorityAgg.forEach((p) => {
    if (priorityCounts[p._id] !== undefined) {
      priorityCounts[p._id] = p.count;
    }
  });

  // 4. Issue resolution trend (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const resolutionTrendAgg = await Issue.aggregate([
    {
      $match: {
        workspaceId: wId,
        updatedAt: { $gte: sevenDaysAgo },
        status: 'done',
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } },
        resolved: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Fill in all 7 days even if 0
  const trendMap = new Map();
  resolutionTrendAgg.forEach((item) => trendMap.set(item._id, item.resolved));

  const resolutionTrend = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    resolutionTrend.push({
      date: dateStr,
      label: dayLabel,
      resolved: trendMap.get(dateStr) || 0,
    });
  }

  // 5. Services health summary
  const services = await Service.find({ workspaceId: wId }).sort({ status: -1 }).limit(10);
  const totalServices = services.length;
  const operationalServices = services.filter((s) => s.status === 'operational').length;
  const degradedServices = services.filter((s) => s.status !== 'operational').length;
  const overallUptime =
    totalServices > 0
      ? (
          services.reduce((acc, s) => acc + (s.uptimePercentage || 100), 0) /
          totalServices
        ).toFixed(2)
      : '0.00';

  // 6. Active & Recent Incidents
  const [activeIncidentsCount, totalIncidentsCount, recentIncidents] = await Promise.all([
    Incident.countDocuments({ workspaceId: wId, status: { $ne: 'resolved' } }),
    Incident.countDocuments({ workspaceId: wId }),
    Incident.find({ workspaceId: wId })
      .populate('leadId', 'name email avatarUrl')
      .populate('serviceIds', 'name status')
      .sort({ createdAt: -1 })
      .limit(5),
  ]);

  // 7. Upcoming Releases
  const upcomingReleases = await Release.find({
    workspaceId: wId,
    status: { $in: ['draft', 'scheduled', 'in_progress'] },
  })
    .populate('projectId', 'name key')
    .sort({ targetDate: 1 })
    .limit(4);

  // 8. Team workload (issues assigned per user)
  const workloadAgg = await Issue.aggregate([
    { $match: { workspaceId: wId, status: { $nin: ['done', 'canceled'] }, assigneeId: { $ne: null } } },
    {
      $group: {
        _id: '$assigneeId',
        openIssues: { $sum: 1 },
      },
    },
    { $sort: { openIssues: -1 } },
    { $limit: 6 },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    {
      $project: {
        _id: 1,
        openIssues: 1,
        name: '$user.name',
        email: '$user.email',
        avatarUrl: '$user.avatarUrl',
        title: '$user.title',
      },
    },
  ]);

  // 9. Recent Activity
  const recentActivities = await Activity.find({ workspaceId: wId })
    .populate('userId', 'name email avatarUrl')
    .sort({ createdAt: -1 })
    .limit(10);

  return {
    metrics: {
      totalProjects,
      activeProjects,
      openIssues: openIssuesCount,
      overdueIssues: overdueIssuesCount,
      resolvedIssues: resolvedIssuesCount,
      totalIssues: openIssuesCount + resolvedIssuesCount,
      activeIncidents: activeIncidentsCount,
      totalIncidents: totalIncidentsCount,
      servicesOperational: operationalServices,
      servicesTotal: totalServices,
      servicesDegraded: degradedServices,
      averageUptime: Number(overallUptime),
    },
    issueStatusCounts,
    priorityCounts,
    resolutionTrend,
    services,
    recentIncidents,
    upcomingReleases,
    teamWorkload: workloadAgg,
    recentActivities,
  };
}
