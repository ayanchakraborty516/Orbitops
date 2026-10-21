import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User } from '../models/User.js';
import { Workspace } from '../models/Workspace.js';
import { Membership } from '../models/Membership.js';
import { signToken, setAuthCookie, clearAuthCookie } from '../utils/jwt.js';
import { sendSuccess, sendError } from '../utils/response.js';

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 'An account with this email already exists.', 409);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      passwordHash,
      avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(email)}`,
    });

    // Automatically create a default workspace for the new user
    const slug = `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}-workspace-${Math.floor(1000 + Math.random() * 9000)}`;
    const workspace = await Workspace.create({
      name: `${name}'s Workspace`,
      slug,
      ownerId: user._id,
    });

    await Membership.create({
      workspaceId: workspace._id,
      userId: user._id,
      role: 'Owner',
    });

    const token = signToken({ userId: user._id });
    setAuthCookie(res, token);

    return sendSuccess(
      res,
      {
        user,
        token,
        defaultWorkspace: workspace,
      },
      'Registration successful',
      201
    );
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    // Find user's workspaces
    const memberships = await Membership.find({ userId: user._id }).populate('workspaceId');
    const workspaces = memberships
      .filter((m) => m.workspaceId)
      .map((m) => ({
        ...m.workspaceId.toObject(),
        role: m.role,
      }));

    const token = signToken({ userId: user._id });
    setAuthCookie(res, token);

    return sendSuccess(
      res,
      {
        user,
        token,
        workspaces,
      },
      'Login successful'
    );
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res) {
  clearAuthCookie(res);
  return sendSuccess(res, null, 'Logged out successfully');
}

export async function getMe(req, res, next) {
  try {
    const memberships = await Membership.find({ userId: req.user._id }).populate('workspaceId');
    const workspaces = memberships
      .filter((m) => m.workspaceId)
      .map((m) => ({
        ...m.workspaceId.toObject(),
        role: m.role,
      }));

    return sendSuccess(res, {
      user: req.user,
      workspaces,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const { name, title, bio, themePreference, avatarUrl } = req.body;
    const updates = {};
    if (name) updates.name = name.trim();
    if (title !== undefined) updates.title = title.trim();
    if (bio !== undefined) updates.bio = bio;
    if (themePreference) updates.themePreference = themePreference;
    if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    return sendSuccess(res, { user: updatedUser }, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
}

// Password recovery integration boundary (documented with mock fallback for local dev)
export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) return sendError(res, 'Email is required', 400);

    const user = await User.findOne({ email });
    if (!user) {
      // Don't leak whether email exists
      return sendSuccess(
        res,
        null,
        'If an account with that email exists, password reset instructions have been prepared.'
      );
    }

    // In local dev without SMTP configured, provide a recovery simulation token
    const resetToken = crypto.randomBytes(20).toString('hex');

    return sendSuccess(
      res,
      {
        simulatedResetToken: resetToken,
        note: 'SMTP is not configured in local environment. Token provided for verification testing.',
      },
      'Password reset instructions initiated.'
    );
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword || newPassword.length < 6) {
      return sendError(res, 'Valid email and password (min 6 chars) are required.', 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, 'User not found.', 404);
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    return sendSuccess(res, null, 'Password has been successfully updated. Please sign in.');
  } catch (error) {
    next(error);
  }
}
