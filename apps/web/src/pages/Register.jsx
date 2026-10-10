import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';

export const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.register(form);
      api.saveSession(response);
      navigate('/submit');
    } catch (registerError) {
      setError(registerError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md items-center">
      <form onSubmit={handleSubmit} className="glass-panel w-full p-8">
        <p className="text-xs uppercase tracking-[0.35em] text-civic-200">Citizen Enrollment</p>
        <h2 className="mt-3 text-3xl font-bold font-display text-white">Create account</h2>
        <p className="mt-2 text-sm text-slate-300">Register to submit grievances and receive live status updates.</p>

        {error ? <div className="mt-5 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</div> : null}

        <div className="mt-6">
          <label className="civic-label" htmlFor="name">Full name</label>
          <input id="name" className="civic-input" type="text" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
        </div>

        <div className="mt-4">
          <label className="civic-label" htmlFor="register-email">Email</label>
          <input id="register-email" className="civic-input" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
        </div>

        <div className="mt-4">
          <label className="civic-label" htmlFor="phone">Phone</label>
          <input id="phone" className="civic-input" type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
        </div>

        <div className="mt-4">
          <label className="civic-label" htmlFor="register-password">Password</label>
          <input id="register-password" className="civic-input" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
        </div>

        <button type="submit" className="civic-button mt-6 w-full" disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
        </button>

        <p className="mt-4 text-sm text-slate-300">
          Already have an account? <Link to="/login" className="text-civic-200 hover:text-civic-100">Sign in</Link>
        </p>
      </form>
    </div>
  );
};