const STANDARD_SHIFT_HOURS = 8;

/** Local calendar day as YYYY-MM-DD (avoids UTC midnight shifting attendance day). */
const getTodayDateKey = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const calculateWorkingHours = (punchInTime, punchOutTime) => {
  const diffMs = new Date(punchOutTime) - new Date(punchInTime);
  const hours = diffMs / (1000 * 60 * 60);
  return Math.max(0, Math.round(hours * 100) / 100);
};

const getShiftStatus = (workingHours) => {
  return workingHours >= STANDARD_SHIFT_HOURS ? 'completed' : 'incomplete';
};

module.exports = {
  STANDARD_SHIFT_HOURS,
  getTodayDateKey,
  calculateWorkingHours,
  getShiftStatus,
};
