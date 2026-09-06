# PostHub 3.0 — Frontend Performance & Optimization Guide

## 1. Overview
High perceived performance is critical for social platforms. PostHub 3.0 uses targeted optimizations across route loading, component lifecycle, asset management, and network communication without bloated abstractions.

---

## 2. Route-Level Code Splitting & Lazy Loading

All secondary routes are dynamically loaded via `React.lazy()` and wrapped inside a centralized `Suspense` boundary in `App.jsx`.

```jsx
// Eagerly bundled for instantaneous boot
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// Code-split route chunks loaded on-demand
const Dashboard = lazy(() => import("./pages/Dashboard"));
const CreatePost = lazy(() => import("./pages/CreatePost"));
const EditPost = lazy(() => import("./pages/EditPost"));
const Profile = lazy(() => import("./pages/Profile"));
const Explore = lazy(() => import("./pages/Explore"));
const Notifications = lazy(() => import("./pages/Notifications"));
const SavedPosts = lazy(() => import("./pages/SavedPosts"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Admin = lazy(() => import("./pages/Admin"));
const Settings = lazy(() => import("./pages/Settings"));
```

### Production Bundle Impact
Running `npm run build` yields isolated, cacheable chunks:
- `Dashboard`: 13.72 kB (4.11 kB gzip)
- `PostCard`: 17.56 kB (5.50 kB gzip)
- `Explore`: 8.20 kB (2.73 kB gzip)
- `Notifications`: 5.76 kB (2.23 kB gzip)
- `Analytics`: 11.56 kB (3.00 kB gzip)
- `Admin`: 12.06 kB (3.49 kB gzip)
- `Settings`: 13.50 kB (3.31 kB gzip)
Initial application entry chunk is kept lightweight (~113 kB gzip for entire React 19 + Bootstrap + Router core).

---

## 3. Network & API Request Strategy

### 3.1 Debounced Search Execution
Both Global Search in `Navbar.jsx` and Explore Search in `Explore.jsx` implement a **350ms trailing debounce timer**:
- Prevents redundant backend search queries per keystroke.
- Cancels previous pending timeouts via `useRef` cleanup.
- Trims whitespace and enforces minimum query length.

### 3.2 Singleton Axios Instance with Automatic Refresh Queuing
Instead of instantiating Axios repeatedly:
- All services share `src/services/api.js`.
- An automatic 401 interceptor queues concurrent requests (`failedQueue`) during active token refresh so that multiple components (e.g. Feed, Sidebar, Widgets) firing simultaneously do not issue redundant `/auth/refresh` calls.

### 3.3 Optimistic UI Mutations
Social actions (Like, Bookmark/Save, Follow) update local state immediately:
```javascript
// Optimistic Like
const prevLiked = liked;
const prevCount = likesCount;
setLiked(!prevLiked);
setLikesCount(prevCount + (!prevLiked ? 1 : -1));

try {
  const res = await toggleLike(post._id);
  // Reconcile with authoritative backend count
  setLikesCount(res.data.data.likesCount);
} catch (err) {
  // Rollback on network failure
  setLiked(prevLiked);
  setLikesCount(prevCount);
  showToast("Failed to update like", "danger");
}
```

---

## 4. Rendering Considerations & Layout Shift Prevention

### 4.1 Skeleton Placeholders
To eliminate layout shifts (CLS):
- `PostSkeleton`: Mimics avatar, header, text lines, and action bar.
- `ProfileSkeleton`: Preserves exact 220px cover height and 110px negative-margin avatar geometry.
- `NotificationSkeleton`: Renders exact list item row heights.
- `AnalyticsSkeleton`: Maintains 4-column KPI grid and dual-card dimensions.

### 4.2 Image Optimization & Lightbox
- Media images employ `loading="lazy"` to defer offscreen image fetching until near the viewport.
- Images render inside an aspect-ratio preserving container with `object-fit: cover` and `max-height: 450px`.
- High-resolution modal preview is instantiated only upon user click.

---

## 5. Memory Management & Cleanup
- Object URLs generated for post composer image previews (`URL.createObjectURL(file)`) are explicitly revoked via `URL.revokeObjectURL(url)` on image removal or modal unmount to prevent browser memory leaks.
- All `useEffect` hooks with polling or debouncing cleanly release active timeouts (`clearTimeout`) and set unmount cancellation flags.
