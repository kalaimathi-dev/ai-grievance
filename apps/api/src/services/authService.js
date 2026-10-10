import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { env } from '../config/env.js';
import HttpError from '../utils/httpError.js';
import { UserRoles } from '../utils/constants.js';

const sanitizeUser = (user) => {
  if (!user) {
    return null;
  }

  const serialized = user.toObject ? user.toObject() : { ...user };
  delete serialized.passwordHash;
  return serialized;
};

const buildToken = (userId) => jwt.sign({ sub: String(userId) }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

export const registerUser = async ({ name, email, password, phone = '', role = UserRoles.CITIZEN, department = null, employeeId = '' }) => {
  if (!name || !email || !password) {
    throw new HttpError(400, 'Name, email, and password are required');
  }

  const safeRole = role === UserRoles.CITIZEN ? UserRoles.CITIZEN : UserRoles.CITIZEN;

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new HttpError(409, 'An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    phone,
    passwordHash,
    role: safeRole,
    department,
    employeeId
  });

  const token = buildToken(user._id);
  return {
    user: sanitizeUser(user),
    token
  };
};

export const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new HttpError(400, 'Email and password are required');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!user) {
    throw new HttpError(401, 'Invalid email or password');
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new HttpError(401, 'Invalid email or password');
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = buildToken(user._id);
  const publicUser = sanitizeUser(user);
  return {
    user: publicUser,
    token
  };
};

export const getProfile = async (userId) => {
  const user = await User.findById(userId).populate('department').select('-passwordHash');
  if (!user) {
    throw new HttpError(404, 'User profile not found');
  }

  return sanitizeUser(user);
};