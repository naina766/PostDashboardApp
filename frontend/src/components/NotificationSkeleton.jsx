import React from "react";
import { Card, Placeholder } from "react-bootstrap";

export default function NotificationSkeleton() {
  return (
    <div className="d-flex flex-column gap-2">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="border-0 shadow-sm rounded-3 p-3 bg-card">
          <div className="d-flex align-items-center gap-3">
            <div className="skeleton-box rounded-circle flex-shrink-0" style={{ width: "40px", height: "40px" }} />
            <div className="flex-grow-1">
              <Placeholder as="div" animation="glow" className="mb-1">
                <Placeholder xs={7} />
              </Placeholder>
              <Placeholder as="div" animation="glow">
                <Placeholder xs={3} size="xs" />
              </Placeholder>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
