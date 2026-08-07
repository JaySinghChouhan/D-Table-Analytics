import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import AttendanceTable from '../components/AttendanceTable';
import AttendanceDetail from '../components/AttendanceDetail';
import {
  useGetAllAttendanceQuery,
  useValidateAttendanceMutation,
} from '../features/attendance/attendanceApi';
import {
  useGetPendingOvertimeQuery,
  useReviewOvertimeMutation,
} from '../features/overtime/overtimeApi';
import { useGetUsersQuery } from '../features/users/usersApi';
import { getErrorMessage } from '../utils/helpers';

const links = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/reports', label: 'Daily Report' },
];

export default function AdminDashboard() {
  const [date, setDate] = useState('');
  const { data: usersData, isLoading: usersLoading } = useGetUsersQuery();
  const { data, isLoading, refetch } = useGetAllAttendanceQuery({
    ...(date ? { date } : {}),
    limit: 50,
  });
  const { data: otData, refetch: refetchOt } = useGetPendingOvertimeQuery();
  const [validateAttendance, { isLoading: validating }] = useValidateAttendanceMutation();
  const [reviewOt, { isLoading: reviewing }] = useReviewOvertimeMutation();
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [otRemarks, setOtRemarks] = useState({});

  const users = usersData?.data?.users || [];
  const rows = data?.data?.attendance || [];
  const pendingOt = otData?.data?.overtime || [];

  const handleValidate = async (validationStatus, remarks = '') => {
    if (!selected) return;
    setError('');
    setMessage('');
    try {
      const res = await validateAttendance({
        id: selected._id,
        validationStatus,
        validationRemarks: remarks,
      }).unwrap();
      setSelected(res.data.attendance);
      setMessage(`Marked as ${validationStatus}`);
      refetch();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleReview = async (id, status) => {
    setError('');
    setMessage('');
    try {
      await reviewOt({
        id,
        status,
        reviewRemarks: otRemarks[id] || '',
      }).unwrap();
      setMessage(`Overtime ${status}`);
      refetchOt();
      refetch();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Layout links={links}>
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="stats-row">
        <div className="stat-card">
          <span>Users</span>
          <strong>{users.length}</strong>
        </div>
        <div className="stat-card">
          <span>Attendance records</span>
          <strong>{rows.length}</strong>
        </div>
        <div className="stat-card">
          <span>Pending OT</span>
          <strong>{pendingOt.length}</strong>
        </div>
      </div>

      <section className="panel">
        <div className="panel-head">
          <h2>All users</h2>
          <Link to="/admin/reports" className="btn btn-primary">
            Daily report
          </Link>
        </div>
        {usersLoading ? (
          <p className="muted">Loading…</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Manager</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className="badge">{user.role}</span>
                    </td>
                    <td>{user.managerId?.name || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>System-wide attendance</h2>
          <div className="filters">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <button type="button" className="btn btn-ghost" onClick={() => setDate('')}>
              Clear
            </button>
          </div>
        </div>
        {isLoading ? (
          <p className="muted">Loading…</p>
        ) : (
          <AttendanceTable rows={rows} onSelect={setSelected} />
        )}
      </section>

      {selected && (
        <section className="panel">
          <div className="panel-head">
            <h2>Validate attendance</h2>
            <button type="button" className="btn btn-ghost" onClick={() => setSelected(null)}>
              Close
            </button>
          </div>
          <AttendanceDetail
            key={selected._id}
            attendance={selected}
            canValidate
            validating={validating}
            onValidate={handleValidate}
          />
        </section>
      )}

      <section className="panel">
        <h2>Pending overtime</h2>
        {!pendingOt.length ? (
          <div className="empty-state">No pending overtime requests.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Hours</th>
                  <th>Reason</th>
                  <th>Remarks</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingOt.map((ot) => (
                  <tr key={ot._id}>
                    <td>{ot.userId?.name}</td>
                    <td>{ot.requestedHours}</td>
                    <td>{ot.reason}</td>
                    <td>
                      <input
                        type="text"
                        placeholder="Optional remarks"
                        value={otRemarks[ot._id] || ''}
                        onChange={(e) =>
                          setOtRemarks((prev) => ({ ...prev, [ot._id]: e.target.value }))
                        }
                      />
                    </td>
                    <td className="btn-row">
                      <button
                        type="button"
                        className="btn btn-success btn-sm"
                        disabled={reviewing}
                        onClick={() => handleReview(ot._id, 'approved')}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        disabled={reviewing}
                        onClick={() => handleReview(ot._id, 'rejected')}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </Layout>
  );
}
