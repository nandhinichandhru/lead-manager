const ACCENTS = {
  indigo: {
    icon: 'bg-indigo-50 text-indigo-600',
    value: 'text-slate-900',
  },
  blue: { icon: 'bg-blue-50 text-blue-600', value: 'text-slate-900' },
  amber: { icon: 'bg-amber-50 text-amber-600', value: 'text-slate-900' },
  emerald: { icon: 'bg-emerald-50 text-emerald-600', value: 'text-slate-900' },
  red: { icon: 'bg-red-50 text-red-600', value: 'text-slate-900' },
};

export default function StatCard({ label, value, icon: Icon, accent = 'indigo', hint }) {
  const styles = ACCENTS[accent] ?? ACCENTS.indigo;

  return (
    <div className="card group p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
          <p className={`mt-2 text-2xl font-bold tabular-nums ${styles.value}`}>
            {value ?? '—'}
          </p>
        </div>
        {Icon ? (
          <span
            className={`flex h-10 w-10 items-center justify-center rounded-xl transition group-hover:scale-105 ${styles.icon}`}
          >
            <Icon className="h-5 w-5" />
          </span>
        ) : null}
      </div>
      {hint ? <p className="mt-3 text-xs text-slate-400">{hint}</p> : null}
    </div>
  );
}
