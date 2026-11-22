const STATUS_STYLES = {
  New: 'bg-blue-50 text-blue-700 ring-blue-600/15',
  Contacted: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  Qualified: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  Lost: 'bg-red-50 text-red-700 ring-red-600/15',
};

const DOT_STYLES = {
  New: 'bg-blue-500',
  Contacted: 'bg-amber-500',
  Qualified: 'bg-emerald-500',
  Lost: 'bg-red-500',
};

export default function Badge({ status }) {
  const style = STATUS_STYLES[status] ?? 'bg-slate-100 text-slate-600 ring-slate-500/15';
  const dot = DOT_STYLES[status] ?? 'bg-slate-400';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${style}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  );
}
