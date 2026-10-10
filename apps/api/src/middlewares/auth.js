import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import HttpError from '../utils/httpError.js';
import User from '../models/User.js';
import { UserRoles } from '../utils/constants.js';

export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new HttpError(401, 'Authentication required'));
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(payload.sub).select('-passwordHash');

    if (!user) {
      return next(new HttpError(401, 'User not found'));
    }

    req.user = user;
    next();
  } catch (error) {
    next(new HttpError(401, 'Invalid or expired token'));
  }
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(new HttpError(401, 'Authentication required'));
  }

  const allowedRoles = roles.length > 0 ? roles : [UserRoles.ADMIN];

  if (!allowedRoles.includes(req.user.role)) {
    return next(new HttpError(403, 'You do not have permission to access this resource'));
  }

  next();
};