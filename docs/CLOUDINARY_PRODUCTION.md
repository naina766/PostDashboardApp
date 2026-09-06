# PostHub 4.0 — Cloudinary Production Media Architecture

## 1. Architecture & Upload Pipeline
PostHub uses **Cloudinary** for scalable image storage and CDN delivery. Media credentials (`CLOUDINARY_API_SECRET`, `CLOUDINARY_API_KEY`) remain strictly server-side.

```
Client (React 19)                   Express 5 Server                 Cloudinary CDN
       |                                   |                               |
       |--- POST /api/posts (multipart) -->|                               |
       |    [File buffer + form data]      |--- Validate MIME & 5MB cap    |
       |                                   |--- Stream upload via SDK ---->|
       |                                   |<-- Return secure_url ---------|
       |                                   |--- Save secure_url to Mongo   |
       |<-- 201 Created { post } ----------|                               |
       |                                                                   |
[Image Fetch via CDN]                                                      |
       |------------------------ GET transformed CDN URL ----------------->|
       |<----------------------- Optimized WebP/AVIF Image ----------------|
```

---

## 2. Media Security & Upload Enforcements
1. **File Type Whitelist**: Only `image/jpeg`, `image/png`, and `image/webp` are permitted. Executables, scripts, and SVG vectors are rejected to eliminate SVG-based stored XSS.
2. **File Size Capping**: Maximum **5 MB** per image enforced by Multer in `backend/src/middlewares/upload.middleware.js`.
3. **Multi-Image Limits**: Maximum 4 images per post.
4. **Folder Isolation**: Assets are uploaded into a designated `posthub/` folder in Cloudinary.

---

## 3. Frontend Image Performance & CDN Transformations
To avoid fetching multi-megabyte raw photos into compact feed cards:
- **Automatic Format**: `f_auto` delivers next-gen WebP or AVIF formats supported by the client browser.
- **Automatic Quality**: `q_auto:eco` or `q_auto:good` applies perceptual compression saving 40-60% bandwidth.
- **Responsive Thumbnails**:
  - Feed cards: `w_720,c_limit,q_auto,f_auto`
  - User Avatars: `w_150,h_150,c_fill,g_face,q_auto,f_auto`
- **Cumulative Layout Shift (CLS) Prevention**: Images load inside bounded aspect-ratio containers with `loading="lazy"`.
