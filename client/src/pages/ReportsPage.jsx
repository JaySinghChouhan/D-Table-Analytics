import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import Layout from '../components/Layout';
import { selectCurrentUser } from '../features/auth/authSlice';
import { useGetDailyReportQuery } from '../features/reports/reportsApi';
import { formatDateTime, formatHours, localDateKey, statusClass } from '../utils/helpers';

const formatLoc = (loc) =>
  loc ? `${Number(loc.latitude).toFixed(4)}, ${Number(loc.longitude).toFixed(4)}` : '—';

export default function ReportsPage() {
  const user = useSelector(selectCurrentUser);
  const [date, setDate] = useState(localDateKey());
  const { data, isLoading, isFetching } = useGetDailyReportQuery({ date });

  const links = useMemo(() => {
    if (user?.role === 'admin') {
      return [
        { to: '/admin', label: 'Dashboard', end: true },
        { to: '/admin/reports', label: 'Daily Report' },
      ];
    }
    if (user?.role === 'manager') {
      return [
        { to: '/manager', label: 'Dashboard', end: true },
        { to: '/manager/reports', label: 'Daily Report' },
      ];
    }
    return [
      { to: '/employee', label: 'Dashboard', end: true },
      { to: '/employee/punch', label: 'Punch In / Out' },
      { to: '/employee/reports', label: 'Daily Report' },
    ];
  }, [user?.role]);

  const report = data?.data?.report || [];

  const exportCsv = () => {
    const headers = [
      'Name',
      'Email',
      'Punch In',
      'Punch Out',
      'Punch In Location',
      'Punch Out Location',
      'Working Hours',
      'Shift Status',
      'Validation',
      'OT Status',
      'Remarks',
    ];
    const rows = report.map((row) => [
      row.name,
      row.email,
      row.punchInTime ? new Date(row.punchInTime).toLocaleString() : '',
      row.punchOutTime ? new Date(row.punchOutTime).toLocaleString() : '',
      formatLoc(row.punchInLocation),
      formatLoc(row.punchOutLocation),
      row.workingHours ?? '',
      row.shiftStatus,
      row.validationStatus,
      row.overtimeStatus,
      row.validationRemarks || '',
    ]);
    const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csv = [headers, ...rows].map((r) => r.map(escape).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout links={links}>
      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>Daily attendance report</h2>
            <p className="muted">
              Scoped by role — employee sees own data, manager sees team, admin sees all.
            </p>
          </div>
          <div className="filters">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <button
              type="button"
              className="btn btn-ghost"
              onClick={exportCsv}
              disabled={!report.length}
            >
              Export CSV
            </button>
          </div>
        </div>

        {(isLoading || isFetching) && <p className="muted">Loading report…</p>}

        {!isLoading && !report.length ? (
          <div className="empty-state">No attendance for {date}.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Punch In</th>
                  <th>Punch Out</th>
                  <th>Selfie In</th>
                  <th>Selfie Out</th>
                  <th>Location In</th>
                  <th>Location Out</th>
                  <th>Hours</th>
                  <th>Shift</th>
                  <th>Validation</th>
                  <th>OT</th>
                </tr>
              </thead>
              <tbody>
                {report.map((row) => (
                  <tr key={row.id}>
                    <td>{row.name}</td>
                    <td>{formatDateTime(row.punchInTime)}</td>
                    <td>{formatDateTime(row.punchOutTime)}</td>
                    <td>
                      {row.punchInSelfie ? (
                        <img src={row.punchInSelfie} alt="" className="thumb" />
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>
                      {row.punchOutSelfie ? (
                        <img src={row.punchOutSelfie} alt="" className="thumb" />
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>{formatLoc(row.punchInLocation)}</td>
                    <td>{formatLoc(row.punchOutLocation)}</td>
                    <td>{formatHours(row.workingHours)}</td>
                    <td>
                      <span className={statusClass(row.shiftStatus)}>{row.shiftStatus}</span>
                    </td>
                    <td>
                      <span className={statusClass(row.validationStatus)}>
                        {row.validationStatus}
                      </span>
                    </td>
                    <td>
                      <span className={statusClass(row.overtimeStatus)}>{row.overtimeStatus}</span>
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
