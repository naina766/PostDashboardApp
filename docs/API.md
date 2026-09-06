# PostHub 2.0 — Complete REST API Documentation

Base URL: `http://localhost:5000/api` (or production host)

All responses follow a consistent envelope structure:

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
  "message": "Error details or validation message"
}
```

---

## 1. Authentication & Identity (`/api/auth`)

### 1.1 Register New User
* **Method:** `POST`
* **URL:** `/api/auth/register`
* **Auth:** None
* **Body (JSON):**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "Password123!",
    "username": "janedoe"
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "_id": "60d0fe4f5311236168a109ca",
      "name": "Jane Doe",
      "username": "janedoe",
      "email": "jane@example.com",
      "role": "user"
    }
  }
  ```

### 1.2 User Login
* **Method:** `POST`
* **URL:** `/api/auth/login`
* **Auth:** None
* **Body (JSON):**
  ```json
  {
    "email": "jane@example.com",
    "password": "Password123!"
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
        "name": "Jane Doe",
        "username": "janedoe",
        "email": "jane@example.com",
        "avatar": "",
        "role": "user"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

---

## 2. User Profiles & Social Graph (`/api/users`)

### 2.1 Get User Profile by Username
* **Method:** `GET`
* **URL:** `/api/users/profile/:username`
* **Auth:** Optional (Bearer Token if authenticated)
* **Response (200 OK):** Returns profile with bio, location, website, skills, follower/following counts, and `isFollowing` boolean.

### 2.2 Update Profile Information
* **Method:** `PUT`
* **URL:** `/api/users/profile`
* **Auth:** Required (`Bearer <token>`)
* **Body (JSON):**
  ```json
  {
    "name": "Jane Doe",
    "bio": "Full-stack engineer & open-source contributor",
    "location": "San Francisco, CA",
    "website": "https://janedoe.dev",
    "skills": ["React", "Node.js", "MongoDB", "Express"],
    "socialLinks": {
      "github": "https://github.com/janedoe",
      "twitter": "https://twitter.com/janedoe",
      "linkedin": "https://linkedin.com/in/janedoe"
    }
  }
  ```

### 2.3 Upload Avatar
* **Method:** `POST`
* **URL:** `/api/users/avatar`
* **Auth:** Required
* **Body:** `multipart/form-data` with `avatar` file field.

### 2.4 Upload Cover Photo
* **Method:** `POST`
* **URL:** `/api/users/cover`
* **Auth:** Required
* **Body:** `multipart/form-data` with `coverImage` file field.

### 2.5 Follow User
* **Method:** `POST`
* **URL:** `/api/users/:id/follow`
* **Auth:** Required

### 2.6 Unfollow User
* **Method:** `DELETE`
* **URL:** `/api/users/:id/follow`
* **Auth:** Required

### 2.7 Get User Followers
* **Method:** `GET`
* **URL:** `/api/users/:id/followers?page=1&limit=20`

### 2.8 Get User Following
* **Method:** `GET`
* **URL:** `/api/users/:id/following?page=1&limit=20`

### 2.9 Get Suggested Users to Follow
* **Method:** `GET`
* **URL:** `/api/users/suggestions?limit=5`
* **Auth:** Required

---

## 3. Posts & Rich Content (`/api/posts`)

### 3.1 Get Social Posts Feed
* **Method:** `GET`
* **URL:** `/api/posts?page=1&limit=10&feedType=forYou&sort=latest`
* **Query Parameters:**
  * `page` (number)
  * `limit` (number, max 50)
  * `feedType`: `forYou` | `following` | `trending` | `latest`
  * `sort`: `latest` | `trending` | `likes` | `comments`
  * `tag`: Filter by hashtag without `#`
  * `search`: Keyword search
  * `authorId`: Filter by creator ObjectId

### 3.2 Create Post (Multi-media, Poll, or Link)
* **Method:** `POST`
* **URL:** `/api/posts`
* **Auth:** Required
* **Body:** `multipart/form-data` or `application/json`
  * `title`: String
  * `content`: String
  * `image` / `images`: Media file(s)
  * `poll`: JSON string `{ question: "...", options: ["Option 1", "Option 2"] }`
  * `linkPreview`: JSON string `{ url: "...", title: "...", description: "...", image: "..." }`

### 3.3 Get Post by ID
* **Method:** `GET`
* **URL:** `/api/posts/:id`
* **Auth:** Optional (returns `isLiked`, `isSaved`, `userVotedOption` if token provided)

### 3.4 Update Post
* **Method:** `PUT`
* **URL:** `/api/posts/:id`
* **Auth:** Required (Author only)

### 3.5 Delete Post
* **Method:** `DELETE`
* **URL:** `/api/posts/:id`
* **Auth:** Required (Author, Moderator, or Admin)

### 3.6 Toggle Like Post
* **Method:** `POST`
* **URL:** `/api/posts/:id/like`
* **Auth:** Required

### 3.7 Toggle Bookmark / Save Post
* **Method:** `POST`
* **URL:** `/api/posts/:id/save`
* **Auth:** Required

### 3.8 Vote on Poll
* **Method:** `POST`
* **URL:** `/api/posts/:id/vote`
* **Auth:** Required
* **Body (JSON):** `{ "optionIndex": 0 }`

### 3.9 Add Comment
* **Method:** `POST`
* **URL:** `/api/posts/:id/comments`
* **Auth:** Required
* **Body (JSON):** `{ "text": "Great insights!" }`

### 3.10 Add Threaded Reply (Level 2)
* **Method:** `POST`
* **URL:** `/api/posts/:id/comments/:commentId/replies`
* **Auth:** Required
* **Body (JSON):** `{ "text": "Agreed, thanks for elaborating!" }`

### 3.11 Delete Comment or Reply
* **Method:** `DELETE`
* **URL:** `/api/posts/:id/comments/:commentId`
* **Auth:** Required (Comment author, Post author, or Moderator/Admin)

### 3.12 Toggle Comment Like
* **Method:** `POST`
* **URL:** `/api/posts/:id/comments/:commentId/like`
* **Auth:** Required

### 3.13 Get Saved Posts
* **Method:** `GET`
* **URL:** `/api/posts/saved/me?page=1&limit=10`
* **Auth:** Required

---

## 4. Explore, Trending & Global Search (`/api/explore`)

### 4.1 Get Trending Posts
* **Method:** `GET`
* **URL:** `/api/explore/trending?page=1&limit=10`

### 4.2 Get Trending Hashtags
* **Method:** `GET`
* **URL:** `/api/explore/hashtags?limit=10`
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      { "tag": "react", "count": 28, "totalEngagement": 1240 },
      { "tag": "nodejs", "count": 19, "totalEngagement": 820 }
    ]
  }
  ```

### 4.3 Get Posts by Hashtag
* **Method:** `GET`
* **URL:** `/api/explore/hashtags/:tag?page=1&limit=10`

### 4.4 Global Server-Side Search
* **Method:** `GET`
* **URL:** `/api/explore/search?q=javascript`
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "users": [ ... ],
      "posts": [ ... ],
      "hashtags": [ ... ]
    }
  }
  ```

---

## 5. Notifications Center (`/api/notifications`)

### 5.1 Get User Notifications
* **Method:** `GET`
* **URL:** `/api/notifications?page=1&limit=20`
* **Auth:** Required

### 5.2 Get Unread Notifications Count
* **Method:** `GET`
* **URL:** `/api/notifications/unread-count`
* **Auth:** Required

### 5.3 Mark Single Notification as Read
* **Method:** `PATCH`
* **URL:** `/api/notifications/:id/read`
* **Auth:** Required

### 5.4 Mark All Notifications as Read
* **Method:** `PATCH`
* **URL:** `/api/notifications/read-all`
* **Auth:** Required

---

## 6. Safety & Moderation Reports (`/api/reports`)

### 6.1 Submit Report
* **Method:** `POST`
* **URL:** `/api/reports`
* **Auth:** Required
* **Body (JSON):**
  ```json
  {
    "targetType": "POST",
    "targetId": "60d0fe4f5311236168a109ca",
    "reason": "SPAM",
    "details": "Repetitive promotional messages"
  }
  ```

### 6.2 Get Reports List (Moderator / Admin)
* **Method:** `GET`
* **URL:** `/api/reports?page=1&limit=20&status=PENDING`
* **Auth:** Required (Admin or Moderator role)

### 6.3 Update Report Status
* **Method:** `PATCH`
* **URL:** `/api/reports/:id/status`
* **Auth:** Required (Admin or Moderator role)
* **Body (JSON):** `{ "status": "RESOLVED" }`

---

## 7. Administrator Controls (`/api/admin`)

*All admin endpoints require `role: admin` or `moderator`.*

### 7.1 Platform Statistics
* **Method:** `GET`
* **URL:** `/api/admin/stats`

### 7.2 Manage Users
* **Method:** `GET`
* **URL:** `/api/admin/users?page=1&limit=20&search=john`

### 7.3 Suspend / Restore User
* **Method:** `PATCH`
* **URL:** `/api/admin/users/:id/suspend`

### 7.4 Change User Role
* **Method:** `PATCH`
* **URL:** `/api/admin/users/:id/role`
* **Body (JSON):** `{ "role": "moderator" }`

### 7.5 Moderation Remove Post
* **Method:** `DELETE`
* **URL:** `/api/admin/posts/:id`

---

## 8. Creator Analytics (`/api/analytics`)

### 8.1 Get Creator Dashboard Analytics
* **Method:** `GET`
* **URL:** `/api/analytics/me`
* **Auth:** Required
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "followersCount": 42,
      "followingCount": 18,
      "totalPosts": 15,
      "totalLikes": 120,
      "totalComments": 45,
      "totalSaves": 12,
      "engagementRate": 11.8,
      "breakdown": { "text": 8, "image": 5, "poll": 1, "link": 1 },
      "topPosts": [ ... ],
      "timeline": [ ... ]
    }
  }
  ```

---

## 9. Health & System Observability (`/api/health`)

### 9.1 Service Health Check
* **Method:** `GET`
* **URL:** `/api/health`
* **Response (200 OK):**
  ```json
  {
    "status": "ok",
    "service": "posthub-api",
    "version": "2.0.0",
    "timestamp": "2026-09-06T11:15:00.000Z",
    "uptime": 124.52
  }
  ```
