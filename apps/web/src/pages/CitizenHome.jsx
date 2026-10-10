import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { MetricCard } from '../components/MetricCard.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';

export const CitizenHome = () => {
  const [complaints, setComplaints] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const [complaintsResponse, notificationsResponse] = await Promise.all([
          api.listComplaints(),
          api.notifications()
        ]);
        setComplaints(complaintsResponse.complaints || []);
        setNotifications(notificationsResponse.notifications || []);
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, []);

  const openComplaints = complaints.filter((complaint) => complaint.status !== 'Closed');
  const recentUpdates = notifications.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Filed complaints" value={complaints.length} hint="All grievances linked to your account" />
        <MetricCard label="Open cases" value={openComplaints.length} hint="Still being handled by the municipality" />
        <MetricCard label="Unread updates" value={notifications.filter((notification) => !notification.isRead).length} hint="Fresh movement on your requests" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Link to="/submit" className="rounded-3xl border border-civic-400/30 bg-civic-500/10 p-5 transition hover:-translate-y-0.5 hover:bg-civic-500/15">
          <p className="text-xs uppercase tracking-[0.3em] text-civic-200">Step 1</p>
          <h3 className="mt-2 text-lg font-semibold text-white">Submit a grievance</h3>
          <p className="mt-2 text-sm text-slate-300">Write the problem and let AI suggest category and priority.</p>
        </Link>
        <Link to="/track" className="rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:-translate-y-0.5 hover:bg-white/10">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Step 2</p>
          <h3 className="mt-2 text-lg font-semibold text-white">Track progress</h3>
          <p className="mt-2 text-sm text-slate-300">See timeline updates and status changes in one place.</p>
        </Link>
        <Link to="/notifications" className="rounded-3xl border border-warning-400/30 bg-warning-500/10 p-5 transition hover:-translate-y-0.5 hover:bg-warning-500/15">
          <p className="text-xs uppercase tracking-[0.3em] text-warning-200">Step 3</p>
          <h3 className="mt-2 text-lg font-semibold text-white">Read alerts</h3>
          <p className="mt-2 text-sm text-slate-300">Get notified when your complaint status changes.</p>
        </Link>
      </div>

      <section className="glass-panel border-civic-400/20 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-civic-200">Citizen Snapshot</p>
            <h2 className="mt-1 text-2xl font-bold font-display text-white">Latest complaint activity</h2>
          </div>
          <Link to="/submit" className="civic-button-secondary">New complaint</Link>
        </div>

        <div className="mt-6 space-y-3">
          {loading ? <div className="text-slate-300">Loading your activity...</div> : null}
          {!loading && recentUpdates.length === 0 ? <div className="text-sm text-slate-300">No updates yet. Submit your first complaint to get started.</div> : null}
          {recentUpdates.map((notification) => (
            <div key={notification._id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-white">{notification.title}</p>
                  <p className="mt-1 text-sm text-slate-300">{notification.message}</p>
                </div>
                {!notification.isRead ? <StatusBadge status="Received" /> : <StatusBadge status="Resolved" />}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};