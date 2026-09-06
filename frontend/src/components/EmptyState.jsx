import React from "react";
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";
import { FiMessageSquare, FiPlusSquare } from "react-icons/fi";

export default function EmptyState({
  title = "No posts yet",
  description = "Be the first person to share something!",
  actionText = "Create a Post",
  actionLink = "/create-post",
  onAction = null,
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <FiMessageSquare />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-desc">{description}</p>
      {actionLink ? (
        <Button as={Link} to={actionLink} className="btn-primary-custom d-inline-flex align-items-center gap-2">
          <FiPlusSquare /> {actionText}
        </Button>
      ) : onAction ? (
        <Button onClick={onAction} className="btn-primary-custom">
          {actionText}
        </Button>
      ) : null}
    </div>
  );
}
