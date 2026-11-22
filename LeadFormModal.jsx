import { useEffect, useRef, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { api } from '../api/client.js';
import { useToast } from './Toast.jsx';

export const LEAD_SOURCES = ['Website', 'LinkedIn', 'Referral', 'Advertisement', 'Other'];
export const LEAD_STATUSES = ['New', 'Contacted', 'Qualified', 'Lost'];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
const PHONE_PATTERN = /^[+]?[0-9][0-9\s\-().]{5,19}$/;

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  company: '',
  source: 'Website',
  status: 'New',
};

function validate(form) {
  const errors = {};

  if (!form.name.trim()) errors.name = 'Name is required';
  else if (form.name.trim().length > 100) errors.name = 'Name must be 100 characters or fewer';

  if (!form.email.trim()) errors.email = 'Email is required';
  else if (!EMAIL_PATTERN.test(form.email.trim())) errors.email = 'Enter a valid email address';
  else if (form.email.trim().length > 150) errors.email = 'Email must be 150 characters or fewer';

  if (!form.phone.trim()) errors.phone = 'Phone is required';
  else if (!PHONE_PATTERN.test(form.phone.trim())) errors.phone = 'Enter a valid phone number';
  else if (form.phone.trim().length > 20) errors.phone = 'Phone must be 20 characters or fewer';

  if (!form.company.trim()) errors.company = 'Company is required';
  else if (form.company.trim().length > 100)
    errors.company = 'Company must be 100 characters or fewer';

  if (!LEAD_SOURCES.includes(form.source)) errors.source = 'Choose a valid source';
  if (!LEAD_STATUSES.includes(form.status)) errors.status = 'Choose a valid status';

  return errors;
}

function Field({ label, name, error, required = true, children }) {
  return (
    <label className="block" htmlFor={`lead-${name}`}>
      <span className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-slate-600">
        {label}
        {required ? <span className="text-red-500">*</span> : null}
      </span>
      {children}
      {error ? <span className="mt-1 block text-xs font-medium text-red-600">{error}</span> : null}
    </label>
  );
}

export default function LeadFormModal({ open, lead = null, onClose, onSaved }) {
  const isEdit = Boolean(lead?.id);
  const toast = useToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const firstFieldRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setForm(
      lead
        ? {
            name: lead.name ?? '',
            email: lead.email ?? '',
            phone: lead.phone ?? '',
            company: lead.company ?? '',
            source: lead.source ?? 'Website',
            status: lead.status ?? 'New',
          }
        : EMPTY_FORM,
    );
    setErrors({});
    setFormError('');
    setSubmitting(false);
    const timer = setTimeout(() => firstFieldRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, [open, lead]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !submitting) onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [open, submitting, onClose]);

  if (!open) return null;

  const update = (field) => (event) => {
    const { value } = event.target;
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
    setFormError('');
  };

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      if (isEdit) {
        await api.updateLead(lead.id, form);
        toast.success('Lead updated successfully');
      } else {
        await api.createLead(form);
        toast.success('Lead added successfully');
      }
      onSaved?.();
      onClose();
    } catch (error) {
      if (error.errors) setErrors(error.errors);
      setFormError(error.message || 'Could not save the lead. Please try again.');
      toast.error(error.message || 'Could not save the lead');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-form-title"
        className="animate-pop-in max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 id="lead-form-title" className="text-base font-semibold text-slate-900">
              {isEdit ? 'Edit Lead' : 'Add New Lead'}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {isEdit
                ? 'Update the details below and save your changes.'
                : 'Fill in the details to create a new lead.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
            aria-label="Close form"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4 px-5 py-5">
          {formError ? (
            <div className="rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700">
              {formError}
            </div>
          ) : null}

          <Field label="Full name" name="name" error={errors.name}>
            <input
              ref={firstFieldRef}
              id="lead-name"
              name="name"
              type="text"
              value={form.name}
              onChange={update('name')}
              placeholder="e.g. Aarav Sharma"
              maxLength={100}
              className={`field ${errors.name ? 'field-error' : ''}`}
              autoComplete="name"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Email address" name="email" error={errors.email}>
              <input
                id="lead-email"
                name="email"
                type="email"
                value={form.email}
                onChange={update('email')}
                placeholder="name@company.com"
                maxLength={150}
                className={`field ${errors.email ? 'field-error' : ''}`}
                autoComplete="email"
              />
            </Field>

            <Field label="Phone number" name="phone" error={errors.phone}>
              <input
                id="lead-phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={update('phone')}
                placeholder="+91 98450 11223"
                maxLength={20}
                className={`field ${errors.phone ? 'field-error' : ''}`}
                autoComplete="tel"
              />
            </Field>
          </div>

          <Field label="Company" name="company" error={errors.company}>
            <input
              id="lead-company"
              name="company"
              type="text"
              value={form.company}
              onChange={update('company')}
              placeholder="e.g. Nimbus Tech"
              maxLength={100}
              className={`field ${errors.company ? 'field-error' : ''}`}
              autoComplete="organization"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Source" name="source" error={errors.source}>
              <select
                id="lead-source"
                name="source"
                value={form.source}
                onChange={update('source')}
                className={`field ${errors.source ? 'field-error' : ''}`}
              >
                {LEAD_SOURCES.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Status" name="status" error={errors.status}>
              <select
                id="lead-status"
                name="status"
                value={form.status}
                onChange={update('status')}
                className={`field ${errors.status ? 'field-error' : ''}`}
              >
                {LEAD_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} disabled={submitting} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : isEdit ? (
                'Save Changes'
              ) : (
                'Save Lead'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
