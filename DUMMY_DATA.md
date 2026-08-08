# Dummy Data — Attendance System

Database: `attendance_system`  
Connection: `mongodb://127.0.0.1:27017/attendance_system`  
Collections: `users`, `attendances`, `overtimerequests`


## Demo login accounts

| Role     | Email                     | Password      |
|----------|---------------------------|---------------|
| Admin    | `admin@attendance.com`    | `Admin@123`   |
| Manager  | `manager@attendance.com`  | `Manager@123` |
| Employee | `alice@attendance.com`    | `Employee@123`|
| Employee | `bob@attendance.com`      | `Employee@123`|
| Employee | `carol@attendance.com`    | `Employee@123`|



## 1. `users`

Stable ObjectIds used across linked attendance / overtime samples below.

```json
[
  {
    "_id": "6a7495edc61ca1a36331ae1c",
    "name": "Team Manager",
    "email": "manager@attendance.com",
    "password": "<bcrypt-hash>",
    "role": "manager",
    "managerId": null,
    "isActive": true,
    "createdAt": "2026-08-06T14:10:53.542Z",
    "updatedAt": "2026-08-06T14:10:53.542Z",
    "__v": 0
  },
  {
    "_id": "6a7495edc61ca1a36331ae1d",
    "name": "System Admin",
    "email": "admin@attendance.com",
    "password": "<bcrypt-hash>",
    "role": "admin",
    "managerId": null,
    "isActive": true,
    "createdAt": "2026-08-06T14:10:53.730Z",
    "updatedAt": "2026-08-06T14:10:53.730Z",
    "__v": 0
  },
  {
    "_id": "6a74998e99235c0853459b1a",
    "name": "Alice Employee",
    "email": "alice@attendance.com",
    "password": "<bcrypt-hash>",
    "role": "employee",
    "managerId": "6a7495edc61ca1a36331ae1c",
    "isActive": true,
    "createdAt": "2026-08-06T14:11:10.000Z",
    "updatedAt": "2026-08-06T14:11:10.000Z",
    "__v": 0
  },
  {
    "_id": "6a7587b0e18348802b4d0912",
    "name": "Bob Employee",
    "email": "bob@attendance.com",
    "password": "<bcrypt-hash>",
    "role": "employee",
    "managerId": "6a7495edc61ca1a36331ae1c",
    "isActive": true,
    "createdAt": "2026-08-06T14:11:12.000Z",
    "updatedAt": "2026-08-06T14:11:12.000Z",
    "__v": 0
  },
  {
    "_id": "6a7587b0e18348802b4d0913",
    "name": "Carol Employee",
    "email": "carol@attendance.com",
    "password": "<bcrypt-hash>",
    "role": "employee",
    "managerId": "6a7495edc61ca1a36331ae1c",
    "isActive": true,
    "createdAt": "2026-08-06T14:11:14.000Z",
    "updatedAt": "2026-08-06T14:11:14.000Z",
    "__v": 0
  }
]
```

### API response shape — `GET /api/users` / `GET /api/auth/me`

Password is never returned. Example `user` object:

```json
{
  "_id": "6a74998e99235c0853459b1a",
  "name": "Alice Employee",
  "email": "alice@attendance.com",
  "role": "employee",
  "managerId": "6a7495edc61ca1a36331ae1c",
  "createdAt": "2026-08-06T14:11:10.000Z"
}
```



```json
{ "success": true, "data": { "user": { "...": "..." } } }
```



## 2. `attendances`

`punchIn` / `punchOut` nested shape (required fields on punch-in):

```json
{
  "time": "2026-08-06T14:28:00.348Z",
  "latitude": 28.6139,
  "longitude": 77.209,
  "selfie": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAGcP//EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAQUCf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQMBAT8Bf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQIBAT8Bf//Z"
}
```


```json
[
  {
    "_id": "6a7499f099235c0853459b27",
    "userId": "6a74998e99235c0853459b1a",
    "date": "2026-08-06",
    "punchIn": {
      "time": "2026-08-06T14:28:00.348Z",
      "latitude": 28.6139,
      "longitude": 77.209,
      "selfie": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAGcP//EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAQUCf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQMBAT8Bf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQIBAT8Bf//Z"
    },
    "punchOut": {
      "time": "2026-08-06T14:40:45.000Z",
      "latitude": 28.6141,
      "longitude": 77.2092,
      "selfie": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAGcP//EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAQUCf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQMBAT8Bf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQIBAT8Bf//Z"
    },
    "workingHours": 0.21,
    "shiftStatus": "incomplete",
    "validationStatus": "pending",
    "validationRemarks": "",
    "validatedBy": null,
    "overtimeStatus": "approved",
    "overtimeRequestId": "6a749ce4e18348802b4d08a1",
    "createdAt": "2026-08-06T14:28:00.348Z",
    "updatedAt": "2026-08-06T14:40:58.991Z",
    "__v": 0
  },
  {
    "_id": "6a7587d2e18348802b4d091f",
    "userId": "6a7587b0e18348802b4d0912",
    "date": "2026-08-07",
    "punchIn": {
      "time": "2026-08-07T07:00:00.000Z",
      "latitude": 28.7041,
      "longitude": 77.1025,
      "selfie": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAGcP//EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAQUCf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQMBAT8Bf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQIBAT8Bf//Z"
    },
    "punchOut": {
      "time": "2026-08-07T07:00:36.000Z",
      "latitude": 28.7042,
      "longitude": 77.1026,
      "selfie": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAGcP//EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAQUCf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQMBAT8Bf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQIBAT8Bf//Z"
    },
    "workingHours": 0.01,
    "shiftStatus": "incomplete",
    "validationStatus": "pending",
    "validationRemarks": "",
    "validatedBy": null,
    "overtimeStatus": "approved",
    "overtimeRequestId": "6a758809e18348802b4d0938",
    "createdAt": "2026-08-07T07:00:00.000Z",
    "updatedAt": "2026-08-07T07:24:45.211Z",
    "__v": 0
  },
  {
    "_id": "6a7588a0e18348802b4d0940",
    "userId": "6a7587b0e18348802b4d0913",
    "date": "2026-08-07",
    "punchIn": {
      "time": "2026-08-07T01:30:00.000Z",
      "latitude": 19.076,
      "longitude": 72.8777,
      "selfie": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAGcP//EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAQUCf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQMBAT8Bf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQIBAT8Bf//Z"
    },
    "punchOut": {
      "time": "2026-08-07T10:00:00.000Z",
      "latitude": 19.0761,
      "longitude": 72.8778,
      "selfie": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAGcP//EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAQUCf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQMBAT8Bf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQIBAT8Bf//Z"
    },
    "workingHours": 8.5,
    "shiftStatus": "completed",
    "validationStatus": "valid",
    "validationRemarks": "Looks good",
    "validatedBy": "6a7495edc61ca1a36331ae1c",
    "overtimeStatus": "pending",
    "overtimeRequestId": "6a7588b0e18348802b4d0950",
    "createdAt": "2026-08-07T01:30:00.000Z",
    "updatedAt": "2026-08-07T10:15:00.000Z",
    "__v": 0
  },
  {
    "_id": "6a7589c0e18348802b4d0960",
    "userId": "6a74998e99235c0853459b1a",
    "date": "2026-08-07",
    "punchIn": {
      "time": "2026-08-07T03:00:00.000Z",
      "latitude": 28.6139,
      "longitude": 77.209,
      "selfie": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAGcP//EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAQUCf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQMBAT8Bf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQIBAT8Bf//Z"
    },
    "punchOut": null,
    "workingHours": 0,
    "shiftStatus": "incomplete",
    "validationStatus": "pending",
    "validationRemarks": "",
    "validatedBy": null,
    "overtimeStatus": "none",
    "overtimeRequestId": null,
    "createdAt": "2026-08-07T03:00:00.000Z",
    "updatedAt": "2026-08-07T03:00:00.000Z",
    "__v": 0
  }
]
```

### Field enums

| Field | Values |
|-------|--------|
| `shiftStatus` | `incomplete`, `completed` (≥ 8 hours) |
| `validationStatus` | `pending`, `valid`, `invalid` |
| `overtimeStatus` | `none`, `pending`, `approved`, `rejected` |

### API request — punch in / out

`POST /api/attendance/punch-in` and `POST /api/attendance/punch-out` send a **flat** body (server sets `time`):

```json
{
  "latitude": 28.6139,
  "longitude": 77.209,
  "selfie": "data:image/jpeg;base64,..."
}
```

### API response — list / today

```json
{
  "success": true,
  "data": {
    "attendance": [
      {
        "_id": "6a7499f099235c0853459b27",
        "userId": {
          "_id": "6a74998e99235c0853459b1a",
          "name": "Alice Employee",
          "email": "alice@attendance.com",
          "role": "employee",
          "managerId": "6a7495edc61ca1a36331ae1c"
        },
        "date": "2026-08-06",
        "punchIn": { "time": "...", "latitude": 28.6139, "longitude": 77.209, "selfie": "..." },
        "punchOut": { "time": "...", "latitude": 28.6141, "longitude": 77.2092, "selfie": "..." },
        "workingHours": 0.21,
        "shiftStatus": "incomplete",
        "validationStatus": "pending",
        "validationRemarks": "",
        "validatedBy": null,
        "overtimeStatus": "approved",
        "overtimeRequestId": "6a749ce4e18348802b4d08a1",
        "createdAt": "2026-08-06T14:28:00.348Z",
        "updatedAt": "2026-08-06T14:40:58.991Z"
      }
    ],
    "pagination": { "page": 1, "limit": 10, "total": 1, "pages": 1 }
  }
}
```

Endpoints that return attendance:

| `GET` | `/api/attendance/me` | employee / manager / admin |
| `GET` | `/api/attendance/today` | employee |
| `GET` | `/api/attendance/team` | manager |
| `GET` | `/api/attendance/all` | admin |
| `GET` | `/api/attendance/:id` | scoped |
| `PATCH` | `/api/attendance/:id/validate` | manager / admin |

Validate body:

```json
{ "validationStatus": "valid", "validationRemarks": "Looks good" }
```

---

## 3. `overtimerequests`

```json
[
  {
    "_id": "6a749ce4e18348802b4d08a1",
    "userId": "6a74998e99235c0853459b1a",
    "attendanceId": "6a7499f099235c0853459b27",
    "requestedHours": 1,
    "reason": "extra work",
    "status": "approved",
    "reviewedBy": "6a7495edc61ca1a36331ae1c",
    "reviewRemarks": "",
    "createdAt": "2026-08-06T14:40:36.343Z",
    "updatedAt": "2026-08-06T14:40:58.988Z",
    "__v": 0
  },
  {
    "_id": "6a758809e18348802b4d0938",
    "userId": "6a7587b0e18348802b4d0912",
    "attendanceId": "6a7587d2e18348802b4d091f",
    "requestedHours": 5,
    "reason": "EXTRA WORKING",
    "status": "approved",
    "reviewedBy": "6a7495edc61ca1a36331ae1c",
    "reviewRemarks": "",
    "createdAt": "2026-08-07T07:23:53.488Z",
    "updatedAt": "2026-08-07T07:24:45.211Z",
    "__v": 0
  },
  {
    "_id": "6a7588b0e18348802b4d0950",
    "userId": "6a7587b0e18348802b4d0913",
    "attendanceId": "6a7588a0e18348802b4d0940",
    "requestedHours": 0.5,
    "reason": "Client deadline push",
    "status": "pending",
    "reviewedBy": null,
    "reviewRemarks": "",
    "createdAt": "2026-08-07T10:10:00.000Z",
    "updatedAt": "2026-08-07T10:10:00.000Z",
    "__v": 0
  }
]
```

### Field enums


| `status` | `pending`, `approved`, `rejected` |
| `requestedHours` | number, min `0.5` |

### API


| `POST` | `/api/overtime` | `{ "attendanceId", "requestedHours", "reason" }` |
| `GET` | `/api/overtime/me` | own requests |
| `GET` | `/api/overtime/pending` | manager / admin queue |
| `PATCH` | `/api/overtime/:id/review` | `{ "status": "approved"\|"rejected", "reviewRemarks"? }` |

Example create:

```json
{
  "attendanceId": "6a7499f099235c0853459b27",
  "requestedHours": 1,
  "reason": "extra work"
}
```

Example review:

```json
{
  "status": "approved",
  "reviewRemarks": ""
}
```

Review syncs linked attendance `overtimeStatus` (`approved` / `rejected`).

---

## 4. Reports API sample — `GET /api/reports/daily?date=2026-08-07`

```json
{
  "success": true,
  "data": {
    "date": "2026-08-07",
    "count": 2,
    "report": [
      {
        "id": "6a7587d2e18348802b4d091f",
        "name": "Bob Employee",
        "email": "bob@attendance.com",
        "punchInTime": "2026-08-07T07:00:00.000Z",
        "punchOutTime": "2026-08-07T07:00:36.000Z",
        "punchInSelfie": "data:image/jpeg;base64,...",
        "punchOutSelfie": "data:image/jpeg;base64,...",
        "punchInLocation": { "latitude": 28.7041, "longitude": 77.1025 },
        "punchOutLocation": { "latitude": 28.7042, "longitude": 77.1026 },
        "workingHours": 0.01,
        "shiftStatus": "incomplete",
        "validationStatus": "pending",
        "overtimeStatus": "approved",
        "validationRemarks": ""
      },
      {
        "id": "6a7588a0e18348802b4d0940",
        "name": "Carol Employee",
        "email": "carol@attendance.com",
        "punchInTime": "2026-08-07T01:30:00.000Z",
        "punchOutTime": "2026-08-07T10:00:00.000Z",
        "punchInSelfie": "data:image/jpeg;base64,...",
        "punchOutSelfie": "data:image/jpeg;base64,...",
        "punchInLocation": { "latitude": 19.076, "longitude": 72.8777 },
        "punchOutLocation": { "latitude": 19.0761, "longitude": 72.8778 },
        "workingHours": 8.5,
        "shiftStatus": "completed",
        "validationStatus": "valid",
        "overtimeStatus": "pending",
        "validationRemarks": "Looks good"
      }
    ]
  }
}
```

---

## 5. Auth API samples

### `POST /api/auth/login`

Request:

```json
{ "email": "alice@attendance.com", "password": "Employee@123" }
```

Response:

```json
{
  "success": true,
  "data": {
    "token": "<jwt>",
    "user": {
      "_id": "6a74998e99235c0853459b1a",
      "name": "Alice Employee",
      "email": "alice@attendance.com",
      "role": "employee",
      "managerId": "6a7495edc61ca1a36331ae1c",
      "createdAt": "2026-08-06T14:11:10.000Z"
    }
  }
}
```

### `POST /api/auth/signup`

Request:

```json
{
  "name": "Dave Employee",
  "email": "dave@attendance.com",
  "password": "Employee@123"
}
```

New users are always `employee`; first available manager is auto-assigned as `managerId`.

---

## 6. ID relationship map

```
users
  manager  6a7495edc61ca1a36331ae1c
  admin    6a7495edc61ca1a36331ae1d
  alice    6a74998e99235c0853459b1a  → managerId = manager
  bob      6a7587b0e18348802b4d0912  → managerId = manager
  carol    6a7587b0e18348802b4d0913  → managerId = manager

attendances
  alice 2026-08-06  6a7499f099235c0853459b27  ↔ OT 6a749ce4e18348802b4d08a1 (approved)
  bob   2026-08-07  6a7587d2e18348802b4d091f  ↔ OT 6a758809e18348802b4d0938 (approved)
  carol 2026-08-07  6a7588a0e18348802b4d0940  ↔ OT 6a7588b0e18348802b4d0950 (pending)
  alice 2026-08-07  6a7589c0e18348802b4d0960  (punch-in only, no OT)
```

---

## Notes

- ObjectIds above match Compass samples where available; extra rows (Carol completed shift, Alice open punch) are for richer UI testing.
- Selfie values in production are full JPEG data URLs from the live camera; the snippets here are tiny placeholders.
- Seed users only via `npm run seed` / `AUTO_SEED` — this file is documentation/reference, not auto-imported by the server.
- Unique rule: one attendance per `{ userId, date }`.
