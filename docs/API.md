# PostHub 3.0 — Enterprise-Style REST API Specification

**Base URL:** `http://localhost:5000/api` (or configured `VITE_API_URL`)

All responses adhere strictly to enterprise envelope standards:

**Success Response Envelope:**
```json
{
  "success": true,
  "message": "Human-readable status message",
  "data": {}
}
```

**Error Response Envelope:**
```json
{
  "success": false,
  "message": "Error description or validation feedback"
}
```

**Cursor Pagination Envelope:**
```json
{
  "items": [],
  "pagination": {
    "hasMore": true,
    "nextCursor": "2026-09-06T11:45:00.000Z",
    "limit": 10
  }
}
```

---

## 1. Authentication & Session Security (`/api/auth`)

### 1.1 Register New User
* **Method:** `POST`
* **URL:** `/api/auth/register`
* **Auth:** None
* **Body:**
  ```json
  {
    "name": "Alex Mercer",
    "email": "alex@mercer.dev",
    "password": "StrongPassword123!"
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "user": {
        "_id": "60d0fe4f5311236168a109ca",
        "name": "Alex Mercer",
        "username": "alexmercer",
        "email": "alex@mercer.dev",
        "role": "user"
      }
    }
  }
  ```

### 1.2 User Login (Dual Token Issue)
* **Method:** `POST`
* **URL:** `/api/auth/login`
* **Auth:** None
* **Body:**
  ```json
  {
    "email": "alex@mercer.dev",
    "password": "StrongPassword123!"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "user": {
        "_id": "60d0fe4f5311236168a109ca",
        "name": "Alex Mercer",
        "username": "alexmercer",
        "email": "alex@mercer.dev",
        "role": "user"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "8f48b9f71c4c..."
    }
  }
  ```

### 1.3 Refresh Access Token
* **Method:** `POST`
* **URL:** `/api/auth/refresh`
* **Auth:** None (Requires valid `refreshToken` in request payload)
* **Body:**
  ```json
  {
    "refreshToken": "8f48b9f71c4c..."
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Session refreshed successfully",
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "7e31a1b82e..."
    }
  }
  ```

### 1.4 Single Session Logout
* **Method:** `POST`
* **URL:** `/api/auth/logout`
* **Auth:** Optional / Bearer Token
* **Body:**
  ```json
  {
    "refreshToken": "7e31a1b82e..."
  }
  ```

### 1.5 Global Session Revocation (Logout All Devices)
* **Method:** `POST`
* **URL:** `/api/auth/logout-all`
* **Auth:** Required (`Bearer <access_token>`)
* **Response (200 OK):** Revokes all active refresh tokens for the authenticated user.

---

## 2. User Profiles & Social Graph (`/api/users`)

### 2.1 Get User Profile by Username
* **Method:** `GET`
* **URL:** `/api/users/profile/:username`
* **Auth:** Optional (Bearer token enables `isFollowing`, `isBlocked`, `isMuted`, and `mutualFollowers`)
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "_id": "...",
      "name": "Alex Mercer",
      "username": "alexmercer",
      "followersCount": 420,
      "followingCount": 180,
      "isFollowing": true,
      "isBlocked": false,
      "isMuted": false,
      "mutualFollowers": [
        { "_id": "...", "name": "Sarah Connor", "username": "sconnor" }
      ]
    }
  }
  ```

### 2.2 Update Account Settings & Privacy
* **Method:** `PUT`
* **URL:** `/api/users/settings`
* **Auth:** Required
* **Body:**
  ```json
  {
    "privacy": {
      "profileVisibility": "public",
      "whoCanComment": "everyone",
      "whoCanMention": "followers"
    },
    "notificationSettings": {
      "likes": true,
      "comments": true,
      "saves": false
    }
  }
  ```

### 2.3 Change Password
* **Method:** `POST`
* **URL:** `/api/users/change-password`
* **Auth:** Required
* **Body:**
  ```json
  {
    "currentPassword": "OldPassword123!",
    "newPassword": "BrandNewSecurePassword456!"
  }
  ```

### 2.4 Deactivate Account
* **Method:** `POST`
* **URL:** `/api/users/delete-account`
* **Auth:** Required
* **Body:**
  ```json
  {
    "password": "PasswordForVerification!"
  }
  ```

### 2.5 Block / Unblock User
* **Block:** `POST /api/users/:id/block` (Severs mutual follow relationships and excludes content server-side)
* **Unblock:** `DELETE /api/users/:id/block`

### 2.6 Mute / Unmute User
* **Mute:** `POST /api/users/:id/mute`
* **Unmute:** `DELETE /api/users/:id/mute`

---

## 3. Modular Feed Engine & Posts (`/api/posts`)

### 3.1 Fetch Feed with Cursor Pagination & Explainable Discovery
* **Method:** `GET`
* **URL:** `/api/posts`
* **Auth:** Optional / Recommended
* **Query Parameters:**
  * `feedType`: `forYou` | `following` | `trending` | `latest`
  * `cursor`: ISO date string (e.g. `2026-09-06T10:00:00.000Z`)
  * `limit`: Number of records (1–50, default: 10)
  * `tag`: Filter by normalized hashtag
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "items": [
        {
          "_id": "...",
          "title": "System Architecture at Scale",
          "content": "A deep dive into distributed event brokers...",
          "status": "PUBLISHED",
          "discoveryReason": "Because you follow this creator",
          "trendingScore": 142
        }
      ],
      "pagination": {
        "hasMore": true,
        "nextCursor": "2026-09-06T09:12:00.000Z",
        "limit": 10
      }
    }
  }
  ```

### 3.2 My Posts (Status Lifecycle Management)
* **Method:** `GET`
* **URL:** `/api/posts/me`
* **Auth:** Required
* **Query Parameters:** `status=PUBLISHED|DRAFT|ARCHIVED`, `page=1`, `limit=10`

### 3.3 Archive / Restore Post
* **Method:** `PATCH`
* **URL:** `/api/posts/:id/archive`
* **Auth:** Required (Author only)
* **Response (200 OK):** Toggles between `ARCHIVED` and `PUBLISHED`.

---

## 4. Creator Analytics (`/api/analytics`)

### 4.1 Get Creator Telemetry
* **Method:** `GET`
* **URL:** `/api/analytics/me`
* **Auth:** Required
* **Query Parameters:** `period=7d|30d|90d|all`
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "period": "30d",
      "totalPosts": 14,
      "totalLikes": 182,
      "totalComments": 48,
      "totalSaves": 29,
      "engagementRate": 18.5,
      "breakdown": {
        "text": 6,
        "image": 5,
        "poll": 2,
        "link": 1
      },
      "topPosts": [],
      "timeline": []
    }
  }
  ```

---

## 5. Administration & Compliance Audit Trail (`/api/admin`)

### 5.1 Platform KPIs & Metrics
* **Method:** `GET`
* **URL:** `/api/admin/stats`
* **Auth:** Admin / Moderator role

### 5.2 Immutable Audit Trail
* **Method:** `GET`
* **URL:** `/api/admin/audit-logs`
* **Auth:** Admin role
* **Query Parameters:** `page=1`, `limit=50`
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "logs": [
        {
          "_id": "...",
          "action": "USER_SUSPENDED",
          "actor": { "name": "Admin", "username": "admin" },
          "targetType": "USER",
          "targetId": "...",
          "details": { "isSuspended": true },
          "createdAt": "2026-09-06T10:30:00.000Z"
        }
      ],
      "total": 42
    }
  }
  ```
