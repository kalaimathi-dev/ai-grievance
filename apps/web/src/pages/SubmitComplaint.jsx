import React, { useEffect, useState } from 'react';
import { api } from '../api/client.js';

const initialForm = {
  title: '',
  description: '',
  locationText: '',
  category: '',
  evidenceLink: ''
};

export const SubmitComplaint = () => {
  const [form, setForm] = useState(initialForm);
  const [triage, setTriage] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [triageLoading, setTriageLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (!selectedImage) {
      setImagePreview('');
      return undefined;
    }

    const objectUrl = URL.createObjectURL(selectedImage);
    setImagePreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedImage]);

  const runTriage = async () => {
    if (!form.description.trim()) {
      return;
    }

    setTriageLoading(true);
    try {
      const response = await api.triage(form.description);
      setTriage(response.triage);
    } catch (error) {
      setTriage({ category: 'Other', department: 'General Administration', priority: 'Medium', summary: 'Fallback triage suggested because AI classification was unavailable.' });
    } finally {
      setTriageLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const attachments = form.evidenceLink ? [{ url: form.evidenceLink, originalName: 'Evidence link', mimeType: 'text/uri-list' }] : [];
      const complaint = await api.createComplaint({
        title: form.title,
        description: form.description,
        locationText: form.locationText,
        category: form.category,
        attachments
      }, selectedImage);
      setMessage(`Complaint submitted successfully. Ticket: ${complaint.complaint?.complaintNumber || complaint.complaintNumber}`);
      setForm(initialForm);
      setSelectedImage(null);
      setTriage(complaint.complaint?.aiTriage || complaint.aiTriage || triage);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
      <form onSubmit={handleSubmit} className="glass-panel p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-civic-200">Citizen Portal</p>
            <h2 className="mt-2 text-3xl font-bold font-display text-white">Submit complaint</h2>
            <p className="mt-2 text-sm text-slate-300">Describe the issue in plain language. The triage engine will suggest a category, priority, and department.</p>
          </div>
          <button type="button" onClick={runTriage} className="civic-button-secondary" disabled={triageLoading}>
            {triageLoading ? 'Analyzing...' : 'Auto-suggest'}
          </button>
        </div>

        <div className="mt-6 grid gap-4">
          <div>
            <label className="civic-label" htmlFor="title">Complaint title</label>
            <input id="title" className="civic-input" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Street light not working" required />
          </div>

          <div>
            <label className="civic-label" htmlFor="description">Description</label>
            <textarea id="description" rows="6" className="civic-input" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} onBlur={runTriage} placeholder="Describe the grievance, nearby landmarks, and when it started..." required />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="civic-label" htmlFor="location">Location</label>
              <input id="location" className="civic-input" value={form.locationText} onChange={(event) => setForm({ ...form, locationText: event.target.value })} placeholder="Ward 12, Market Road" />
            </div>
            <div>
              <label className="civic-label" htmlFor="category">Preferred category</label>
              <input id="category" className="civic-input" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="Optional manual category" />
            </div>
          </div>

          <div>
            <label className="civic-label" htmlFor="evidenceLink">Evidence link</label>
            <input id="evidenceLink" className="civic-input" value={form.evidenceLink} onChange={(event) => setForm({ ...form, evidenceLink: event.target.value })} placeholder="Optional image or file URL for the demo" />
          </div>

          <div>
            <label className="civic-label" htmlFor="complaint-image">Upload photo</label>
            <input
              id="complaint-image"
              className="civic-input mt-2 block w-full cursor-pointer rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 file:mr-4 file:rounded-full file:border-0 file:bg-civic-500/20 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-civic-100"
              type="file"
              accept="image/*"
              onChange={(event) => setSelectedImage(event.target.files?.[0] || null)}
            />
            {imagePreview ? <img src={imagePreview} alt="Complaint preview" className="mt-3 h-40 w-full rounded-2xl object-cover" /> : null}
          </div>
        </div>

        {message ? <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100">{message}</div> : null}

        <button type="submit" className="civic-button mt-6 w-full" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit complaint'}
        </button>
      </form>

      <aside className="glass-panel p-8">
        <p className="text-xs uppercase tracking-[0.35em] text-civic-200">AI Triage Preview</p>
        <h3 className="mt-2 text-2xl font-bold font-display text-white">What the backend will infer</h3>
        <div className="mt-6 space-y-4 text-sm text-slate-300">
          <p><span className="text-slate-100">Category:</span> {triage?.category || 'Waiting for a description'}</p>
          <p><span className="text-slate-100">Department:</span> {triage?.department || 'Unassigned'}</p>
          <p><span className="text-slate-100">Priority:</span> {triage?.priority || 'Medium'}</p>
          <p><span className="text-slate-100">Summary:</span> {triage?.summary || 'The model summary will appear here.'}</p>
        </div>
      </aside>
    </div>
  );
};