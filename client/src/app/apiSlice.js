import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const resolveApiUrl = (raw) => {
  const value = String(raw || '').trim();
  if (!value) return '/api';

  // Fix accidental markdown links pasted into Vercel env vars: [url](url)
  const markdownMatch = value.match(/\((https?:\/\/[^)\s]+)\)/i);
  if (markdownMatch) return markdownMatch[1];

  const plainMatch = value.match(/https?:\/\/[^\s\]]+/i);
  if (plainMatch) return plainMatch[0];

  return value;
};

const baseQuery = fetchBaseQuery({
  baseUrl: resolveApiUrl(import.meta.env.VITE_API_URL),
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Auth', 'Attendance', 'Overtime', 'Users', 'Reports'],
  endpoints: () => ({}),
});
