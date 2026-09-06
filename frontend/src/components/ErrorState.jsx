import React from "react";
import { Button } from "react-bootstrap";
import { FiAlertCircle, FiRefreshCw } from "react-icons/fi";

export default function ErrorState({
  title = "Something went wrong",
  message = "We encountered an issue loading this content. Please try again.",
  onRetry = null,
  compact = false,
}) {
  return (
    <div className={`ph-error-state text-center ${compact ? "py-3 px-2" : "py-5 px-3"}`} role="alert">
      <div
        className="ph-error-icon-wrapper rounded-circle bg-danger-subtle text-danger mx-auto mb-3 d-flex align-items-center justify-content-center"
        style={{ width: compact ? "44px" : "56px", height: compact ? "44px" : "56px" }}
      >
        <FiAlertCircle size={compact ? 22 : 28} />
      </div>
      <h5 className={`fw-bold text-body ${compact ? "fs-6 mb-1" : "mb-2"}`}>{title}</h5>
      <p className="text-muted small mx-auto mb-3" style={{ maxWidth: "420px" }}>
        {message}
      </p>
      {onRetry && (
        <Button
          variant="outline-primary"
          size="sm"
          onClick={onRetry}
          className="d-inline-flex align-items-center gap-1.5 rounded-pill px-3 py-1.5"
        >
          <FiRefreshCw size={14} /> Try Again
        </Button>
      )}
    </div>
  );
}
