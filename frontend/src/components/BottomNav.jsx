import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { FiHome, FiCompass, FiPlusSquare, FiBell, FiUser } from "react-icons/fi";
import { useUser } from "../context/UserContext";
import { getUnreadCount } from "../services/notifications";

export default function BottomNav() {
  const { user } = useUser();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    let isMounted = true;
    const fetchCount = async () => {
      try {
        const res = await getUnreadCount();
        if (isMounted) {
          setUnreadCount(res.data?.data?.unreadCount || 0);
        }
      } catch {
        // Silently ignore
      }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user, location.pathname]);

  if (!user) return null;

  return (
    <nav 
      className="ph-bottom-nav d-flex d-lg-none position-fixed bottom-0 start-0 w-100 z-3 align-items-center justify-content-around py-2 border-top"
      aria-label="Mobile Bottom Navigation"
    >
      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          `ph-bottom-nav-item d-flex flex-column align-items-center justify-content-center text-decoration-none ${
            isActive ? "active text-primary" : "text-muted"
          }`
        }
        aria-label="Feed"
      >
        <FiHome size={20} />
        <span className="ph-bottom-nav-label">Feed</span>
      </NavLink>

      <NavLink
        to="/explore"
        className={({ isActive }) =>
          `ph-bottom-nav-item d-flex flex-column align-items-center justify-content-center text-decoration-none ${
            isActive ? "active text-primary" : "text-muted"
          }`
        }
        aria-label="Explore"
      >
        <FiCompass size={20} />
        <span className="ph-bottom-nav-label">Explore</span>
      </NavLink>

      <NavLink
        to="/create-post"
        className="ph-bottom-nav-create-btn d-flex align-items-center justify-content-center rounded-circle bg-primary text-white shadow-sm"
        aria-label="Create Post"
      >
        <FiPlusSquare size={22} />
      </NavLink>

      <NavLink
        to="/notifications"
        className={({ isActive }) =>
          `ph-bottom-nav-item position-relative d-flex flex-column align-items-center justify-content-center text-decoration-none ${
            isActive ? "active text-primary" : "text-muted"
          }`
        }
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ""}`}
      >
        <FiBell size={20} />
        {unreadCount > 0 && <span className="ph-bottom-nav-badge-dot"></span>}
        <span className="ph-bottom-nav-label">Alerts</span>
      </NavLink>

      <NavLink
        to={`/profile/${user.username || ""}`}
        className={({ isActive }) =>
          `ph-bottom-nav-item d-flex flex-column align-items-center justify-content-center text-decoration-none ${
            isActive ? "active text-primary" : "text-muted"
          }`
        }
        aria-label="My Profile"
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name || "Profile"}
            className="rounded-circle object-fit-cover"
            style={{ width: "22px", height: "22px" }}
          />
        ) : (
          <FiUser size={20} />
        )}
        <span className="ph-bottom-nav-label">Profile</span>
      </NavLink>
    </nav>
  );
}
