import React from "react";
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";
import { FiMessageSquare, FiPlusSquare } from "react-icons/fi";

export default function EmptyState({
  icon = null,
  title = "No posts yet",
  description = "",
  message = "",
  actionText = "Create a Post",
  actionLink = "/create-post",
  onAction = null,
  compact = false,
}) {
  const desc = description || message || "Be the first person to share something!";
  const showLink = typeof actionLink === "string" && actionLink.length > 0;

  return (
    <div className={`empty-state ${compact ? "empty-state-compact" : ""}`}>
      <div className="empty-state-icon" aria-hidden="true">
        {icon || <FiMessageSquare />}
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-desc">{desc}</p>
      {showLink ? (
        <Button
          as={Link}
          to={actionLink}
          size={compact ? "sm" : undefined}
          className="btn-primary-custom d-inline-flex align-items-center gap-2"
        >
          <FiPlusSquare aria-hidden="true" /> {actionText}
        </Button>
      ) : onAction ? (
        <Button onClick={onAction} size={compact ? "sm" : undefined} className="btn-primary-custom">
          {actionText}
        </Button>
      ) : null}
    </div>
  );
}
