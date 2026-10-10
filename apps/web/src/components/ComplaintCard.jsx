import React from 'react';
import { StatusBadge } from './StatusBadge.jsx';

export const ComplaintCard = ({ complaint, onClick }) => {
  const verificationBadge = complaint.imageVerified
    ? { label: 'AI Verified', className: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200' }
    : complaint.imageAttachment
      ? { label: 'Needs Review', className: 'border-amber-400/30 bg-amber-500/10 text-amber-200' }
      : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="glass-panel w-full p-5 text-left transition hover:-translate-y-0.5 hover:bg-white/10"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-civic-200">{complaint.complaintNumber}</p>
          <h3 className="mt-2 text-lg font-semibold text-white">{complaint.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm text-slate-300">{complaint.summary || complaint.description}</p>
        </div>
        <StatusBadge status={complaint.status} />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-400">
        <span>Priority: {complaint.priority}</span>
        <span>Category: {complaint.category}</span>
        <span>Department: {complaint.department?.name || 'Unassigned'}</span>
      </div>
      {verificationBadge ? (
        <div className={`mt-4 inline-flex rounded-full border px-3 py-1 text-xs font-medium ${verificationBadge.className}`}>
          {verificationBadge.label}
        </div>
      ) : null}
    </button>
  );
};