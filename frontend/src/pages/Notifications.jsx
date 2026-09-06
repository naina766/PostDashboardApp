import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  FiCheck,
  FiCheckCircle 
} from "react-icons/fi";
import { getNotifications, markAsRead, markAllAsRead } from "../services/notifications";
import { formatTimeAgo } from "../utils/timeAgo";
import { useToast } from "../context/ToastContext";
import NotificationSkeleton from "../components/NotificationSkeleton";
import EmptyState from "../components/EmptyState";

export default function Notifications() {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getNotifications({ page: 1, limit: 50 });
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

  // Group notifications into Today, Yesterday, and Earlier
  const groupedNotifications = useMemo(() => {
    const today = [];
    const yesterday = [];
    const earlier = [];

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);

    notifications.forEach((item) => {
      const itemDate = new Date(item.createdAt);
      if (itemDate >= startOfToday) {
        today.push(item);
      } else if (itemDate >= startOfYesterday) {
        yesterday.push(item);
      } else {
        earlier.push(item);
      }
    });

    return [
      { label: "Today", items: today },
      { label: "Yesterday", items: yesterday },
      { label: "Earlier", items: earlier },
    ].filter((group) => group.items.length > 0);
  }, [notifications]);

  const hasUnread = notifications.some((n) => !n.read);

  const renderNotificationItem = (n) => {
    const actor = n.actor || { name: "Someone", username: "user" };
    const post = n.post;

    return (
      <div
        key={n._id}
        className={`list-group-item list-group-item-action p-3 d-flex align-items-center justify-content-between gap-3 border-0 border-bottom ${
          !n.read ? "bg-primary-subtle" : ""
        }`}
        onClick={() => !n.read && handleMarkAsRead(n._id)}
        style={{ cursor: "pointer", transition: "background-color 0.2s ease" }}
      >
        <div className="d-flex align-items-center gap-3">
          <div className="notification-icon-wrapper rounded-circle p-2 bg-body d-flex align-items-center justify-content-center shadow-sm">
            {getIconForType(n.type)}
          </div>

          <Link to={`/profile/${actor.username}`} className="text-decoration-none" onClick={(e) => e.stopPropagation()}>
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
              <Link
                to={`/profile/${actor.username}`}
                className="fw-bold text-body text-decoration-none hover-underline"
                onClick={(e) => e.stopPropagation()}
              >
                {actor.name}
              </Link>{" "}
              <span className="text-muted">{n.message || "interacted with you"}</span>
              {post && (
                <Link
                  to={`/dashboard#${post._id}`}
                  className="text-primary text-decoration-none ms-1 fw-medium"
                  onClick={(e) => e.stopPropagation()}
                >
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
          <Badge bg="primary" pill className="p-1" title="Unread">
            {" "}
          </Badge>
        )}
      </div>
    );
  };

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
          <div>
            <NotificationSkeleton />
            <NotificationSkeleton />
            <NotificationSkeleton />
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            title="All caught up!"
            message="You don't have any notifications right now. When someone interacts with your posts, you will see it here."
            actionText="Browse Feed"
            actionLink="/dashboard"
          />
        ) : (
          <div className="d-flex flex-column gap-3">
            {groupedNotifications.map((group) => (
              <div key={group.label} className="notification-group">
                <div className="d-flex align-items-center justify-content-between px-2 mb-2">
                  <h6 className="fw-bold text-muted text-uppercase mb-0" style={{ fontSize: "12px", letterSpacing: "0.5px" }}>
                    {group.label}
                  </h6>
                  <span className="badge bg-secondary-subtle text-secondary small rounded-pill">
                    {group.items.length}
                  </span>
                </div>
                <div className="list-group rounded-4 border shadow-sm overflow-hidden bg-card">
                  {group.items.map(renderNotificationItem)}
                </div>
              </div>
            ))}

            <div className="text-center py-3 text-muted small d-flex align-items-center justify-content-center gap-1">
              <FiCheckCircle size={14} className="text-success" /> You're up to date with your activity.
            </div>
          </div>
        )}
      </Container>
    </main>
  );
}
