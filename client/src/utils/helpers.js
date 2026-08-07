/** Local calendar day as YYYY-MM-DD */
export const localDateKey = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const formatDateTime = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleString();
};

export const formatHours = (hours) => {
  if (hours === null || hours === undefined) return '—';
  return `${Number(hours).toFixed(2)} h`;
};

export const statusClass = (status) => {
  const map = {
    completed: 'badge badge-success',
    incomplete: 'badge badge-warning',
    pending: 'badge badge-muted',
    valid: 'badge badge-success',
    invalid: 'badge badge-danger',
    approved: 'badge badge-success',
    rejected: 'badge badge-danger',
    none: 'badge badge-muted',
  };
  return map[status] || 'badge';
};

export const getDashboardPath = (role) => {
  if (role === 'admin') return '/admin';
  if (role === 'manager') return '/manager';
  return '/employee';
};

export const getErrorMessage = (error) => {
  if (error?.status === 'FETCH_ERROR' || error?.error === 'TypeError: Failed to fetch') {
    return 'Cannot reach the API server. Make sure the backend is running on port 5000.';
  }
  if (error?.status === 502 || error?.originalStatus === 502) {
    return 'API gateway error (502). Start MongoDB and the backend server, then try again.';
  }
  return (
    error?.data?.message ||
    error?.error ||
    error?.message ||
    'Something went wrong'
  );
};
