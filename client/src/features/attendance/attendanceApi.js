import { apiSlice } from '../../app/apiSlice';

export const attendanceApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    punchIn: builder.mutation({
      query: (body) => ({
        url: '/attendance/punch-in',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Attendance', 'Reports'],
    }),
    punchOut: builder.mutation({
      query: (body) => ({
        url: '/attendance/punch-out',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Attendance', 'Reports'],
    }),
    getToday: builder.query({
      query: () => '/attendance/today',
      providesTags: ['Attendance'],
    }),
    getMyAttendance: builder.query({
      query: (params) => ({
        url: '/attendance/me',
        params,
      }),
      providesTags: ['Attendance'],
    }),
    getTeamAttendance: builder.query({
      query: (params) => ({
        url: '/attendance/team',
        params,
      }),
      providesTags: ['Attendance'],
    }),
    getAllAttendance: builder.query({
      query: (params) => ({
        url: '/attendance/all',
        params,
      }),
      providesTags: ['Attendance'],
    }),
    getAttendanceById: builder.query({
      query: (id) => `/attendance/${id}`,
      providesTags: (result, error, id) => [{ type: 'Attendance', id }],
    }),
    validateAttendance: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/attendance/${id}/validate`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Attendance', 'Reports'],
    }),
  }),
});

export const {
  usePunchInMutation,
  usePunchOutMutation,
  useGetTodayQuery,
  useGetMyAttendanceQuery,
  useGetTeamAttendanceQuery,
  useGetAllAttendanceQuery,
  useGetAttendanceByIdQuery,
  useValidateAttendanceMutation,
} = attendanceApi;
