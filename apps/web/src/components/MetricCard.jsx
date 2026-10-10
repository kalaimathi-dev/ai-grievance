import React from 'react';

export const MetricCard = ({ label, value, hint }) => (
  <div className="glass-panel p-5">
    <p className="text-sm text-slate-300">{label}</p>
    <div className="mt-2 text-3xl font-bold font-display text-white">{value}</div>
    <p className="mt-2 text-xs text-slate-400">{hint}</p>
  </div>
);