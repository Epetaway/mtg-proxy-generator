import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="max-w-xl mx-auto p-6 text-center">
      <h1 className="text-2xl font-bold mb-2">404 Not Found</h1>
      <p className="text-sm text-slate-600 mb-4">We couldn't find that page.</p>
      <Link to="/" className="inline-block rounded bg-indigo-600 text-white px-4 py-2">Go Home</Link>
    </div>
  );
}
