# API Documentation

SecurityGateApp REST API — Base URL: `https://[project].onrender.com`

All endpoints return:
```json
{ "success": true, "data": {}, "message": "string" }
{ "success": false, "error": "string", "code": 400 }
```

Authentication: `Authorization: Bearer <jwt_access_token>`

---

## Health

### `GET /health`
Returns server status.

**Response** `200 OK`
```json
{ "status": "ok", "timestamp": "2026-04-24T10:00:00Z" }
```

---

## Auth — `POST /api/v1/auth`

### `GET /api/v1/auth/google`
Initiates Google OAuth2 flow. Redirects to Google consent screen.

### `GET /api/v1/auth/google/callback`
OAuth2 callback. Redirects to frontend with JWT tokens as query params.

### `POST /api/v1/auth/login`
Email/password login.

**Request**
```json
{ "email": "guard@community.com", "password": "secret" }
```

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "user": { "id": "...", "name": "...", "role": "guard" }
  }
}
```

### `POST /api/v1/auth/refresh`
Exchange refresh token for new access token.

**Request**
```json
{ "refreshToken": "eyJ..." }
```

---

*More endpoints will be documented as they are implemented in each sprint.*
