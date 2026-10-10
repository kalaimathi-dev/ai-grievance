import React from 'react';

export const NotificationBell = ({ count = 0 }) => (
  <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
    <span>Notifications</span>
    <span className="rounded-full bg-civic-500 px-2 py-0.5 text-xs font-semibold text-white">{count}</span>
  </div>
);