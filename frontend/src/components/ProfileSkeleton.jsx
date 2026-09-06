import React from "react";
import { Card, Placeholder } from "react-bootstrap";

export default function ProfileSkeleton() {
  return (
    <div className="ph-profile-skeleton">
      {/* Cover Skeleton */}
      <div className="skeleton-box w-100 rounded-top-4" style={{ height: "200px" }} />

      {/* Profile Header Box */}
      <Card className="border-0 shadow-sm rounded-bottom-4 p-4 mb-4 bg-card">
        <div className="d-flex justify-content-between align-items-end mb-3" style={{ marginTop: "-60px" }}>
          <div
            className="skeleton-box rounded-circle border border-4 border-white"
            style={{ width: "110px", height: "110px" }}
          />
          <Placeholder.Button variant="secondary" className="rounded-pill" style={{ width: "110px", height: "36px" }} />
        </div>

        <Placeholder as="h4" animation="glow" className="mb-2">
          <Placeholder xs={4} />
        </Placeholder>
        <Placeholder as="p" animation="glow" className="mb-3 text-muted">
          <Placeholder xs={3} />
        </Placeholder>
        <Placeholder as="p" animation="glow" className="mb-3">
          <Placeholder xs={8} /> <Placeholder xs={5} />
        </Placeholder>

        <div className="d-flex gap-4 pt-3 border-top">
          <Placeholder xs={2} />
          <Placeholder xs={2} />
          <Placeholder xs={2} />
        </div>
      </Card>
    </div>
  );
}
