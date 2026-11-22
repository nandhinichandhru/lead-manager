import { ArrowDown, ArrowUp, ArrowUpDown, Pencil, Trash2 } from 'lucide-react';
import { avatarColor, formatDate, initials } from '../utils/format.js';
import Badge from './Badge.jsx';

function SortHeader({ label, column, sort, order, onSort, className = '' }) {
  const active = sort === column;
  const Icon = !active ? ArrowUpDown : order === 'asc' ? ArrowUp : ArrowDown;

  return (
    <th scope="col" className={`px-4 py-3 text-left ${className}`}>
      <button
        type="button"
        onClick={() => onSort(column)}
        className={`group inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider transition ${
          active ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        {label}
        <Icon className="h-3.5 w-3.5 opacity-70 group-hover:opacity-100" />
      </button>
    </th>
  );
}

function SkeletonRows({ rows = 5 }) {
  return Array.from({ length: rows }).map((_, index) => (
    <tr key={index} className="border-t border-slate-100">
      {Array.from({ length: 6 }).map((__, cell) => (
        <td key={cell} className="px-4 py-4">
          <div className="h-3 animate-pulse rounded-full bg-slate-100" />
        </td>
      ))}
    </tr>
  ));
}

export default function LeadTable({
  leads = [],
  loading = false,
  sort,
  order,
  onSort,
  onEdit,
  onDelete,
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] border-collapse text-sm">
        <thead className="bg-slate-50/70">
          <tr>
            <th
              scope="col"
              className="w-14 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400"
            >
              ID
            </th>
            <SortHeader label="Name" column="name" sort={sort} order={order} onSort={onSort} />
            <th
              scope="col"
              className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400"
            >
              Phone
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400"
            >
              Company
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400"
            >
              Source
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400"
            >
              Status
            </th>
            <SortHeader
              label="Created"
              column="createdAt"
              sort={sort}
              order={order}
              onSort={onSort}
            />
            <th
              scope="col"
              className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400"
            >
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <SkeletonRows />
          ) : (
            leads.map((lead) => (
              <tr
                key={lead.id}
                className="group border-t border-slate-100 transition-colors hover:bg-slate-50/70"
              >
                <td className="px-4 py-3.5 text-xs font-medium tabular-nums text-slate-400">
                  #{String(lead.id).padStart(3, '0')}
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${avatarColor(
                        lead.name,
                      )}`}
                    >
                      {initials(lead.name)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-800">{lead.name}</p>
                      <p className="truncate text-xs text-slate-500">{lead.email}</p>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">{lead.phone}</td>
                <td className="px-4 py-3.5 text-slate-600">{lead.company}</td>
                <td className="whitespace-nowrap px-4 py-3.5">
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                    {lead.source}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3.5">
                  <Badge status={lead.status} />
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-xs text-slate-500">
                  {formatDate(lead.created_at)}
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(lead)}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600"
                      aria-label={`Edit ${lead.name}`}
                      title="Edit lead"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(lead)}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                      aria-label={`Delete ${lead.name}`}
                      title="Delete lead"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
