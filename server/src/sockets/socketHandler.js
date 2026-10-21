import { verifyToken } from '../utils/jwt.js';
import { Membership } from '../models/Membership.js';

let ioInstance = null;

export function initSocketIO(io) {
  ioInstance = io;

  // Socket middleware for authentication
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.cookie
          ?.split('; ')
          .find((row) => row.startsWith('token='))
          ?.split('=')[1];

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = verifyToken(token);
      if (!decoded || !decoded.userId) {
        return next(new Error('Invalid token'));
      }

      socket.userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    // Join personal user room for direct notifications
    socket.join(`user:${socket.userId}`);

    // Join workspace room after verifying membership
    socket.on('join_workspace', async ({ workspaceId }) => {
      try {
        if (!workspaceId) return;

        const isMember = await Membership.exists({
          workspaceId,
          userId: socket.userId,
        });

        if (isMember) {
          socket.join(`workspace:${workspaceId}`);
        } else {
          socket.emit('error', { message: 'Unauthorized workspace access' });
        }
      } catch (err) {
        console.error('[Socket Join Error]:', err.message);
      }
    });

    socket.on('leave_workspace', ({ workspaceId }) => {
      if (workspaceId) {
        socket.leave(`workspace:${workspaceId}`);
      }
    });

    socket.on('disconnect', () => {
      // Cleanly handled
    });
  });

  return io;
}

export function emitToWorkspace(workspaceId, event, data) {
  if (ioInstance && workspaceId) {
    ioInstance.to(`workspace:${workspaceId}`).emit(event, data);
  }
}

export function emitToUser(userId, event, data) {
  if (ioInstance && userId) {
    ioInstance.to(`user:${userId}`).emit(event, data);
  }
}
