import { formatDateTime, formatHours, statusClass } from '../utils/helpers';

export default function AttendanceTable({ rows, onSelect, showEmployee = true }) {
  if (!rows?.length) {
    return <div className="empty-state">No attendance records found.</div>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {showEmployee && <th>Employee</th>}
            <th>Date</th>
            <th>Punch In</th>
            <th>Punch Out</th>
            <th>Hours</th>
            <th>Shift</th>
            <th>Validation</th>
            <th>OT</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row._id}>
              {showEmployee && <td>{row.userId?.name || '—'}</td>}
              <td>{row.date}</td>
              <td>{formatDateTime(row.punchIn?.time)}</td>
              <td>{formatDateTime(row.punchOut?.time)}</td>
              <td>{formatHours(row.workingHours)}</td>
              <td>
                <span className={statusClass(row.shiftStatus)}>{row.shiftStatus}</span>
              </td>
              <td>
                <span className={statusClass(row.validationStatus)}>{row.validationStatus}</span>
              </td>
              <td>
                <span className={statusClass(row.overtimeStatus)}>{row.overtimeStatus}</span>
              </td>
              <td>
                {onSelect && (
                  <button type="button" className="btn btn-sm" onClick={() => onSelect(row)}>
                    View
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
