import React from "react";

export default function PostSkeleton() {
  return (
    <div className="post-card skeleton-card">
      <div className="post-card-header">
        <div className="d-flex align-items-center gap-3">
          <div className="skeleton skeleton-avatar" />
          <div style={{ width: 140 }}>
            <div className="skeleton skeleton-text" style={{ width: "80%", height: 14, marginBottom: 6 }} />
            <div className="skeleton skeleton-text" style={{ width: "50%", height: 10 }} />
          </div>
        </div>
      </div>

      <div className="post-card-body">
        <div className="skeleton skeleton-text" style={{ width: "60%", height: 16, marginBottom: 12 }} />
        <div className="skeleton skeleton-text" style={{ width: "100%", height: 12, marginBottom: 6 }} />
        <div className="skeleton skeleton-text" style={{ width: "90%", height: 12, marginBottom: 6 }} />
        <div className="skeleton skeleton-text" style={{ width: "70%", height: 12, marginBottom: 16 }} />
        <div className="skeleton skeleton-image" />
      </div>

      <div className="post-card-footer d-flex justify-content-between">
        <div className="d-flex gap-3">
          <div className="skeleton skeleton-btn" />
          <div className="skeleton skeleton-btn" />
        </div>
      </div>
    </div>
  );
}
