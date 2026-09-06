import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Navbar, Nav, Container, Button, Badge } from "react-bootstrap";
import { 
  FiShare2, 
  FiFileText, 
  FiCompass,
  FiBookmark,
  FiBell,
  FiBarChart2,
  FiShield,
  FiPlusSquare, 
  FiUser, 
  FiLogOut, 
  FiSun, 
  FiMoon,
  FiSettings,
  FiSearch
} from "react-icons/fi";
import { useUser } from "../context/UserContext";
import { useTheme } from "../context/ThemeContext";
import { getUnreadCount } from "../services/notifications";

export default function AppNavbar() {
  const { user, logout } = useUser();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [navSearch, setNavSearch] = useState("");

  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (navSearch.trim()) {
      navigate(`/explore?q=${encodeURIComponent(navSearch.trim())}`);
      setNavSearch("");
      setExpanded(false);
      setDrawerOpen(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    let isMounted = true;
    const fetchUnread = async () => {
      try {
        const res = await getUnreadCount();
        if (isMounted) {
          setUnreadCount(res.data.data?.unreadCount || 0);
        }
      } catch {
        // Silently ignore
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000); // 30s polling
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user]);

  const handleLogout = () => {
    logout();
    setExpanded(false);
    setDrawerOpen(false);
    navigate("/login");
  };

  const handleNavClick = () => {
    setExpanded(false);
    setDrawerOpen(false);
  };

  const isAdminOrMod = user && ["admin", "moderator"].includes(user.role);

  return (
    <>
      <Navbar 
        expanded={expanded} 
        onToggle={setExpanded} 
        expand="lg" 
        className="posthub-navbar sticky-top"
      >
        <Container fluid="xl">
          <Navbar.Brand as={Link} to="/dashboard" onClick={handleNavClick} className="posthub-brand d-flex align-items-center gap-2">
            <FiShare2 className="brand-icon" />
            <span>PostHub</span>
          </Navbar.Brand>

          {/* Global Search Bar on Desktop (220-280px) */}
          <form onSubmit={handleSearchSubmit} className="nav-search-form d-none d-md-flex align-items-center position-relative ms-2 ms-xl-3 me-2 flex-grow-1" role="search">
            <FiSearch className="position-absolute start-0 ms-3 text-muted pointer-events-none" size={15} />
            <input
              type="search"
              className="form-control nav-search-input"
              placeholder="Search creators, #tags..."
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              aria-label="Global Search"
            />
          </form>

          {/* Mobile Right Controls: Notifications, Theme Toggle, Hamburger Menu */}
          <div className="d-flex align-items-center gap-2 d-lg-none ms-auto">
            {user && (
              <Link to="/notifications" onClick={handleNavClick} className="nav-icon-btn" aria-label="Open notifications" title="Open notifications">
                <FiBell size={18} />
                {unreadCount > 0 && (
                  <span className="badge-notification-dot"></span>
                )}
              </Link>
            )}
            <button
              onClick={toggleTheme}
              className="theme-toggle-btn"
              title={`Switch to ${theme === "light" ? "Dark" : "Light"} mode`}
              aria-label="Toggle theme"
              type="button"
            >
              {theme === "light" ? <FiMoon size={16} /> : <FiSun size={16} />}
            </button>
            <button
              type="button"
              className="nav-icon-btn text-body"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open mobile navigation drawer"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Desktop Global Utility Controls */}
          <div className="d-none d-lg-flex align-items-center gap-2.5 ms-auto">
            {/* Quick Notifications Bell */}
            {user && (
              <Link
                to="/notifications"
                className="nav-icon-btn"
                title="Open notifications"
                aria-label="Open notifications"
              >
                <FiBell size={18} />
                {unreadCount > 0 && (
                  <span className="badge-notification-dot"></span>
                )}
              </Link>
            )}

            {/* Theme Toggle Button (38px compact icon button) */}
            <button
              onClick={toggleTheme}
              className="theme-toggle-btn"
              title={`Switch to ${theme === "light" ? "Dark" : "Light"} mode`}
              aria-label="Toggle theme"
              type="button"
            >
              {theme === "light" ? <FiMoon size={16} /> : <FiSun size={16} />}
            </button>

            {user ? (
              <>
                <Button
                  as={Link}
                  to="/create-post"
                  className="nav-create-btn text-nowrap"
                  title="Create a new post"
                  aria-label="Create post"
                >
                  <FiPlusSquare size={15} />
                  <span>Create Post</span>
                </Button>

                <Link
                  to={`/profile/${user.username || ""}`}
                  className="d-flex align-items-center gap-2 user-nav-profile-pill text-decoration-none text-body text-nowrap"
                  title="View profile"
                  aria-label="View profile"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="rounded-circle object-fit-cover"
                      style={{ width: "34px", height: "34px" }}
                    />
                  ) : (
                    <div
                      className="post-author-avatar rounded-circle d-flex align-items-center justify-content-center fw-bold"
                      style={{ width: "34px", height: "34px", fontSize: "14px" }}
                    >
                      {user.name ? user.name[0].toUpperCase() : "U"}
                    </div>
                  )}
                  <span className="d-none d-xl-inline small fw-semibold text-truncate" style={{ maxWidth: 110 }}>
                    {user.name?.split(" ")[0]}
                  </span>
                </Link>

                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={handleLogout}
                  className="nav-icon-btn border-0"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <FiLogOut size={16} />
                </Button>
              </>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Button
                  as={Link}
                  to="/login"
                  variant="outline-primary"
                  size="sm"
                  className="rounded-pill px-3 text-nowrap"
                >
                  Log In
                </Button>
                <Button
                  as={Link}
                  to="/signup"
                  variant="primary"
                  size="sm"
                  className="btn-primary-custom rounded-pill px-3 text-nowrap"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </Container>
      </Navbar>

      {/* Mobile Navigation Slide Drawer (Section 38: 200ms slide with backdrop) */}
      <div 
        className={`mobile-drawer-overlay ${drawerOpen ? "open" : ""}`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden={!drawerOpen}
      />
      <aside 
        className={`mobile-drawer ${drawerOpen ? "open" : ""}`}
        aria-label="Mobile navigation drawer"
        aria-hidden={!drawerOpen}
      >
        <div className="mobile-drawer-header">
          <div className="d-flex align-items-center gap-2 fw-bold text-primary fs-5">
            <FiShare2 /> PostHub
          </div>
          <button
            type="button"
            className="btn btn-sm text-muted p-1 border-0"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close navigation drawer"
          >
            ✕
          </button>
        </div>

        <div className="mobile-drawer-body">
          {user && (
            <Link
              to={`/profile/${user.username || ""}`}
              onClick={handleNavClick}
              className="d-flex align-items-center gap-2.5 p-2 rounded-3 text-decoration-none text-body bg-body-secondary mb-2"
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="rounded-circle object-fit-cover"
                  style={{ width: 38, height: 38 }}
                />
              ) : (
                <div
                  className="post-author-avatar rounded-circle flex-shrink-0"
                  style={{ width: 38, height: 38, fontSize: "0.95rem" }}
                  aria-hidden="true"
                >
                  {(user.name || "U").charAt(0).toUpperCase()}
                </div>
              )}
              <div className="overflow-hidden">
                <div className="fw-semibold text-truncate small">{user.name}</div>
                <div className="text-muted text-truncate" style={{ fontSize: "0.75rem" }}>
                  @{user.username}
                </div>
              </div>
            </Link>
          )}

          <NavLink
            to="/dashboard"
            onClick={handleNavClick}
            className={({ isActive }) => `mobile-drawer-link ${isActive ? "active" : ""}`}
          >
            <FiFileText size={18} /> <span>Home Feed</span>
          </NavLink>

          <NavLink
            to="/explore"
            onClick={handleNavClick}
            className={({ isActive }) => `mobile-drawer-link ${isActive ? "active" : ""}`}
          >
            <FiCompass size={18} /> <span>Explore</span>
          </NavLink>

          <NavLink
            to="/notifications"
            onClick={handleNavClick}
            className={({ isActive }) => `mobile-drawer-link ${isActive ? "active" : ""}`}
          >
            <FiBell size={18} /> <span>Notifications</span>
            {unreadCount > 0 && (
              <Badge bg="danger" pill className="ms-auto">
                {unreadCount}
              </Badge>
            )}
          </NavLink>

          <NavLink
            to="/saved"
            onClick={handleNavClick}
            className={({ isActive }) => `mobile-drawer-link ${isActive ? "active" : ""}`}
          >
            <FiBookmark size={18} /> <span>Saved Posts</span>
          </NavLink>

          <NavLink
            to="/creator"
            onClick={handleNavClick}
            className={({ isActive }) => `mobile-drawer-link ${isActive ? "active" : ""}`}
          >
            <FiBarChart2 size={18} /> <span>Creator Analytics</span>
          </NavLink>

          <NavLink
            to="/settings"
            onClick={handleNavClick}
            className={({ isActive }) => `mobile-drawer-link ${isActive ? "active" : ""}`}
          >
            <FiSettings size={18} /> <span>Settings</span>
          </NavLink>

          {isAdminOrMod && (
            <NavLink
              to="/admin"
              onClick={handleNavClick}
              className={({ isActive }) => `mobile-drawer-link text-warning ${isActive ? "active" : ""}`}
            >
              <FiShield size={18} /> <span>Admin Console</span>
            </NavLink>
          )}

          <div className="pt-3 mt-auto border-top d-flex flex-column gap-2">
            <Button
              as={Link}
              to="/create-post"
              onClick={handleNavClick}
              variant="primary"
              className="btn-primary-custom w-100 d-flex align-items-center justify-content-center gap-2 py-2 rounded-pill shadow-sm"
            >
              <FiPlusSquare size={16} />
              <span>Create Post</span>
            </Button>

            {user ? (
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={handleLogout}
                className="w-100 d-flex align-items-center justify-content-center gap-2 py-1.5 mt-1"
              >
                <FiLogOut size={15} /> <span>Sign Out</span>
              </Button>
            ) : (
              <div className="d-flex gap-2 mt-1">
                <Button as={Link} to="/login" onClick={handleNavClick} variant="outline-primary" size="sm" className="w-50 rounded-pill">
                  Log In
                </Button>
                <Button as={Link} to="/signup" onClick={handleNavClick} variant="primary" size="sm" className="btn-primary-custom w-50 rounded-pill">
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
