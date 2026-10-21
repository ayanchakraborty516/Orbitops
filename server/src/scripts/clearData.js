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

export async function clearAllDemoRecords() {
  console.log('[ClearData] Connecting to MongoDB...');
  await connectDB();

  console.log('[ClearData] Removing seed documents via Mongoose models (preserving collections & schemas)...');
  const results = await Promise.all([
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

  console.log('[ClearData] Records removed count:', {
    users: results[0].deletedCount,
    workspaces: results[1].deletedCount,
    memberships: results[2].deletedCount,
    projects: results[3].deletedCount,
    issues: results[4].deletedCount,
    comments: results[5].deletedCount,
    activities: results[6].deletedCount,
    services: results[7].deletedCount,
    incidents: results[8].deletedCount,
    releases: results[9].deletedCount,
    deployments: results[10].deletedCount,
    notifications: results[11].deletedCount,
  });

  await disconnectDB();
  console.log('[ClearData] Database cleanup finished safely.');
}

if (process.argv[1] && process.argv[1].endsWith('clearData.js')) {
  clearAllDemoRecords()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[ClearData] Error:', err);
      process.exit(1);
    });
}
