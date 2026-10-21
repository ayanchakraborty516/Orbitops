import http from 'http';
import { Server } from 'socket.io';
import { createApp, allowedOrigins } from './app.js';
import { connectDB } from './config/db.js';
import { config } from './config/env.js';
import { initSocketIO } from './sockets/socketHandler.js';

async function bootstrap() {
  // Connect to MongoDB
  await connectDB();

  const app = createApp();
  const server = http.createServer(app);

  // Initialize Socket.IO
  const io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  initSocketIO(io);

  server.listen(config.port, () => {
    console.log(`===============================================`);
    console.log(` OrbitOps Server running on port ${config.port}`);
    console.log(` Environment: ${config.nodeEnv}`);
    console.log(` API Base: http://localhost:${config.port}/api/v1`);
    console.log(` Health: http://localhost:${config.port}/api/v1/health`);
    console.log(`===============================================`);
  });

  // Graceful shutdown
  const shutdown = async () => {
    console.log('\n[OrbitOps] Gracefully shutting down...');
    server.close(() => {
      console.log('[OrbitOps] HTTP Server closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap().catch((err) => {
  console.error('[Fatal Error starting server]:', err);
  process.exit(1);
});
