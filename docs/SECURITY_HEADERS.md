# PostHub 4.0 — Security Headers Specification

## 1. Overview
HTTP response headers are configured using **Helmet** on Express and edge security headers on Vercel/Nginx to safeguard users against cross-site scripting (XSS), clickjacking, MIME sniffing, and unintended cross-origin leaks.

---

## 2. Configured Headers & Policy Matrix

| Header | Production Directive | Threat Mitigated |
| :--- | :--- | :--- |
| **X-Frame-Options** | `DENY` / `SAMEORIGIN` | Clickjacking attacks, preventing malicious framing in `<iframe>`. |
| **X-Content-Type-Options** | `nosniff` | MIME sniffing; forces user agents to respect declared `Content-Type`. |
| **X-XSS-Protection** | `1; mode=block` | Legacy browser reflective XSS filter defense. |
| **Referrer-Policy** | `strict-origin-when-cross-origin` | Strips path and query string when navigating to third-party domains. |
| **Cross-Origin-Resource-Policy** | `cross-origin` | Permits media and avatar delivery across subdomains. |
| **Cross-Origin-Embedder-Policy** | `credentialless` / disabled | Allows Cloudinary media embedding without blocking resources. |
| **Strict-Transport-Security** | `max-age=31536000; includeSubDomains` | Enforces HTTPS on production edge (Vercel & Render automated SSL). |

---

## 3. Content Security Policy (CSP) Architecture
Because PostHub serves dynamic Cloudinary assets, avatars, and Google WebFonts:
- CSP is enforced on the reverse proxy / edge layer (Vercel and Nginx) rather than blindly injected by Express, avoiding conflicts with dynamic hot module reloading or external CDN asset delivery.
- **Directives:**
  ```text
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: blob: https://res.cloudinary.com;
  connect-src 'self' https://*.onrender.com http://localhost:*;
  ```
