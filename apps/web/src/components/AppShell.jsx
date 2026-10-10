import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { NotificationBell } from './NotificationBell.jsx';

const navLinkClass = ({ isActive }) =>
  `rounded-2xl px-4 py-2 text-sm font-medium transition ${isActive ? 'bg-white/15 text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`;

export const AppShell = () => {
  const navigate = useNavigate();
  const user = api.getSessionUser();
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const loadNotificationCount = async () => {
      try {
        const response = await api.notifications();
        setNotificationCount((response.notifications || []).filter((notification) => !notification.isRead).length);
      } catch {
        setNotificationCount(0);
      }
    };

    loadNotificationCount();
  }, []);

  const handleLogout = () => {
    api.logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-ink-900/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-civic-200">Municipal Grievance Agent</p>
            <h1 className="font-display text-xl font-semibold text-white">AI-Powered Triage and Resolution</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <NavLink to="/submit" className={navLinkClass}>Submit</NavLink>
            <NavLink to="/track" className={navLinkClass}>Track</NavLink>
            <NavLink to="/notifications" className={navLinkClass}>Notifications</NavLink>
            {user?.role !== 'citizen' ? <NavLink to="/admin" className={navLinkClass}>Admin</NavLink> : null}
            <NotificationBell count={notificationCount} />
            <button type="button" onClick={handleLogout} className="civic-button-secondary">Logout</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};