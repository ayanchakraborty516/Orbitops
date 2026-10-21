import { verifyToken } from '../utils/jwt.js';
import { sendError } from '../utils/response.js';
import { User } from '../models/User.js';

export async function requireAuth(req, res, next) {
  try {
    let token = null;

    // Prioritize explicit Authorization header Bearer token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return sendError(res, 'Authentication required. Please sign in.', 401);
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return sendError(res, 'Session expired or invalid token. Please sign in again.', 401);
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return sendError(res, 'User no longer exists.', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    return sendError(res, 'Authentication failed', 401, error.message);
  }
}
