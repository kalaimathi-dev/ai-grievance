import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';
import { MetricCard } from '../components/MetricCard.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';

const STATUS_OPTIONS = ['Received', 'In Progress', 'Resolved', 'Closed'];

export const OfficerWorkbench = () => {
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [statusDraft, setStatusDraft] = useState('In Progress');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadQueue = async () => {
      try {
        const response = await api.listComplaints();
        setComplaints(response.complaints || []);
        setSelectedComplaint((response.complaints || [])[0] || null);
      } finally {
        setLoading(false);
      }
    };

    loadQueue();
  }, []);

  const queue = useMemo(() => {
    return [...complaints].sort((left, right) => {
      const priorityScore = { Critical: 4, High: 3, Medium: 2, Low: 1 };
      return (priorityScore[right.priority] || 0) - (priorityScore[left.priority] || 0);
    });
  }, [complaints]);

  const openQueue = queue.filter((complaint) => complaint.status !== 'Closed');
  const criticalCases = queue.filter((complaint) => complaint.priority === 'Critical').length;

  const refreshQueue = async () => {
    const response = await api.listComplaints();
    const nextQueue = response.complaints || [];
    setComplaints(nextQueue);
    if (selectedComplaint) {
      const refreshed = nextQueue.find((complaint) => complaint._id === selectedComplaint._id);
      setSelectedComplaint(refreshed || nextQueue[0] || null);
    } else {
      setSelectedComplaint(nextQueue[0] || null);
    }
  };

  const updateStatus = async () => {
    if (!selectedComplaint) {
      return;
    }

    setSaving(true);
    try {
      const response = await api.updateComplaintStatus(selectedComplaint._id, {
        status: statusDraft,
        note: `Officer updated status to ${statusDraft}.`
      });
      setSelectedComplaint(response.complaint);
      await refreshQueue();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Assigned complaints" value={queue.length} hint="All cases routed to your department" />
        <MetricCard label="Open queue" value={openQueue.length} hint="Still awaiting closure" />
        <MetricCard label="Critical alerts" value={criticalCases} hint="Needs immediate attention" />
      </div>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="glass-panel border-warning-400/20 p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-warning-200">Officer Queue</p>
              <h2 className="mt-1 text-2xl font-bold font-display text-white">Triage assigned cases</h2>
            </div>
            <button type="button" onClick={refreshQueue} className="civic-button-secondary">Refresh</button>
          </div>

          <div className="mt-6 space-y-3">
            {loading ? <div className="text-slate-300">Loading queue...</div> : null}
            {!loading && queue.length === 0 ? <div className="text-sm text-slate-300">No complaints assigned yet.</div> : null}
            {queue.map((complaint) => (
              <button
                key={complaint._id}
                type="button"
                onClick={() => {
                  setSelectedComplaint(complaint);
                  setStatusDraft(complaint.status === 'Received' ? 'In Progress' : complaint.status);
                }}
                className={`w-full rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 ${selectedComplaint?._id === complaint._id ? 'border-warning-400/40 bg-warning-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{complaint.complaintNumber}</p>
                    <h3 className="mt-1 text-lg font-semibold text-white">{complaint.title}</h3>
                    <p className="mt-1 text-sm text-slate-300">{complaint.summary || complaint.description}</p>
                  </div>
                  <StatusBadge status={complaint.status} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
                  <span>Priority: {complaint.priority}</span>
                  <span>Department: {complaint.department?.name || 'Unassigned'}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <aside className="glass-panel border-white/10 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-civic-200">Case Details</p>
          <h3 className="mt-1 text-2xl font-bold font-display text-white">
            {selectedComplaint ? selectedComplaint.title : 'Select a complaint'}
          </h3>

          {selectedComplaint ? (
            <div className="mt-6 space-y-4 text-sm text-slate-300">
              <p><span className="text-white">Ticket:</span> {selectedComplaint.complaintNumber}</p>
              <p><span className="text-white">Citizen:</span> {selectedComplaint.citizen?.name || 'Citizen'}</p>
              <p><span className="text-white">Category:</span> {selectedComplaint.category}</p>
              <p><span className="text-white">Priority:</span> {selectedComplaint.priority}</p>
              <div className="flex items-center gap-2">
                <span className="text-white">Status:</span>
                <StatusBadge status={selectedComplaint.status} />
              </div>
              <p><span className="text-white">Location:</span> {selectedComplaint.locationText || 'Not specified'}</p>
              <p><span className="text-white">Summary:</span> {selectedComplaint.summary || selectedComplaint.description}</p>

              <div className="pt-3">
                <label className="civic-label" htmlFor="officer-status">Update status</label>
                <select
                  id="officer-status"
                  className="civic-input"
                  value={statusDraft}
                  onChange={(event) => setStatusDraft(event.target.value)}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <button type="button" onClick={updateStatus} className="civic-button mt-3 w-full" disabled={saving}>
                  {saving ? 'Saving...' : 'Save case update'}
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-6 text-sm text-slate-300">Choose a complaint from the queue to review details and progress it.</p>
          )}
        </aside>
      </section>
    </div>
  );
};