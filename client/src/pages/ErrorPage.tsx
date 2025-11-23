import React from 'react';
import { isRouteErrorResponse, useRouteError, Link } from 'react-router-dom';

export default function ErrorPage() {
  const error = useRouteError();
  let title = 'Something went wrong';
  let details = 'An unexpected error occurred.';

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`;
    details = error.data || 'The requested page could not be found.';
  } else if (error instanceof Error) {
    details = error.message;
  }

  return (
    <div className="max-w-xl mx-auto p-6 text-center">
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <p className="text-sm text-slate-600 mb-4">{details}</p>
      <Link to="/" className="inline-block rounded bg-indigo-600 text-white px-4 py-2">Go Home</Link>
    </div>
  );
}
