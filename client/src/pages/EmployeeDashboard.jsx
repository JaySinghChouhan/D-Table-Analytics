import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import AttendanceTable from '../components/AttendanceTable';
import {
  useGetMyAttendanceQuery,
  useGetTodayQuery,
} from '../features/attendance/attendanceApi';
import { useGetMyOvertimeQuery, useRequestOvertimeMutation } from '../features/overtime/overtimeApi';
import { formatHours, getErrorMessage, statusClass } from '../utils/helpers';

const links = [
  { to: '/employee', label: 'Dashboard', end: true },
  { to: '/employee/punch', label: 'Punch In / Out' },
  { to: '/employee/reports', label: 'Daily Report' },
];

export default function EmployeeDashboard() {
  const { data: todayData, isLoading: todayLoading } = useGetTodayQuery();
  const { data: historyData, isLoading: historyLoading } = useGetMyAttendanceQuery({ limit: 20 });
  const { data: otData, refetch: refetchOt } = useGetMyOvertimeQuery();
  const [requestOt, { isLoading: otLoading }] = useRequestOvertimeMutation();
  const [otForm, setOtForm] = useState({ attendanceId: '', requestedHours: 1, reason: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const today = todayData?.data?.attendance;
  const history = historyData?.data?.attendance || [];
  const overtime = otData?.data?.overtime || [];

  const otEligible = useMemo(
    () =>
      history.filter(
        (row) =>
          row.punchOut &&
          !['pending', 'approved'].includes(row.overtimeStatus)
      ),
    [history]
  );

  const submitOt = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    const attendanceId = otForm.attendanceId || today?._id;
    if (!attendanceId) {
      setError('Select an attendance day with punch-out to request overtime.');
      return;
    }
    try {
      await requestOt({
        attendanceId,
        requestedHours: Number(otForm.requestedHours),
        reason: otForm.reason,
      }).unwrap();
      setMessage('Overtime request submitted.');
      setOtForm({ attendanceId: '', requestedHours: 1, reason: '' });
      refetchOt();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Layout links={links}>
      <div className="stats-row">
        <div className="stat-card">
          <span>Today</span>
          <strong>{today ? 'Punched in' : 'Not punched in'}</strong>
        </div>
        <div className="stat-card">
          <span>Working hours</span>
          <strong>{formatHours(today?.workingHours || 0)}</strong>
        </div>
        <div className="stat-card">
          <span>Shift status</span>
          <strong>
            {today ? (
              <span className={statusClass(today.shiftStatus)}>{today.shiftStatus}</span>
            ) : (
              '—'
            )}
          </strong>
        </div>
        <div className="stat-card">
          <span>OT status</span>
          <strong>
            {today ? (
              <span className={statusClass(today.overtimeStatus)}>{today.overtimeStatus}</span>
            ) : (
              '—'
            )}
          </strong>
        </div>
      </div>

      <div className="split-grid">
        <section className="panel">
          <div className="panel-head">
            <h2>Today&apos;s attendance</h2>
            <Link to="/employee/punch" className="btn btn-primary">
              Go to punch
            </Link>
          </div>
          {todayLoading ? (
            <p className="muted">Loading…</p>
          ) : today ? (
            <ul className="simple-list">
              <li>Date: {today.date}</li>
              <li>Validation: {today.validationStatus}</li>
              <li>
                Punch in location: {today.punchIn.latitude.toFixed(4)},{' '}
                {today.punchIn.longitude.toFixed(4)}
              </li>
              {!today.punchOut && (
                <li className="muted">Punch out still pending — shift remains incomplete.</li>
              )}
            </ul>
          ) : (
            <p className="muted">You have not punched in yet today.</p>
          )}
        </section>

        <section className="panel">
          <h2>Request overtime</h2>
          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-error">{error}</div>}
          <form className="stack-form" onSubmit={submitOt}>
            <label>
              Attendance day
              <select
                value={otForm.attendanceId}
                onChange={(e) => setOtForm({ ...otForm, attendanceId: e.target.value })}
                required
              >
                <option value="">Select punched-out day</option>
                {otEligible.map((row) => (
                  <option key={row._id} value={row._id}>
                    {row.date} · {formatHours(row.workingHours)} · {row.shiftStatus}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Hours
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={otForm.requestedHours}
                onChange={(e) => setOtForm({ ...otForm, requestedHours: e.target.value })}
                required
              />
            </label>
            <label>
              Reason
              <textarea
                rows={3}
                value={otForm.reason}
                onChange={(e) => setOtForm({ ...otForm, reason: e.target.value })}
                required
              />
            </label>
            <button type="submit" className="btn btn-primary" disabled={otLoading || !otEligible.length}>
              {otLoading ? 'Submitting…' : 'Submit OT request'}
            </button>
            {!otEligible.length && (
              <p className="muted">Punch out on a day before requesting overtime.</p>
            )}
          </form>
        </section>
      </div>

      <section className="panel">
        <h2>My attendance history</h2>
        {historyLoading ? (
          <p className="muted">Loading…</p>
        ) : (
          <AttendanceTable rows={history} showEmployee={false} />
        )}
      </section>

      <section className="panel">
        <h2>Overtime requests</h2>
        {!overtime.length ? (
          <div className="empty-state">No overtime requests yet.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Hours</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {overtime.map((ot) => (
                  <tr key={ot._id}>
                    <td>{ot.requestedHours}</td>
                    <td>{ot.reason}</td>
                    <td>
                      <span className={statusClass(ot.status)}>{ot.status}</span>
                    </td>
                    <td>{ot.reviewRemarks || '—'}</td>
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
