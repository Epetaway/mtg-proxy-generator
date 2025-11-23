import React from 'react';
import { APP_MODE } from '../config';

export default function SettingsPage() {
  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 md:p-6">
      <h2 className="text-xl font-semibold mb-2">Settings</h2>
      <div className="mb-4 text-sm">
        <div>Current mode: <span className="font-bold">{APP_MODE}</span></div>
        <div className="mt-2 text-rose-600">Switching to PERSONAL mode uses a separate local collection and is never persisted to Git.</div>
        <div className="mt-2 text-xs text-slate-500">To change mode, edit <code>.env</code> and set <code>VITE_APP_MODE=PERSONAL</code>, then restart the dev server.</div>
      </div>
    </section>
  );
}
