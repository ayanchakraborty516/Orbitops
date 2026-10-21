import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

export function signToken(payload) {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (err) {
    return null;
  }
}

export function setAuthCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true,
    secure: config.cookieSecure,
    sameSite: config.cookieSecure ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
}

export function clearAuthCookie(res) {
  res.cookie('token', '', {
    httpOnly: true,
    secure: config.cookieSecure,
    sameSite: config.cookieSecure ? 'none' : 'lax',
    expires: new Date(0),
    path: '/',
  });
}
