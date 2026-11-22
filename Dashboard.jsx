import { useEffect, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  CircleSlash,
  PhoneCall,
  Plus,
  RefreshCw,
  Sparkles,
  UsersRound,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import Badge from '../components/Badge.jsx';
import StatCard from '../components/StatCard.jsx';
import StatusDonut from '../components/StatusDonut.jsx';
import { avatarColor, formatDate, initials } from '../utils/format.js';

const PAGE_SIZE = 5;

function CardsSkeleton() {
  return Array.from({ length: 5 }).map((_, index) => (
    <div key={index} className="card p-5">
      <div className="h-3 w-20 animate-pulse rounded-full bg-slate-100" />
      <div className="mt-3 h-7 w-12 animate-pulse rounded-lg bg-slate-100" />
    </div>
  ));
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');

    api
      .getStats({ signal: controller.signal })
      .then((payload) => setStats(payload.data))
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') {
          setError(requestError.message || 'Could not load dashboard data');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [reloadKey]);

  const byStatus = stats?.byStatus ?? {};
  const recent = stats?.recent ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Sales overview</h2>
          <p className="mt-1 text-sm text-slate-500">
            Track your pipeline and keep every lead moving forward.
          </p>
        </div>
        <Link to="/leads?new=1" className="btn-primary self-start sm:self-auto">
          <Plus className="h-4 w-4" />
          Add Lead
        </Link>
      </div>

      {error ? (
        <div className="card flex flex-col items-start gap-3 border-red-100 bg-red-50/60 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-red-700">{error}</p>
          <button type="button" onClick={() => setReloadKey((key) => key + 1)} className="btn-ghost">
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {loading && !stats ? (
          <CardsSkeleton />
        ) : (
          <>
            <StatCard
              label="Total Leads"
              value={stats?.total ?? 0}
              icon={UsersRound}
              accent="indigo"
              hint="All leads in the database"
            />
            <StatCard label="New" value={byStatus.New ?? 0} icon={Sparkles} accent="blue" hint="Awaiting first contact" />
            <StatCard
              label="Contacted"
              value={byStatus.Contacted ?? 0}
              icon={PhoneCall}
              accent="amber"
              hint="Conversation started"
            />
            <StatCard
              label="Qualified"
              value={byStatus.Qualified ?? 0}
              icon={CheckCircle2}
              accent="emerald"
              hint="Ready for the sales team"
            />
            <StatCard
              label="Lost"
              value={byStatus.Lost ?? 0}
              icon={CircleSlash}
              accent="red"
              hint="Closed without a deal"
            />
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <section className="card p-5 lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Status distribution</h3>
              <p className="mt-0.5 text-xs text-slate-500">Leads grouped by current stage</p>
            </div>
          </div>

          {loading && !stats ? (
            <div className="flex items-center gap-6">
              <div className="h-40 w-40 animate-pulse rounded-full bg-slate-100" />
              <div className="flex-1 space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-3 animate-pulse rounded-full bg-slate-100" />
                ))}
              </div>
            </div>
          ) : (
            <StatusDonut byStatus={byStatus} />
          )}
        </section>

        <section className="card overflow-hidden lg:col-span-3">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Recent leads</h3>
              <p className="mt-0.5 text-xs text-slate-500">Latest additions to your pipeline</p>
            </div>
            <Link
              to="/leads"
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 transition hover:text-indigo-700"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {loading && !stats ? (
            <div className="space-y-3 p-5">
              {Array.from({ length: PAGE_SIZE }).map((_, index) => (
                <div key={index} className="h-10 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="text-sm font-medium text-slate-700">No leads yet</p>
              <p className="mt-1 text-xs text-slate-500">
                Add your first lead to see it appear here.
              </p>
              <Link to="/leads?new=1" className="btn-primary mt-4">
                <Plus className="h-4 w-4" />
                Add Lead
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recent.map((lead) => (
                <li
                  key={lead.id}
                  className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-slate-50/70"
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${avatarColor(
                      lead.name,
                    )}`}
                  >
                    {initials(lead.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">{lead.name}</p>
                    <p className="truncate text-xs text-slate-500">
                      {lead.company} · {lead.source}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <Badge status={lead.status} />
                    <span className="text-[11px] text-slate-400">{formatDate(lead.created_at)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
