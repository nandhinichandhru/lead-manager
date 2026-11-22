import { useEffect, useState } from 'react';
import { Plus, Search, SlidersHorizontal, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client.js';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import EmptyState from '../components/EmptyState.jsx';
import LeadFormModal, { LEAD_SOURCES, LEAD_STATUSES } from '../components/LeadFormModal.jsx';
import LeadTable from '../components/LeadTable.jsx';
import Pagination from '../components/Pagination.jsx';
import { useToast } from '../components/Toast.jsx';

const PAGE_SIZE = 8;

const EMPTY_PAGINATION = { page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 };

export default function Leads() {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [source, setSource] = useState('All');
  const [sort, setSort] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(1);

  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState(EMPTY_PAGINATION);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Debounce the search box so we don't hit the API on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // `/leads?new=1` (from the dashboard button) opens the create form.
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setEditingLead(null);
      setFormOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');

    api
      .listLeads(
        { search, status, source, sort, order, page, limit: PAGE_SIZE },
        { signal: controller.signal },
      )
      .then((payload) => {
        setLeads(payload.data ?? []);
        setPagination(payload.pagination ?? EMPTY_PAGINATION);
        if (payload.pagination && payload.pagination.page !== page) {
          setPage(payload.pagination.page);
        }
      })
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') {
          setError(requestError.message || 'Could not load leads');
          setLeads([]);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [search, status, source, sort, order, page, refreshKey]);

  const hasFilters = Boolean(search) || status !== 'All' || source !== 'All';

  function resetFilters() {
    setSearchInput('');
    setSearch('');
    setStatus('All');
    setSource('All');
    setSort('createdAt');
    setOrder('desc');
    setPage(1);
  }

  function handleSort(column) {
    if (sort === column) {
      setOrder((current) => (current === 'asc' ? 'desc' : 'asc'));
    } else {
      setSort(column);
      setOrder(column === 'name' ? 'asc' : 'desc');
    }
    setPage(1);
  }

  function openCreate() {
    setEditingLead(null);
    setFormOpen(true);
  }

  function openEdit(lead) {
    setEditingLead(lead);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingLead(null);
  }

  function handleSaved() {
    setRefreshKey((key) => key + 1);
  }

  function requestDelete(lead) {
    setPendingDelete(lead);
    setDeleteError('');
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    setDeleteError('');

    try {
      await api.deleteLead(pendingDelete.id);
      toast.success('Lead deleted successfully');
      setPendingDelete(null);
      if (leads.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        handleSaved();
      }
    } catch (deleteFailure) {
      setDeleteError(deleteFailure.message || 'Could not delete the lead');
      toast.error(deleteFailure.message || 'Could not delete the lead');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">All leads</h2>
          <p className="mt-1 text-sm text-slate-500">
            {loading
              ? 'Loading leads…'
              : `${pagination.total} lead${pagination.total === 1 ? '' : 's'} in your database`}
          </p>
        </div>
        <button type="button" onClick={openCreate} className="btn-primary self-start sm:self-auto">
          <Plus className="h-4 w-4" />
          Add Lead
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by name, email or company…"
              aria-label="Search leads"
              className="field pl-9"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value);
                  setPage(1);
                }}
                aria-label="Filter by status"
                className="field appearance-none pl-9 pr-8 sm:w-40"
              >
                <option value="All">All statuses</option>
                {LEAD_STATUSES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={source}
              onChange={(event) => {
                setSource(event.target.value);
                setPage(1);
              }}
              aria-label="Filter by source"
              className="field sm:w-40"
            >
              <option value="All">All sources</option>
              {LEAD_SOURCES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            {hasFilters || searchInput ? (
              <button
                type="button"
                onClick={resetFilters}
                className="btn-ghost whitespace-nowrap"
                title="Clear all filters"
              >
                <X className="h-4 w-4" />
                Clear
              </button>
            ) : null}
          </div>
        </div>

        {error ? (
          <div className="flex flex-col items-start gap-3 bg-red-50/60 px-5 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-red-700">Could not load leads</p>
              <p className="mt-0.5 text-xs text-red-600">{error}</p>
            </div>
            <button
              type="button"
              onClick={handleSaved}
              className="btn-ghost border-red-200 text-red-700 hover:bg-red-50"
            >
              Try again
            </button>
          </div>
        ) : leads.length === 0 && !loading ? (
          <EmptyState
            title={hasFilters ? 'No leads match your filters' : 'No leads yet'}
            description={
              hasFilters
                ? 'Try a different search term or clear the filters to see all leads.'
                : 'Add your first lead and start tracking your sales pipeline.'
            }
            action={
              hasFilters ? (
                <button type="button" onClick={resetFilters} className="btn-ghost">
                  Clear filters
                </button>
              ) : (
                <button type="button" onClick={openCreate} className="btn-primary">
                  <Plus className="h-4 w-4" />
                  Add Lead
                </button>
              )
            }
          />
        ) : (
          <>
            <LeadTable
              leads={leads}
              loading={loading}
              sort={sort}
              order={order}
              onSort={handleSort}
              onEdit={openEdit}
              onDelete={requestDelete}
            />
            <Pagination
              page={pagination.page}
              limit={pagination.limit}
              total={pagination.total}
              totalPages={pagination.totalPages}
              onChange={setPage}
            />
          </>
        )}
      </div>

      <LeadFormModal open={formOpen} lead={editingLead} onClose={closeForm} onSaved={handleSaved} />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete lead"
        message="Are you sure you want to delete this lead?"
        confirmLabel="Confirm Delete"
        cancelLabel="Cancel"
        busy={deleting}
        error={deleteError}
        onConfirm={confirmDelete}
        onCancel={() => {
          if (!deleting) {
            setPendingDelete(null);
            setDeleteError('');
          }
        }}
      />
    </div>
  );
}
