const SEGMENTS = [
  { key: 'New', color: '#3b82f6' },
  { key: 'Contacted', color: '#f59e0b' },
  { key: 'Qualified', color: '#10b981' },
  { key: 'Lost', color: '#ef4444' },
];

const RADIUS = 58;
const STROKE = 18;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function StatusDonut({ byStatus = {} }) {
  const total = SEGMENTS.reduce((sum, segment) => sum + (byStatus[segment.key] || 0), 0);

  let consumed = 0;
  const arcs = SEGMENTS.map((segment) => {
    const count = byStatus[segment.key] || 0;
    const fraction = total > 0 ? count / total : 0;
    const length = fraction * CIRCUMFERENCE;
    const arc = {
      ...segment,
      count,
      length,
      offset: consumed,
    };
    consumed += length;
    return arc;
  });

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
      <div className="relative shrink-0">
        <svg viewBox="0 0 160 160" className="h-40 w-40 -rotate-90" role="img" aria-label="Leads by status">
          <circle
            cx="80"
            cy="80"
            r={RADIUS}
            fill="none"
            stroke="#eef2f7"
            strokeWidth={STROKE}
          />
          {arcs.map((arc) =>
            arc.length > 0 ? (
              <circle
                key={arc.key}
                cx="80"
                cy="80"
                r={RADIUS}
                fill="none"
                stroke={arc.color}
                strokeWidth={STROKE}
                strokeLinecap="butt"
                strokeDasharray={`${Math.max(arc.length - 2, 0)} ${CIRCUMFERENCE}`}
                strokeDashoffset={-arc.offset}
                className="transition-all duration-500"
              >
                <title>{`${arc.key}: ${arc.count}`}</title>
              </circle>
            ) : null,
          )}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold tabular-nums text-slate-900">{total}</span>
          <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
            Leads
          </span>
        </div>
      </div>

      <ul className="w-full space-y-2.5 sm:max-w-[15rem]">
        {SEGMENTS.map((segment) => {
          const count = byStatus[segment.key] || 0;
          const percent = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <li key={segment.key} className="flex items-center gap-3 text-sm">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span className="flex-1 text-slate-600">{segment.key}</span>
              <span className="font-semibold tabular-nums text-slate-900">{count}</span>
              <span className="w-9 text-right text-xs tabular-nums text-slate-400">
                {percent}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
