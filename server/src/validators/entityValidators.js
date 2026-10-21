import { sendError } from '../utils/response.js';

export function validateProject(req, res, next) {
  const { name, key } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Project name must be at least 2 characters long.');
  }

  if (req.method === 'POST') {
    if (!key || typeof key !== 'string' || key.trim().length < 2 || key.trim().length > 10) {
      errors.push('Project key is required (2-10 characters, e.g. OPS).');
    }
  }

  if (errors.length > 0) {
    return sendError(res, 'Project validation failed', 400, errors);
  }

  next();
}

export function validateIssue(req, res, next) {
  const { title } = req.body;
  const errors = [];

  if (!title || typeof title !== 'string' || title.trim().length < 2) {
    errors.push('Issue title is required and must be at least 2 characters.');
  }

  if (req.method === 'POST') {
    if (!req.body.projectId) {
      errors.push('Project ID is required.');
    }
  }

  if (errors.length > 0) {
    return sendError(res, 'Issue validation failed', 400, errors);
  }

  next();
}

export function validateIncident(req, res, next) {
  const { title } = req.body;
  const errors = [];

  if (!title || typeof title !== 'string' || title.trim().length < 3) {
    errors.push('Incident title is required and must be at least 3 characters.');
  }

  if (errors.length > 0) {
    return sendError(res, 'Incident validation failed', 400, errors);
  }

  next();
}

export function validateRelease(req, res, next) {
  const { version, title, projectId } = req.body;
  const errors = [];

  if (req.method === 'POST') {
    if (!version || typeof version !== 'string' || version.trim().length < 1) {
      errors.push('Release version (e.g. v1.0.0) is required.');
    }
    if (!title || typeof title !== 'string' || title.trim().length < 2) {
      errors.push('Release title is required.');
    }
    if (!projectId) {
      errors.push('Project ID is required.');
    }
  }

  if (errors.length > 0) {
    return sendError(res, 'Release validation failed', 400, errors);
  }

  next();
}
