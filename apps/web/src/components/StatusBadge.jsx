import React from 'react';

const statusStyles = {
  Received: 'bg-slate-500/20 text-slate-200 ring-1 ring-slate-400/30',
  'In Progress': 'bg-warning-500/20 text-warning-100 ring-1 ring-warning-400/30',
  Resolved: 'bg-civic-500/20 text-civic-100 ring-1 ring-civic-400/30',
  Closed: 'bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-400/30'
};

export const StatusBadge = ({ status }) => {
  const className = statusStyles[status] || statusStyles.Received;
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${className}`}>{status}</span>;
};