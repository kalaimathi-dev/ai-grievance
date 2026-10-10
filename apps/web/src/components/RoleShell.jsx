import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { NotificationBell } from './NotificationBell.jsx';
import { getRoleHome, getRoleLabel } from '../utils/roles.js';

const navClass = ({ isActive }) =>
  `rounded-2xl px-4 py-2 text-sm font-medium transition ${isActive ? 'bg-white/15 text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`;

const roleMeta = {
  citizen: {
    shellClass: 'bg-[radial-gradient(circle_at_top_left,rgba(28,161,141,0.24),transparent_34%),radial-gradient(circle_at_top_right,rgba(77,121,184,0.2),transparent_28%),linear-gradient(180deg,#08111f_0%,#101827_45%,#0f172a_100%)]',
    headerClass: 'border-civic-400/20 bg-ink-900/75',
    labelClass: 'text-civic-200',
    badgeClass: 'border-civic-400/30 bg-civic-500/10 text-civic-100',
    accentClass: 'border-civic-400/20 bg-civic-500/10',
    title: 'Citizen portal',
    subtitle: 'Report, track, and get status updates from municipal teams.',
    routes: [
      { to: '/citizen', label: 'Home' },
      { to: '/submit', label: 'Submit' },
      { to: '/track', label: 'Track' },
      { to: '/notifications', label: 'Notifications' }
    ]
  },
  officer: {
    shellClass: 'bg-[radial-gradient(circle_at_top_left,rgba(247,188,20,0.2),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(77,121,184,0.2),transparent_28%),linear-gradient(180deg,#09111d_0%,#111827_48%,#0f172a_100%)]',
    headerClass: 'border-warning-400/20 bg-[#0b1220]/80',
    labelClass: 'text-warning-200',
    badgeClass: 'border-warning-400/30 bg-warning-500/10 text-warning-100',
    accentClass: 'border-warning-400/20 bg-warning-500/10',
    title: 'Officer workbench',
    subtitle: 'Prioritize cases, update status, and keep the queue moving.',
    routes: [
      { to: '/workbench', label: 'Workbench' },
      { to: '/notifications', label: 'Notifications' }
    ]
  },
  admin: {
    shellClass: 'bg-[radial-gradient(circle_at_top_right,rgba(78,121,184,0.24),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(20,184,166,0.18),transparent_28%),linear-gradient(180deg,#050b16_0%,#0b1220_44%,#111827_100%)]',
    headerClass: 'border-ink-400/20 bg-ink-900/85',
    labelClass: 'text-ink-200',
    badgeClass: 'border-ink-300/30 bg-ink-500/10 text-ink-100',
    accentClass: 'border-ink-300/20 bg-ink-500/10',
    title: 'Administration console',
    subtitle: 'Monitor operations, review analytics, and intervene when needed.',
    routes: [
      { to: '/admin', label: 'Dashboard' },
      { to: '/notifications', label: 'Notifications' }
    ]
  }
};

const ShellHeader = ({ user, notificationCount, onLogout, config }) => (
  <header className={`sticky top-0 z-30 border-b backdrop-blur-xl ${config.headerClass}`}>
    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
      <div>
        <p className={`text-xs uppercase tracking-[0.35em] ${config.labelClass}`}>Municipal grievance system</p>
        <h1 className="mt-1 font-display text-xl font-semibold text-white">{config.title}</h1>
        <p className="mt-1 text-sm text-slate-300">{config.subtitle}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {config.routes.map((route) => (
          <NavLink key={route.to} to={route.to} className={navClass}>
            {route.label}
          </NavLink>
        ))}
        <NotificationBell count={notificationCount} />
        <button type="button" onClick={onLogout} className="civic-button-secondary">
          Logout
        </button>
      </div>
    </div>
  </header>
);

const CitizenShell = ({ user, notificationCount, onLogout, config }) => (
  <div className={`min-h-screen ${config.shellClass}`}>
    <ShellHeader user={user} notificationCount={notificationCount} onLogout={onLogout} config={config} />
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className={`glass-panel border ${config.accentClass} p-8`}>
          <p className={`text-xs uppercase tracking-[0.35em] ${config.labelClass}`}>{getRoleLabel(user.role)}</p>
          <h2 className="mt-3 text-4xl font-bold font-display text-white">Get a response without the runaround</h2>
          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300">
            Submit issues, check progress, and read each status update in one place.
            The AI triage engine auto-classifies your grievance before it reaches the right department.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Link to="/submit" className="rounded-3xl border border-white/10 bg-white/5 p-4 transition hover:-translate-y-0.5 hover:bg-white/10">
              <p className="text-xs uppercase tracking-[0.3em] text-civic-200">Step 1</p>
              <h3 className="mt-2 font-semibold text-white">Submit</h3>
            </Link>
            <Link to="/track" className="rounded-3xl border border-white/10 bg-white/5 p-4 transition hover:-translate-y-0.5 hover:bg-white/10">
              <p className="text-xs uppercase tracking-[0.3em] text-civic-200">Step 2</p>
              <h3 className="mt-2 font-semibold text-white">Track</h3>
            </Link>
            <Link to="/notifications" className="rounded-3xl border border-white/10 bg-white/5 p-4 transition hover:-translate-y-0.5 hover:bg-white/10">
              <p className="text-xs uppercase tracking-[0.3em] text-civic-200">Step 3</p>
              <h3 className="mt-2 font-semibold text-white">Notify</h3>
            </Link>
          </div>
          <div className="mt-6 rounded-3xl border border-civic-400/20 bg-civic-500/10 p-4 text-sm text-civic-50">
            {notificationCount > 0
              ? `${notificationCount} live updates are waiting in your inbox.`
              : 'You will see new complaint updates and officer replies here.'}
          </div>
        </section>

        <section className="glass-panel border-white/10 p-6">
          <Outlet />
        </section>
      </div>
    </main>
  </div>
);

const OfficerShell = ({ user, notificationCount, onLogout, config }) => (
  <div className={`min-h-screen ${config.shellClass}`}>
    <ShellHeader user={user} notificationCount={notificationCount} onLogout={onLogout} config={config} />
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8">
      <aside className={`glass-panel border ${config.accentClass} p-6`}>
        <p className={`text-xs uppercase tracking-[0.35em] ${config.labelClass}`}>{getRoleLabel(user.role)}</p>
        <h2 className="mt-3 text-2xl font-bold font-display text-white">Operational queue</h2>
        <p className="mt-2 text-sm text-slate-300">Focus on high-priority complaints and keep the municipal queue moving.</p>
        <div className="mt-6 space-y-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Priority lens</p>
            <p className="mt-1 text-white">Critical and high issues first</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Workflow</p>
            <p className="mt-1 text-white">Review, update, resolve, close</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Inbox</p>
            <p className="mt-1 text-white">{notificationCount} unread updates</p>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-2">
          <NavLink to="/workbench" className={navClass}>Workbench</NavLink>
          <NavLink to="/notifications" className={navClass}>Notifications</NavLink>
        </div>
      </aside>

      <section className="space-y-6">
        <Outlet />
      </section>
    </main>
  </div>
);

const AdminShell = ({ user, notificationCount, onLogout, config }) => (
  <div className={`min-h-screen ${config.shellClass}`}>
    <ShellHeader user={user} notificationCount={notificationCount} onLogout={onLogout} config={config} />
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[300px_1fr] lg:px-8">
      <aside className={`glass-panel border ${config.accentClass} p-6`}>
        <p className={`text-xs uppercase tracking-[0.35em] ${config.labelClass}`}>{getRoleLabel(user.role)}</p>
        <h2 className="mt-3 text-2xl font-bold font-display text-white">Command center</h2>
        <p className="mt-2 text-sm text-slate-300">Analytics, routing, and escalation tools stay in one place for fast oversight.</p>
        <div className="mt-6 space-y-3 text-sm text-slate-300">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Real-time complaint analytics</div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">SLA and priority monitoring</div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Unread notifications: {notificationCount}</div>
        </div>
        <div className="mt-6 flex flex-col gap-2">
          <NavLink to="/admin" className={navClass}>Dashboard</NavLink>
          <NavLink to="/notifications" className={navClass}>Notifications</NavLink>
        </div>
      </aside>

      <section className="space-y-6">
        <Outlet />
      </section>
    </main>
  </div>
);

export const RoleShell = () => {
  const navigate = useNavigate();
  const user = api.getSessionUser();
  const role = user?.role || 'citizen';
  const config = roleMeta[role] || roleMeta.citizen;
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

  const sharedProps = {
    user,
    notificationCount,
    onLogout: handleLogout,
    config
  };

  if (role === 'officer') {
    return <OfficerShell {...sharedProps} />;
  }

  if (role === 'admin') {
    return <AdminShell {...sharedProps} />;
  }

  return <CitizenShell {...sharedProps} />;
};
