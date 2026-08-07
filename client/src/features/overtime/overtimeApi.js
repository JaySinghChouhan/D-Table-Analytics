import { apiSlice } from '../../app/apiSlice';

export const overtimeApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    requestOvertime: builder.mutation({
      query: (body) => ({
        url: '/overtime',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Overtime', 'Attendance'],
    }),
    getMyOvertime: builder.query({
      query: () => '/overtime/me',
      providesTags: ['Overtime'],
    }),
    getPendingOvertime: builder.query({
      query: () => '/overtime/pending',
      providesTags: ['Overtime'],
    }),
    reviewOvertime: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/overtime/${id}/review`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Overtime', 'Attendance'],
    }),
  }),
});

export const {
  useRequestOvertimeMutation,
  useGetMyOvertimeQuery,
  useGetPendingOvertimeQuery,
  useReviewOvertimeMutation,
} = overtimeApi;
