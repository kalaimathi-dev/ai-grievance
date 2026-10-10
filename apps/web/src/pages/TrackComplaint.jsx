import React, { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { ComplaintCard } from '../components/ComplaintCard.jsx';

export const TrackComplaint = () => {
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadComplaints = async () => {
      try {
        const response = await api.listComplaints();
        setComplaints(response.complaints || []);
      } catch (listError) {
        setError(listError.message);
      } finally {
        setLoading(false);
      }
    };

    loadComplaints();
  }, []);

  const openComplaint = async (complaint) => {
    setSelectedComplaint(complaint);
    try {
      const response = await api.getComplaint(complaint._id);
      setTimeline(response.timeline || []);
    } catch (detailError) {
      setTimeline([]);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-civic-200">Complaint Tracking</p>
            <h2 className="mt-2 text-3xl font-bold font-display text-white">Your grievance history</h2>
          </div>
        </div>

        {loading ? <div className="mt-6 text-slate-300">Loading complaints...</div> : null}
        {error ? <div className="mt-6 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</div> : null}

        <div className="mt-6 grid gap-4">
          {complaints.map((complaint) => (
            <ComplaintCard key={complaint._id} complaint={complaint} onClick={() => openComplaint(complaint)} />
          ))}
          {!loading && complaints.length === 0 ? <div className="glass-panel p-8 text-slate-300">No complaints found yet. Submit your first grievance from the Submit page.</div> : null}
        </div>
      </section>

      <aside className="glass-panel p-8">
        <p className="text-xs uppercase tracking-[0.35em] text-civic-200">Status Timeline</p>
        <h3 className="mt-2 text-2xl font-bold font-display text-white">{selectedComplaint ? selectedComplaint.title : 'Select a complaint'}</h3>
        {selectedComplaint ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
              <p className="font-semibold text-white">Current status</p>
              <p className="mt-1">{selectedComplaint.status}</p>
              <p className="mt-3 font-semibold text-white">Department</p>
              <p className="mt-1">{selectedComplaint.department?.name || 'Unassigned'}</p>
              <p className="mt-3 font-semibold text-white">Summary</p>
              <p className="mt-1 text-slate-300">{selectedComplaint.summary || selectedComplaint.description}</p>
            </div>

            <div className="space-y-3">
              {timeline.map((entry) => (
                <div key={entry._id} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                  <p className="font-semibold text-white">{entry.fromStatus} → {entry.toStatus}</p>
                  <p className="mt-1">{entry.note || 'Status changed'}</p>
                  <p className="mt-2 text-xs text-slate-400">{new Date(entry.createdAt).toLocaleString()}</p>
                </div>
              ))}
              {timeline.length === 0 ? <div className="text-sm text-slate-400">No history yet for this complaint.</div> : null}
            </div>
          </div>
        ) : (
          <p className="mt-6 text-sm text-slate-300">Click a complaint card to inspect its timeline and current routing.</p>
        )}
      </aside>
    </div>
  );
};