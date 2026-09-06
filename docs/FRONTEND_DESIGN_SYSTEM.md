# PostHub 3.0 — Frontend Design System

## 1. Overview & Philosophy
The PostHub 3.0 visual design system is designed to provide a cohesive, premium, high-density social community experience. Built on top of **React 19 + Bootstrap 5 + React-Bootstrap + Semantic CSS Custom Properties (Tokens)**, the design system avoids generic framework presets and maintains an original aesthetic with seamless Light and Dark theme parity.

---

## 2. Design Tokens (`--ph-*`)

All global tokens are scoped in `frontend/src/styles/main.css` under `:root` and `[data-bs-theme="dark"]`.

### 2.1 Surfaces & Backgrounds
| Token | Light Theme | Dark Theme | Purpose |
| :--- | :--- | :--- | :--- |
| `--ph-bg` | `#f8f9fa` | `#0f172a` | Core application viewport background |
| `--ph-surface` | `#ffffff` | `#1e293b` | Primary card, modal, and panel background |
| `--ph-surface-elevated` | `#ffffff` | `#334155` | Elevated popovers, dropdowns, and flyouts |
| `--ph-surface-hover` | `#f1f5f9` | `#2d3748` | Interactive surface hover highlight |
| `--ph-border` | `#e2e8f0` | `#334155` | Card borders, dividers, tab boundaries |

### 2.2 Typography & Text Colors
| Token | Light Theme | Dark Theme | Purpose |
| :--- | :--- | :--- | :--- |
| `--ph-text` | `#0f172a` | `#f8fafc` | Primary high-contrast reading text |
| `--ph-text-secondary` | `#475569` | `#cbd5e1` | Secondary headings, metadata titles |
| `--ph-text-muted` | `#64748b` | `#94a3b8` | Timestamps, counters, subtle hints |
| Font Stack | `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` | Clean, modern sans-serif |

### 2.3 Brand & State Accents
| Token | Value | Semantic Role |
| :--- | :--- | :--- |
| `--ph-primary` | `#6366f1` (Indigo) | Core brand color, active navigation, primary CTA |
| `--ph-primary-hover` | `#4f46e5` | Primary button hover / focus |
| `--ph-accent` | `#8b5cf6` (Purple) | Gradient accents, special badges, brand glows |
| `--ph-success` | `#10b981` (Emerald) | Verified checks, success toasts, resolved indicators |
| `--ph-warning` | `#f59e0b` (Amber) | Role badges, pending reports, attention alerts |
| `--ph-danger` | `#ef4444` (Rose) | Like fill, delete buttons, destructive modal confirmations |

### 2.4 Elevation & Shadows
- `--ph-shadow-sm`: `0 1px 2px 0 rgba(0, 0, 0, 0.05)`
- `--ph-shadow-md`: `0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.04)`
- `--ph-shadow-lg`: `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.05)`

### 2.5 Radii
- `--ph-radius-sm`: `6px` (badges, small tags)
- `--ph-radius-md`: `10px` (inputs, buttons)
- `--ph-radius-lg`: `16px` (feed cards, sidebar panels)
- `--ph-radius-full`: `9999px` (avatars, pill buttons, floating badges)

---

## 3. Responsive Breakpoints & Shell Architecture

PostHub 3.0 adopts an adaptive 3-column desktop shell and a mobile-first bottom bar.

```
+-------------------------------------------------------------------------------+
|  NAVBAR (Sticky 60px, Backdrop Blur 12px) - Brand | Search | Actions | Theme  |
+-------------------------------------------------------------------------------+
|  DESKTOP (>= 1200px):                                                         |
|  [Left Sidebar: 3-col]   |   [Center Feed: 6-col]    |  [Right Widgets: 3-col]|
|  - Navigation Links      |   - Post Composer Bar     |  - Trending Topics     |
|  - Profile & Saved       |   - Underline Feed Tabs   |  - Suggested Creators  |
|  - Settings & Admin      |   - Post Cards Stream     |  - Telemetry Stats     |
|  - Create Post CTA       |   - Infinite Load More    |                        |
+-------------------------------------------------------------------------------+
|  MOBILE (< 992px):                                                            |
|  [Full-width Feed Stream (12-col)]                                            |
|  [Sticky Bottom Navigation Bar]                                               |
|  - Home Feed | Explore | Create (+) | Alerts (live badge) | Profile           |
+-------------------------------------------------------------------------------+
```

### Breakpoint Specs:
- **Mobile (< 768px)**: 1 column full width, fixed bottom navigation bar (touch target >= 44px).
- **Tablet (768px - 991px)**: 1 column centered (`max-width: 720px`).
- **Desktop (992px - 1199px)**: 2 columns (Left Sidebar + Center Stream).
- **Wide Desktop (>= 1200px)**: 3 columns (Left Sidebar + Center Stream + Right Widgets).

---

## 4. Component Patterns

### 4.1 Post Card (`PostCard.jsx`)
1. **Explainable Discovery Pill**: Rendered at top when `discoveryReason` exists (`"Because you follow this creator"`, `"Trending in #javascript"`).
2. **Author Header**: 42px avatar, author display name, verified check (`FiCheckCircle`), role pill, relative timestamp (`formatTimeAgo`).
3. **Content Block**: Clean typography with automated "Read more" / "Show less" toggle for content > 300 characters.
4. **Interactive Media Grid**: Aspect-ratio preserving container with `loading="lazy"` and lightbox expand.
5. **Poll Component**: Progress bars indicating percentage with optimistic single-choice vote toggle.
6. **Engagement Action Bar**: Optimistic Like heart-pop, comment drawer toggle, save bookmark, native share with clipboard fallback.
7. **Nested Comments**: Two-level indentation with author badges, inline reply composer, and comment deletion.

### 4.2 State Components
- **Loading**: `PostSkeleton`, `ProfileSkeleton`, `NotificationSkeleton`, `AnalyticsSkeleton` prevent Cumulative Layout Shift (CLS).
- **Empty States**: Reusable `EmptyState.jsx` with contextual illustration icon, actionable title, explanatory text, and dynamic CTA button.
- **Error States**: Reusable `ErrorState.jsx` with retry triggers and user-friendly error copy.

---

## 5. Accessibility (A11y) Rules
1. **Touch Targets**: All interactive buttons, nav links, and dropdown toggles exceed 44x44px hit bounds on touch devices.
2. **Keyboard Navigation**: Form inputs, buttons, and custom tab triggers support standard `Tab`, `Enter`, and `Space` keyboard activation.
3. **Screen Readers**: Skeletons use `aria-busy="true"` and `aria-label`; image elements include descriptive `alt` text or `aria-hidden="true"` placeholders.
4. **Color Contrast**: All text satisfies WCAG AA contrast ratio (> 4.5:1 against respective surface tokens).

---

## 6. Animation & Micro-Interactions
- **Strict Motion Budget**: All interactive micro-interactions complete in **under 300ms** (`transition: all 0.2s ease-in-out`).
- **Heart Pop**: 350ms keyframe spring animation on like toggle (`@keyframes heartPop`).
- **Prefers-Reduced-Motion**: Explicit media query disables transforms and transitions when users enable reduced motion preferences in OS settings.
