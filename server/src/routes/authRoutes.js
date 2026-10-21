import { Router } from 'express';
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { validateRegister, validateLogin } from '../validators/authValidator.js';

const router = Router();

router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);
router.post('/logout', logout);
router.get('/me', requireAuth, getMe);
router.patch('/profile', requireAuth, updateProfile);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);

export default router;
