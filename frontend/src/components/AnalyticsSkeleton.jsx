import React from "react";
import { Row, Col, Card } from "react-bootstrap";

export default function AnalyticsSkeleton() {
  return (
    <div className="analytics-skeleton" aria-busy="true" aria-label="Loading creator analytics">
      <Row className="g-3 mb-4">
        {[1, 2, 3, 4].map((i) => (
          <Col xs={6} md={3} key={i}>
            <Card className="p-3 border shadow-sm text-center bg-card">
              <div
                className="ph-skeleton rounded mx-auto mb-2"
                style={{ width: "60px", height: "14px" }}
              />
              <div
                className="ph-skeleton rounded mx-auto"
                style={{ width: "45px", height: "28px" }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="g-3 mb-4">
        <Col md={6}>
          <Card className="p-4 border shadow-sm h-100 bg-card">
            <div
              className="ph-skeleton rounded mb-3"
              style={{ width: "120px", height: "18px" }}
            />
            <div className="d-flex flex-column gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  <div
                    className="ph-skeleton rounded mb-1"
                    style={{ width: "80px", height: "12px" }}
                  />
                  <div
                    className="ph-skeleton rounded"
                    style={{ width: "100%", height: "10px" }}
                  />
                </div>
              ))}
            </div>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="p-4 border shadow-sm h-100 bg-card">
            <div
              className="ph-skeleton rounded mb-3"
              style={{ width: "140px", height: "18px" }}
            />
            <div className="d-flex flex-column gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="ph-skeleton rounded"
                  style={{ width: "100%", height: "36px" }}
                />
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
