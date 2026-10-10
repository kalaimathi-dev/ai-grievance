import React, { useEffect, useState } from 'react';
import { api } from '../api/client.js';

export const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const response = await api.notifications();
        setNotifications(response.notifications || []);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  const markRead = async (id) => {
    await api.markNotificationRead(id);
    setNotifications((current) => current.map((notification) => (notification._id === id ? { ...notification, isRead: true } : notification)));
  };

  return (
    <div className="glass-panel p-8">
      <p className="text-xs uppercase tracking-[0.35em] text-civic-200">Notification Center</p>
      <h2 className="mt-2 text-3xl font-bold font-display text-white">Live updates</h2>

      {loading ? <div className="mt-6 text-slate-300">Loading notifications...</div> : null}

      <div className="mt-6 space-y-3">
        {notifications.map((notification) => (
          <div key={notification._id} className={`rounded-2xl border p-4 ${notification.isRead ? 'border-white/10 bg-white/5' : 'border-civic-400/30 bg-civic-500/10'}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-white">{notification.title}</p>
                <p className="mt-1 text-sm text-slate-300">{notification.message}</p>
                <p className="mt-2 text-xs text-slate-400">{new Date(notification.createdAt).toLocaleString()}</p>
              </div>
              {!notification.isRead ? (
                <button type="button" onClick={() => markRead(notification._id)} className="civic-button-secondary text-xs">
                  Mark read
                </button>
              ) : null}
            </div>
          </div>
        ))}

        {!loading && notifications.length === 0 ? <div className="text-sm text-slate-300">No notifications yet.</div> : null}
      </div>
    </div>
  );
};