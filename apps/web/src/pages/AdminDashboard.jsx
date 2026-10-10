import React, { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../api/client.js';
import { MetricCard } from '../components/MetricCard.jsx';
import { ComplaintCard } from '../components/ComplaintCard.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';

const STATUS_OPTIONS = ['Received', 'In Progress', 'Resolved', 'Closed'];

const pieColors = ['#1ca18d', '#4e79b8', '#f7bc14', '#d65a31', '#8b5cf6'];

export const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusDraft, setStatusDraft] = useState('In Progress');
  const [savingStatus, setSavingStatus] = useState(false);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [complaintResponse, analyticsResponse] = await Promise.all([
          api.listComplaints(),
          api.analytics()
        ]);
        setComplaints(complaintResponse.complaints || []);
        setAnalytics(analyticsResponse.analytics || null);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const statusData = useMemo(() => {
    const grouped = complaints.reduce((accumulator, complaint) => {
      accumulator[complaint.status] = (accumulator[complaint.status] || 0) + 1;
      return accumulator;
    }, {});

    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [complaints]);

  const priorityData = useMemo(() => {
    const grouped = complaints.reduce((accumulator, complaint) => {
      accumulator[complaint.priority] = (accumulator[complaint.priority] || 0) + 1;
      return accumulator;
    }, {});

    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [complaints]);

  const refreshDashboard = async () => {
    const [complaintResponse, analyticsResponse] = await Promise.all([
      api.listComplaints(),
      api.analytics()
    ]);
    setComplaints(complaintResponse.complaints || []);
    setAnalytics(analyticsResponse.analytics || null);
  };

  const saveStatus = async () => {
    if (!selectedComplaint) {
      return;
    }

    setSavingStatus(true);
    try {
      const response = await api.updateComplaintStatus(selectedComplaint._id, {
        status: statusDraft,
        note: `Updated from admin dashboard to ${statusDraft}.`
      });
      const updatedComplaint = response.complaint;
      setSelectedComplaint(updatedComplaint);
      await refreshDashboard();
    } finally {
      setSavingStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-civic-200">Admin Dashboard</p>
        <h2 className="mt-2 text-3xl font-bold font-display text-white">Operational overview</h2>
      </div>

      {loading ? <div className="text-slate-300">Loading dashboard...</div> : null}

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Total complaints" value={analytics?.totalComplaints ?? complaints.length} hint="Live from the grievance store" />
        <MetricCard label="Open backlog" value={complaints.filter((complaint) => complaint.status !== 'Closed').length} hint="Cases still active in the queue" />
        <MetricCard label="Resolved or closed" value={complaints.filter((complaint) => ['Resolved', 'Closed'].includes(complaint.status)).length} hint="Tracked for SLA visibility" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="glass-panel p-6">
          <h3 className="text-xl font-semibold text-white">Complaints by status</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData.length ? statusData : [{ name: 'No data', value: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="name" stroke="#cbd5e1" />
                <YAxis stroke="#cbd5e1" />
                <Tooltip contentStyle={{ background: '#0d1627', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16 }} />
                <Bar dataKey="value" fill="#1ca18d" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6">
          <h3 className="text-xl font-semibold text-white">Priority mix</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={priorityData.length ? priorityData : [{ name: 'No data', value: 1 }]} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {(priorityData.length ? priorityData : [{ name: 'No data', value: 1 }]).map((entry, index) => (
                    <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#0d1627', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16 }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div>
          <h3 className="mb-4 text-xl font-semibold text-white">Recent complaints</h3>
          <div className="grid gap-4">
            {complaints.slice(0, 6).map((complaint) => (
              <ComplaintCard key={complaint._id} complaint={complaint} onClick={() => setSelectedComplaint(complaint)} />
            ))}
          </div>
        </div>

        <aside className="glass-panel p-6">
          <h3 className="text-xl font-semibold text-white">Selected case</h3>
          {selectedComplaint ? (
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <p><span className="text-white">Ticket:</span> {selectedComplaint.complaintNumber}</p>
              <p><span className="text-white">Title:</span> {selectedComplaint.title}</p>
              <p><span className="text-white">Category:</span> {selectedComplaint.category}</p>
              <p><span className="text-white">Department:</span> {selectedComplaint.department?.name || 'Unassigned'}</p>
              <p><span className="text-white">Priority:</span> {selectedComplaint.priority}</p>
              <div className="flex items-center gap-2">
                <span className="text-white">Status:</span>
                <StatusBadge status={selectedComplaint.status} />
              </div>
              <p><span className="text-white">Summary:</span> {selectedComplaint.summary || selectedComplaint.description}</p>
              {selectedComplaint.imageAttachment ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="text-white">Image verification</p>
                  <p className="mt-1 text-sm text-slate-300">
                    {selectedComplaint.imageVerified ? 'AI Verified' : 'Needs Review'}
                    {selectedComplaint.imageVerification?.confidence ? ` · Confidence ${Math.round(selectedComplaint.imageVerification.confidence * 100)}%` : ''}
                  </p>
                  {selectedComplaint.imageVerification?.reason ? <p className="mt-1 text-xs text-slate-400">{selectedComplaint.imageVerification.reason}</p> : null}
                </div>
              ) : null}

              <div className="pt-3">
                <label className="civic-label" htmlFor="status-update">Update status</label>
                <select
                  id="status-update"
                  className="civic-input"
                  value={statusDraft}
                  onChange={(event) => setStatusDraft(event.target.value)}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <button type="button" onClick={saveStatus} className="civic-button mt-3 w-full" disabled={savingStatus}>
                  {savingStatus ? 'Saving...' : 'Save status change'}
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-300">Select a complaint from the list to inspect routing details.</p>
          )}
        </aside>
      </section>
    </div>
  );
};