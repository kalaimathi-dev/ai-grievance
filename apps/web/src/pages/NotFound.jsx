import React from 'react';
import { Link } from 'react-router-dom';

export const NotFound = () => (
  <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center text-center">
    <div className="glass-panel p-10">
      <p className="text-xs uppercase tracking-[0.35em] text-civic-200">404</p>
      <h2 className="mt-3 text-4xl font-bold font-display text-white">Page not found</h2>
      <p className="mt-3 text-slate-300">The requested route does not exist in this scaffold.</p>
      <Link to="/submit" className="civic-button mt-6">Go to dashboard</Link>
    </div>
  </div>
);