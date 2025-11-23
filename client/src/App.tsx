import { Routes, Route, Link } from 'react-router-dom';
import ProxyPage from './pages/ProxyPage';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold tracking-tight">TCG Portfolio</h1>
          <nav className="flex gap-4 text-sm">
            <Link to="/">Dashboard</Link>
            <Link to="/add">Add</Link>
            <Link to="/proxy">Proxy</Link>
            <Link to="/settings">Settings</Link>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto p-4">
        <Routes>
          <Route path="/" element={<div>Dashboard (coming soon)</div>} />
          <Route path="/add" element={<div>Add Cards (coming soon)</div>} />
          <Route path="/proxy" element={<ProxyPage />} />
          <Route path="/settings" element={<div>Settings (coming soon)</div>} />
        </Routes>
      </main>
      <footer className="max-w-6xl mx-auto px-4 py-8 text-center text-xs text-slate-500">
        © 2025 TCG Portfolio • For personal use only. Not for sale.
      </footer>
    </div>
  );
}

export default App;
