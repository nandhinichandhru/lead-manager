import { Link, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import { ToastProvider } from './components/Toast.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Leads from './pages/Leads.jsx';

function NotFound() {
  return (
    <div className="card flex flex-col items-center justify-center gap-4 px-6 py-20 text-center">
      <span className="text-5xl font-bold text-slate-200">404</span>
      <div>
        <h2 className="text-lg font-semibold text-slate-800">Page not found</h2>
        <p className="mt-1 text-sm text-slate-500">
          The page you are looking for does not exist.
        </p>
      </div>
      <Link to="/" className="btn-primary">
        Back to dashboard
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </ToastProvider>
  );
}
