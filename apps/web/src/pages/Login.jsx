import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { getRoleHome } from '../utils/roles.js';

export const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.login(form);
      api.saveSession(response);
      navigate(getRoleHome(response.user.role));
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md items-center">
      <form onSubmit={handleSubmit} className="glass-panel w-full p-8">
        <p className="text-xs uppercase tracking-[0.35em] text-civic-200">Citizen Portal</p>
        <h2 className="mt-3 text-3xl font-bold font-display text-white">Sign in</h2>
        <p className="mt-2 text-sm text-slate-300">Access complaint submission, tracking, and notifications.</p>

        {error ? <div className="mt-5 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</div> : null}

        <div className="mt-6">
          <label className="civic-label" htmlFor="email">Email</label>
          <input id="email" className="civic-input" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
        </div>

        <div className="mt-4">
          <label className="civic-label" htmlFor="password">Password</label>
          <input id="password" className="civic-input" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
        </div>

        <button type="submit" className="civic-button mt-6 w-full" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>

        <p className="mt-4 text-sm text-slate-300">
          New here? <Link to="/register" className="text-civic-200 hover:text-civic-100">Create an account</Link>
        </p>
      </form>
    </div>
  );
};