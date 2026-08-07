import { useState } from 'react';
import { formatDateTime, formatHours, statusClass } from '../utils/helpers';

export default function AttendanceDetail({
  attendance,
  canValidate,
  onValidate,
  validating,
}) {
  const [remarks, setRemarks] = useState(attendance?.validationRemarks || '');

  if (!attendance) return null;

  return (
    <div className="detail-grid">
      <section className="panel">
        <h3>Attendance details</h3>
        <dl className="meta-list">
          <div>
            <dt>Employee</dt>
            <dd>{attendance.userId?.name}</dd>
          </div>
          <div>
            <dt>Date</dt>
            <dd>{attendance.date}</dd>
          </div>
          <div>
            <dt>Working hours</dt>
            <dd>{formatHours(attendance.workingHours)}</dd>
          </div>
          <div>
            <dt>Shift</dt>
            <dd>
              <span className={statusClass(attendance.shiftStatus)}>
                {attendance.shiftStatus}
              </span>
            </dd>
          </div>
          <div>
            <dt>Validation</dt>
            <dd>
              <span className={statusClass(attendance.validationStatus)}>
                {attendance.validationStatus}
              </span>
            </dd>
          </div>
          <div>
            <dt>Overtime</dt>
            <dd>
              <span className={statusClass(attendance.overtimeStatus)}>
                {attendance.overtimeStatus}
              </span>
            </dd>
          </div>
          {attendance.validationRemarks && (
            <div>
              <dt>Remarks</dt>
              <dd>{attendance.validationRemarks}</dd>
            </div>
          )}
        </dl>
      </section>

      <section className="panel">
        <h3>Punch In</h3>
        <p className="muted">{formatDateTime(attendance.punchIn?.time)}</p>
        <p className="muted">
          {attendance.punchIn?.latitude?.toFixed(5)}, {attendance.punchIn?.longitude?.toFixed(5)}
        </p>
        {attendance.punchIn?.selfie && (
          <img src={attendance.punchIn.selfie} alt="Punch in selfie" className="selfie" />
        )}
      </section>

      <section className="panel">
        <h3>Punch Out</h3>
        {attendance.punchOut ? (
          <>
            <p className="muted">{formatDateTime(attendance.punchOut.time)}</p>
            <p className="muted">
              {attendance.punchOut.latitude?.toFixed(5)},{' '}
              {attendance.punchOut.longitude?.toFixed(5)}
            </p>
            {attendance.punchOut.selfie && (
              <img src={attendance.punchOut.selfie} alt="Punch out selfie" className="selfie" />
            )}
          </>
        ) : (
          <p className="muted">Not punched out yet.</p>
        )}
      </section>

      {canValidate && (
        <section className="panel">
          <h3>Validate authenticity</h3>
          <p className="muted">Review the live selfies and mark this attendance.</p>
          <label className="stack-form">
            Remarks / notes
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder={
                attendance.validationStatus === 'invalid'
                  ? 'Why is this invalid?'
                  : 'Optional notes about authenticity'
              }
            />
          </label>
          <div className="btn-row" style={{ marginTop: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-success"
              disabled={validating}
              onClick={() => onValidate('valid', remarks)}
            >
              Mark valid
            </button>
            <button
              type="button"
              className="btn btn-danger"
              disabled={validating}
              onClick={() => onValidate('invalid', remarks)}
            >
              Mark invalid
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
