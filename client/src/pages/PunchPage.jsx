import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import CameraCapture from '../components/CameraCapture';
import {
  useGetTodayQuery,
  usePunchInMutation,
  usePunchOutMutation,
} from '../features/attendance/attendanceApi';
import { formatDateTime, formatHours, getErrorMessage, statusClass } from '../utils/helpers';

const links = [
  { to: '/employee', label: 'Dashboard', end: true },
  { to: '/employee/punch', label: 'Punch In / Out' },
  { to: '/employee/reports', label: 'Daily Report' },
];

export default function PunchPage() {
  const { data, isLoading, refetch } = useGetTodayQuery();
  const [punchIn, { isLoading: punchingIn }] = usePunchInMutation();
  const [punchOut, { isLoading: punchingOut }] = usePunchOutMutation();
  const [capture, setCapture] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const today = data?.data?.attendance;
  const canPunchIn = !today;
  const canPunchOut = today && !today.punchOut;
  const busy = punchingIn || punchingOut;

  const submit = async (type) => {
    setError('');
    setMessage('');
    if (!capture) {
      setError('Capture a live selfie with location first.');
      return;
    }
    try {
      if (type === 'in') {
        await punchIn(capture).unwrap();
        setMessage('Punched in successfully.');
      } else {
        await punchOut(capture).unwrap();
        setMessage('Punched out successfully.');
      }
      setCapture(null);
      refetch();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Layout links={links}>
      <div className="panel-head page-head">
        <div>
          <h2>Live punch</h2>
          <p className="muted">Camera selfie and GPS location are required. File uploads are disabled.</p>
        </div>
        <Link to="/employee" className="btn btn-ghost">
          Back to dashboard
        </Link>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="split-grid">
        <section className="panel">
          <h3>Capture</h3>
          <CameraCapture onCapture={setCapture} disabled={busy || (!canPunchIn && !canPunchOut)} />
          <div className="btn-row" style={{ marginTop: '1rem' }}>
            {canPunchIn && (
              <button
                type="button"
                className="btn btn-primary"
                disabled={busy || !capture}
                onClick={() => submit('in')}
              >
                {punchingIn ? 'Punching in…' : 'Punch In'}
              </button>
            )}
            {canPunchOut && (
              <button
                type="button"
                className="btn btn-primary"
                disabled={busy || !capture}
                onClick={() => submit('out')}
              >
                {punchingOut ? 'Punching out…' : 'Punch Out'}
              </button>
            )}
            {!canPunchIn && !canPunchOut && (
              <p className="muted">You have completed punch in and punch out for today.</p>
            )}
          </div>
        </section>

        <section className="panel">
          <h3>Today&apos;s status</h3>
          {isLoading ? (
            <p className="muted">Loading…</p>
          ) : today ? (
            <ul className="simple-list">
              <li>Punch in: {formatDateTime(today.punchIn.time)}</li>
              <li>Punch out: {formatDateTime(today.punchOut?.time)}</li>
              <li>Hours: {formatHours(today.workingHours)}</li>
              <li>
                Shift:{' '}
                <span className={statusClass(today.shiftStatus)}>{today.shiftStatus}</span>
              </li>
            </ul>
          ) : (
            <p className="muted">No punch yet. Capture selfie + location, then punch in.</p>
          )}
        </section>
      </div>
    </Layout>
  );
}
