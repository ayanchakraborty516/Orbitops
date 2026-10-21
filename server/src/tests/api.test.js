import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import { createApp } from '../app.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { User, Workspace, Membership } from '../models/index.js';

let server;
let baseUrl;
const testCredentials = {
  name: 'Test SRE',
  email: `test-runner-${Date.now()}@orbitops.internal`,
  password: 'TestPassword123!',
};
let testToken;
let testWorkspaceId;
let testUserId;

test.before(async () => {
  await connectDB();
  const app = createApp();
  server = http.createServer(app);
  await new Promise((resolve) => {
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}/api/v1`;
      resolve();
    });
  });

  // Register a test user fixture for the test suite
  const regRes = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testCredentials),
  });
  const regData = await regRes.json();
  testToken = regData.data.token;
  testUserId = regData.data.user._id;
  testWorkspaceId = regData.data.defaultWorkspace._id;
});

test.after(async () => {
  if (testUserId) {
    await Membership.deleteMany({ userId: testUserId });
    await Workspace.deleteMany({ ownerId: testUserId });
    await User.findByIdAndDelete(testUserId);
  }
  await new Promise((resolve) => server.close(resolve));
  await disconnectDB();
});

test('GET /health returns 200 and healthy database status', async () => {
  const res = await fetch(`${baseUrl}/health`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, 'healthy');
  assert.equal(data.services.database, 'connected');
});

test('POST /auth/login with valid user credentials succeeds', async () => {
  const res = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testCredentials.email,
      password: testCredentials.password,
    }),
  });

  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.success, true);
  assert.ok(body.data.token);
  assert.equal(body.data.user.email, testCredentials.email);
  assert.ok(body.data.workspaces.length > 0);
});

test('POST /auth/login with invalid password fails with 401', async () => {
  const res = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testCredentials.email,
      password: 'WrongPassword!',
    }),
  });

  assert.equal(res.status, 401);
  const body = await res.json();
  assert.equal(body.success, false);
});

test('Workspace authorization protects projects from unauthenticated requests', async () => {
  const res = await fetch(`${baseUrl}/projects`);
  assert.equal(res.status, 401);
});

test('Workspace-scoped queries reject unauthorized workspace IDs', async () => {
  // Try accessing a random non-existent workspace ID with valid token
  const fakeWorkspaceId = '666666666666666666666666';
  const res = await fetch(`${baseUrl}/projects`, {
    headers: {
      Authorization: `Bearer ${testToken}`,
      'x-workspace-id': fakeWorkspaceId,
    },
  });

  assert.equal(res.status, 403);
  const body = await res.json();
  assert.equal(body.success, false);
});

test('Authenticated user with valid workspace can fetch dashboard stats', async () => {
  const res = await fetch(`${baseUrl}/dashboard`, {
    headers: {
      Authorization: `Bearer ${testToken}`,
      'x-workspace-id': testWorkspaceId,
    },
  });

  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.success, true);
  assert.equal(typeof body.data.metrics.totalProjects, 'number');
  assert.equal(typeof body.data.metrics.totalIssues, 'number');
  assert.equal(typeof body.data.metrics.totalIncidents, 'number');
  assert.ok(body.data.resolutionTrend.length === 7);
  assert.ok(Array.isArray(body.data.services));
  assert.ok(Array.isArray(body.data.recentIncidents));
  assert.ok(Array.isArray(body.data.upcomingReleases));
  assert.ok(Array.isArray(body.data.teamWorkload));
  assert.ok(Array.isArray(body.data.recentActivities));
});

test('Bearer token header takes precedence over invalid or stale cookies', async () => {
  const res = await fetch(`${baseUrl}/dashboard`, {
    headers: {
      Authorization: `Bearer ${testToken}`,
      Cookie: 'token=invalid_stale_expired_token_from_past_seed_run',
      'x-workspace-id': testWorkspaceId,
    },
  });

  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.success, true);
});

test('Dashboard rejects requests missing workspace identifier with 400', async () => {
  const res = await fetch(`${baseUrl}/dashboard`, {
    headers: {
      Authorization: `Bearer ${testToken}`,
    },
  });

  assert.equal(res.status, 400);
  const body = await res.json();
  assert.equal(body.success, false);
  assert.match(body.message, /Workspace ID is required/i);
});
