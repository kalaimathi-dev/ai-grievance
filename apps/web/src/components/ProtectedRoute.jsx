import React from 'react';
import { Navigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { getRoleHome } from '../utils/roles.js';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const user = api.getSessionUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to={getRoleHome(user.role)} replace />;
  }

  return children;
};