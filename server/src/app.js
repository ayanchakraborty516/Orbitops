import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from './config/env.js';
import apiRouter from './routes/apiRouter.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS Allowed Origins
export const allowedOrigins = [
  config.clientOrigin,
  'http://localhost:3000',
  'http://localhost:4173',
  'http://localhost:5000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:4173',
  'http://127.0.0.1:5000',
  'http://127.0.0.1:5173',
];

export function createApp() {
  const app = express();

  // Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: false, // allow flexible development and preview
      crossOriginEmbedderPolicy: false,
    })
  );

  app.use(
    cors({
      origin: (origin, callback) => {
        // allow requests with no origin (e.g. mobile apps, curl, server-to-server)
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(null, true); // Permissive in dev/testing while honoring credentials
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-workspace-id'],
    })
  );

  // Body Parsing & Cookies
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));
  app.use(cookieParser());

  // General API Rate Limiting
  app.use('/api', apiLimiter);

  // Health root endpoint
  app.get('/health', (req, res) => res.redirect('/api/v1/health'));

  // Mount API V1
  app.use('/api/v1', apiRouter);

  // In production or when client/dist exists, serve client static files
  const distPath = path.resolve(__dirname, '../../client/dist');
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/socket.io')) {
        return next();
      }
      const ext = path.extname(req.path);
      if (ext && ext !== '.html') {
        return next();
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Catch-all 404 for unmatched API routes
  app.use(notFoundHandler);

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}
