# Attendance Management System (MERN)

Full-stack Attendance Management System with live selfie capture, GPS location, role-based access, overtime workflow, attendance validation, and daily reports.

## Tech Stack

- **Frontend:** React (Vite), Redux Toolkit, RTK Query, React Router
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Logging:** Morgan + Winston
- **Auth:** JWT + bcrypt

## Features Implemented

- Secure signup/login with JWT
- Role-based access control (Employee, Manager, Admin)
- Protected routes on frontend and backend
- Punch In / Punch Out with:
  - Live camera selfie (no file upload)
  - GPS latitude & longitude
- Working hours calculation (standard shift = 8 hours)
  - `completed` if ≥ 8 hours
  - `incomplete` if < 8 hours
- Overtime request + Manager/Admin approve/reject (status synced to attendance)
- Role dashboards
- Attendance validation (view selfies, mark valid/invalid, remarks)
- Daily attendance reports (scoped by role) with punch-in/out selfie & location
- CSV export for daily reports
- Date filters and pagination on key list APIs
- Clean responsive UI

## Project Structure

```
client/          # React Vite frontend
server/          # Express API
```

### Prerequisites

- Node.js 18+
- MongoDB (local/Atlas) **or** use the built-in in-memory DB for local demo (`USE_MEMORY_DB=true`)
- Browser camera + geolocation permissions (localhost is fine)

### 1. Backend

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

With `USE_MEMORY_DB=true`, demo users are seeded automatically on server start.

For a persistent MongoDB:

```bash
# in .env
USE_MEMORY_DB=false
MONGODB_URI=mongodb://127.0.0.1:27017/attendance_system
npm run seed
npm run dev
```

API runs at `http://localhost:5000`.

### 2. Frontend

```bash
cd client
npm install
npm run dev
```

App runs at `http://localhost:5173` (Vite proxies `/api` to the backend).

### 3. Demo Accounts (after seed)

| Role     | Email                     | Password      |
|----------|---------------------------|---------------|
| Admin    | admin@attendance.com      | Admin@123     |
| Manager  | manager@attendance.com    | Manager@123   |
| Employee | alice@attendance.com      | Employee@123  |
| Employee | bob@attendance.com        | Employee@123  |
| Employee | carol@attendance.com      | Employee@123  |

Employees Alice/Bob/Carol are assigned to the seeded manager.

## Architecture Overview

1. Client uses RTK Query for all API calls and Redux for auth session.
2. Express routes call controllers; controllers use Mongoose models.
3. `protect` + `authorize` middleware enforce JWT and RBAC.
4. Manager data is scoped to users with `managerId` matching the manager.
5. Selfies are stored as compressed JPEG data URLs on attendance punch records (no external storage required for local/demo).
6. Winston writes app logs; Morgan logs HTTP requests.

### Main API groups

- `/api/auth` — signup, login, me
- `/api/attendance` — punch-in/out, lists, validate
- `/api/overtime` — request, pending, review
- `/api/users` — manager/admin user lists
- `/api/reports/daily` — daily report

## Assumptions

1. One attendance document per user per local calendar day (`YYYY-MM-DD` in the server timezone).
2. Signup always creates an `employee`. New signups are auto-assigned to the first available manager (if one exists). Manager/Admin accounts come from seed.
3. Working hours = punch-out time − punch-in time (no break tracking). Until punch-out, `workingHours` stays `0` and `shiftStatus` is `incomplete`.
4. Approved overtime is reflected on attendance (`overtimeStatus`) but does **not** change the 8-hour completed/incomplete rule.
5. Live selfie must come from `getUserMedia` capture; gallery/file upload is intentionally unsupported.
6. Location permission is mandatory for punch actions.
7. Manager team = employees whose `managerId` equals the manager’s `_id`.
8. Selfie images are stored inline as base64 data URLs for simplicity in this assessment.
9. Local demo can run with `mongodb-memory-server` (`USE_MEMORY_DB=true`). Data resets when the server process restarts. Demo users auto-seed when `USE_MEMORY_DB=true` or `AUTO_SEED=true`.

## Deployment

- Frontend: Vercel / Netlify
  - Set `VITE_API_URL` to your backend URL (e.g. `https://your-api.onrender.com/api`)
- Backend: Render / Railway / similar
  - Set `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`, `NODE_ENV=production`
- Ensure CORS `CLIENT_URL` matches the deployed frontend origin.

## Scripts

### Server

- `npm run dev` — start with nodemon
- `npm start` — production start
- `npm run seed` — reset and seed demo users

### Client

- `npm run dev` — Vite development server
- `npm run build` — production build
- `npm run preview` — preview build

## Evaluation Notes

Core flows prioritized over bonus features. Optional items such as geofencing, Socket.IO, notifications, and dark mode were intentionally deferred. CSV export for daily reports is included.
