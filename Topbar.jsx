import { Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const TITLES = {
  '/': { section: 'Overview', title: 'Dashboard' },
  '/leads': { section: 'Workspace', title: 'Leads' },
};

export default function Topbar({ onMenu }) {
  const { pathname } = useLocation();
  const { section, title } = TITLES[pathname] ?? { section: 'Lead Manager', title: 'Page' };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onMenu}
          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {section}
          </p>
          <h1 className="truncate text-base font-semibold text-slate-900">{title}</h1>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            MySQL
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-xs font-bold text-white">
            LM
          </div>
        </div>
      </div>
    </header>
  );
}
