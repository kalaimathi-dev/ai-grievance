import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { RoleShell } from './components/RoleShell.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { CitizenHome } from './pages/CitizenHome.jsx';
import { AdminDashboard } from './pages/AdminDashboard.jsx';
import { Login } from './pages/Login.jsx';
import { NotFound } from './pages/NotFound.jsx';
import { Notifications } from './pages/Notifications.jsx';
import { OfficerWorkbench } from './pages/OfficerWorkbench.jsx';
import { Register } from './pages/Register.jsx';
import { SubmitComplaint } from './pages/SubmitComplaint.jsx';
import { TrackComplaint } from './pages/TrackComplaint.jsx';
import { getRoleHome } from './utils/roles.js';

export const App = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route
      element={
        <ProtectedRoute>
          <RoleShell />
        </ProtectedRoute>
      }
    >
      <Route path="/" element={<Navigate to={getRoleHome(JSON.parse(localStorage.getItem('grievance_user') || 'null')?.role)} replace />} />
      <Route path="/citizen" element={<ProtectedRoute allowedRoles={['citizen']}><CitizenHome /></ProtectedRoute>} />
      <Route path="/submit" element={<ProtectedRoute allowedRoles={['citizen']}><SubmitComplaint /></ProtectedRoute>} />
      <Route path="/track" element={<ProtectedRoute allowedRoles={['citizen']}><TrackComplaint /></ProtectedRoute>} />
      <Route path="/workbench" element={<ProtectedRoute allowedRoles={['officer']}><OfficerWorkbench /></ProtectedRoute>} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
    </Route>
    <Route path="*" element={<NotFound />} />
  </Routes>
);