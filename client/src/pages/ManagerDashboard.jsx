import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import AttendanceTable from '../components/AttendanceTable';
import AttendanceDetail from '../components/AttendanceDetail';
import {
  useGetTeamAttendanceQuery,
  useValidateAttendanceMutation,
} from '../features/attendance/attendanceApi';
import {
  useGetPendingOvertimeQuery,
  useReviewOvertimeMutation,
} from '../features/overtime/overtimeApi';
import { getErrorMessage } from '../utils/helpers';

const links = [
  { to: '/manager', label: 'Dashboard', end: true },
  { to: '/manager/reports', label: 'Daily Report' },
];

export default function ManagerDashboard() {
  const [date, setDate] = useState('');
  const { data, isLoading, refetch } = useGetTeamAttendanceQuery({
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
          <span>Team records</span>
          <strong>{rows.length}</strong>
        </div>
        <div className="stat-card">
          <span>Pending OT</span>
          <strong>{pendingOt.length}</strong>
        </div>
      </div>

      <section className="panel">
        <div className="panel-head">
          <h2>Team attendance</h2>
          <div className="filters">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <button type="button" className="btn btn-ghost" onClick={() => setDate('')}>
              Clear
            </button>
            <Link to="/manager/reports" className="btn btn-primary">
              Daily report
            </Link>
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
            <h2>Validate selfie</h2>
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
