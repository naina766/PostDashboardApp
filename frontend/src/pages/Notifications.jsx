import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Container, Button, Badge } from "react-bootstrap";
import { 
  FiBell, 
  FiHeart, 
  FiMessageSquare, 
  FiUserPlus, 
  FiCornerDownRight, 
  FiAtSign, 
  FiBookmark, 
  FiCheck 
} from "react-icons/fi";
import { getNotifications, markAsRead, markAllAsRead } from "../services/notifications";
import { formatTimeAgo } from "../utils/timeAgo";
import { useToast } from "../context/ToastContext";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";

export default function Notifications() {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getNotifications({ page: 1, limit: 30 });
      setNotifications(res.data?.data?.notifications || []);
    } catch {
      showToast("Failed to load notifications.", "danger");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch {
      // Ignore
    }
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAll(true);
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      showToast("All notifications marked as read.", "success", 2000);
    } catch {
      showToast("Failed to update notifications.", "danger");
    } finally {
      setMarkingAll(false);
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case "LIKE":
        return <FiHeart className="text-danger" size={16} />;
      case "COMMENT":
        return <FiMessageSquare className="text-primary" size={16} />;
      case "REPLY":
        return <FiCornerDownRight className="text-info" size={16} />;
      case "FOLLOW":
        return <FiUserPlus className="text-success" size={16} />;
      case "MENTION":
        return <FiAtSign className="text-warning" size={16} />;
      case "SAVE":
        return <FiBookmark className="text-warning" size={16} />;
      default:
        return <FiBell className="text-secondary" size={16} />;
    }
  };

  const hasUnread = notifications.some((n) => !n.read);

  return (
    <main className="notifications-page py-4">
      <Container style={{ maxWidth: "680px" }}>
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h4 className="fw-bold mb-0 d-flex align-items-center gap-2">
              <FiBell /> Notifications
            </h4>
            <span className="text-muted small">Stay updated on your content and network</span>
          </div>

          {hasUnread && (
            <Button
              variant="outline-primary"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={markingAll}
              className="d-flex align-items-center gap-1 rounded-pill px-3"
            >
              <FiCheck /> Mark all as read
            </Button>
          )}
        </div>

        {loading ? (
          <LoadingSpinner message="Loading notifications..." />
        ) : notifications.length === 0 ? (
          <EmptyState
            title="All caught up!"
            description="You don't have any notifications right now. When someone interacts with your posts, you will see it here."
            actionText="Browse Feed"
            actionLink="/dashboard"
          />
        ) : (
          <div className="list-group rounded-4 border shadow-sm overflow-hidden">
            {notifications.map((n) => {
              const actor = n.actor || { name: "Someone", username: "user" };
              const post = n.post;

              return (
                <div
                  key={n._id}
                  className={`list-group-item list-group-item-action p-3 d-flex align-items-center justify-content-between gap-3 ${!n.read ? "bg-primary-subtle" : ""}`}
                  onClick={() => !n.read && handleMarkAsRead(n._id)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <div className="notification-icon-wrapper rounded-circle p-2 bg-body d-flex align-items-center justify-content-center shadow-sm">
                      {getIconForType(n.type)}
                    </div>

                    <Link to={`/profile/${actor.username}`} className="text-decoration-none">
                      {actor.avatar ? (
                        <img
                          src={actor.avatar}
                          alt={actor.name}
                          className="rounded-circle object-fit-cover"
                          style={{ width: 40, height: 40 }}
                        />
                      ) : (
                        <div
                          className="avatar-placeholder rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold small"
                          style={{ width: 40, height: 40 }}
                        >
                          {(actor.name || "U")[0].toUpperCase()}
                        </div>
                      )}
                    </Link>

                    <div>
                      <div className="small">
                        <Link to={`/profile/${actor.username}`} className="fw-bold text-body text-decoration-none">
                          {actor.name}
                        </Link>{" "}
                        <span className="text-muted">{n.message || "interacted with you"}</span>
                        {post && (
                          <Link to={`/dashboard#${post._id}`} className="text-primary text-decoration-none ms-1">
                            "{post.title ? post.title.slice(0, 30) : post.content?.slice(0, 30)}..."
                          </Link>
                        )}
                      </div>
                      <span className="text-muted small" style={{ fontSize: "11px" }}>
                        {formatTimeAgo(n.createdAt)}
                      </span>
                    </div>
                  </div>

                  {!n.read && (
                    <Badge bg="primary" pill className="p-1">
                      {" "}
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Container>
    </main>
  );
}
