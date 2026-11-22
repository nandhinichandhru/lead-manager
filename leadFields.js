export const LEAD_STATUSES = ['New', 'Contacted', 'Qualified', 'Lost'];
export const LEAD_SOURCES = ['Website', 'LinkedIn', 'Referral', 'Advertisement', 'Other'];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
const PHONE_PATTERN = /^[+]?[0-9][0-9\s\-().]{5,19}$/;

/**
 * Validates and normalises a lead payload.
 * Returns { values, errors } where errors is a { field: message } map.
 */
export function validateLead(payload = {}) {
  const errors = {};
  const raw = {
    name: typeof payload.name === 'string' ? payload.name.trim() : '',
    email: typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '',
    phone: typeof payload.phone === 'string' ? payload.phone.trim() : '',
    company: typeof payload.company === 'string' ? payload.company.trim() : '',
    source: typeof payload.source === 'string' ? payload.source.trim() : '',
    status: typeof payload.status === 'string' ? payload.status.trim() : '',
  };

  if (!raw.name) errors.name = 'Name is required';
  else if (raw.name.length > 100) errors.name = 'Name must be 100 characters or fewer';

  if (!raw.email) errors.email = 'Email is required';
  else if (!EMAIL_PATTERN.test(raw.email)) errors.email = 'Enter a valid email address';
  else if (raw.email.length > 150) errors.email = 'Email must be 150 characters or fewer';

  if (!raw.phone) errors.phone = 'Phone is required';
  else if (!PHONE_PATTERN.test(raw.phone)) errors.phone = 'Enter a valid phone number';
  else if (raw.phone.length > 20) errors.phone = 'Phone must be 20 characters or fewer';

  if (!raw.company) errors.company = 'Company is required';
  else if (raw.company.length > 100) errors.company = 'Company must be 100 characters or fewer';

  if (!raw.source) errors.source = 'Source is required';
  else if (!LEAD_SOURCES.includes(raw.source)) {
    errors.source = `Source must be one of: ${LEAD_SOURCES.join(', ')}`;
  }

  const status = raw.status || 'New';
  if (!LEAD_STATUSES.includes(status)) {
    errors.status = `Status must be one of: ${LEAD_STATUSES.join(', ')}`;
  }

  return { values: { ...raw, status }, errors };
}
