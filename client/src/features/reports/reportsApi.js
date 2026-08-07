import { apiSlice } from '../../app/apiSlice';

export const reportsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDailyReport: builder.query({
      query: (params) => ({
        url: '/reports/daily',
        params,
      }),
      providesTags: ['Reports'],
    }),
  }),
});

export const { useGetDailyReportQuery } = reportsApi;
