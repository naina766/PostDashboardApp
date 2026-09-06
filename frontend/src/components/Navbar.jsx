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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (navSearch.trim()) {
      navigate(`/explore?q=${encodeURIComponent(navSearch.trim())}`);
      setNavSearch("");
      setExpanded(false);
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
    navigate("/login");
  };

  const handleNavClick = () => {
    setExpanded(false);
  };

  const isAdminOrMod = user && ["admin", "moderator"].includes(user.role);

  return (
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

        {/* Global Search Bar on Desktop */}
        <form onSubmit={handleSearchSubmit} className="d-none d-md-flex align-items-center position-relative ms-3 me-2 flex-grow-1" style={{ maxWidth: "280px" }}>
          <FiSearch className="position-absolute start-0 ms-2.5 text-muted pointer-events-none" size={14} />
          <input
            type="search"
            className="form-control form-control-sm ps-4 rounded-pill border-0 bg-body-secondary"
            placeholder="Search creators, #tags..."
            value={navSearch}
            onChange={(e) => setNavSearch(e.target.value)}
            aria-label="Global Search"
          />
        </form>

        <div className="d-flex align-items-center gap-2 d-lg-none ms-auto me-2">
          <Link to="/notifications" onClick={handleNavClick} className="position-relative text-body px-2" aria-label="Notifications">
            <FiBell size={20} />
            {unreadCount > 0 && (
              <span className="badge-notification-dot"></span>
            )}
          </Link>
          <button
            onClick={toggleTheme}
            className="theme-toggle-btn"
            title={`Switch to ${theme === "light" ? "Dark" : "Light"} mode`}
            aria-label={`Switch to ${theme === "light" ? "Dark" : "Light"} mode`}
            type="button"
          >
            {theme === "light" ? <FiMoon /> : <FiSun />}
          </button>
        </div>

        <Navbar.Toggle aria-controls="posthub-nav-menu" aria-label="Toggle navigation menu" />

        <Navbar.Collapse id="posthub-nav-menu">
          <Nav className="me-auto ms-lg-3 gap-1">
            <Nav.Link 
              as={NavLink} 
              to="/dashboard" 
              onClick={handleNavClick} 
              className="posthub-nav-link"
            >
              <FiFileText /> Feed
            </Nav.Link>
            <Nav.Link 
              as={NavLink} 
              to="/explore" 
              onClick={handleNavClick} 
              className="posthub-nav-link"
            >
              <FiCompass /> Explore
            </Nav.Link>
            <Nav.Link 
              as={NavLink} 
              to="/saved" 
              onClick={handleNavClick} 
              className="posthub-nav-link"
            >
              <FiBookmark /> Saved
            </Nav.Link>
            <Nav.Link 
              as={NavLink} 
              to="/notifications" 
              onClick={handleNavClick} 
              className="posthub-nav-link position-relative"
            >
              <FiBell /> Notifications
              {unreadCount > 0 && (
                <Badge bg="danger" pill className="ms-1 px-1.5 py-0.5 small">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Badge>
              )}
            </Nav.Link>
            <Nav.Link 
              as={NavLink} 
              to="/creator" 
              onClick={handleNavClick} 
              className="posthub-nav-link"
            >
              <FiBarChart2 /> Creator
            </Nav.Link>
            <Nav.Link 
              as={NavLink} 
              to="/settings" 
              onClick={handleNavClick} 
              className="posthub-nav-link"
            >
              <FiSettings /> Settings
            </Nav.Link>
            {isAdminOrMod && (
              <Nav.Link 
                as={NavLink} 
                to="/admin" 
                onClick={handleNavClick} 
                className="posthub-nav-link text-warning"
              >
                <FiShield /> Admin
              </Nav.Link>
            )}
          </Nav>

          <div className="d-flex align-items-center gap-2 mt-3 mt-lg-0">
            {user ? (
              <>
                <Button
                  as={Link}
                  to="/create-post"
                  onClick={handleNavClick}
                  variant="primary"
                  size="sm"
                  className="d-flex align-items-center gap-1.5 px-3 py-1.5 rounded-pill"
                >
                  <FiPlusSquare /> Create Post
                </Button>

                <Nav.Link
                  as={Link}
                  to="/profile"
                  onClick={handleNavClick}
                  className="d-flex align-items-center gap-2 p-1 text-decoration-none text-body"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="rounded-circle object-fit-cover"
                      style={{ width: "32px", height: "32px" }}
                    />
                  ) : (
                    <div
                      className="avatar-placeholder rounded-circle d-flex align-items-center justify-content-center bg-primary text-white font-weight-bold"
                      style={{ width: "32px", height: "32px", fontSize: "14px" }}
                    >
                      {user.name ? user.name[0].toUpperCase() : "U"}
                    </div>
                  )}
                  <span className="d-none d-xl-inline small fw-medium">{user.name}</span>
                </Nav.Link>

                <button
                  onClick={toggleTheme}
                  className="theme-toggle-btn d-none d-lg-flex"
                  title={`Switch to ${theme === "light" ? "Dark" : "Light"} mode`}
                  aria-label={`Switch to ${theme === "light" ? "Dark" : "Light"} mode`}
                  type="button"
                >
                  {theme === "light" ? <FiMoon size={15} /> : <FiSun size={15} />}
                </button>

                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={handleLogout}
                  className="d-flex align-items-center gap-1 px-2.5 py-1"
                  title="Sign out"
                >
                  <FiLogOut />
                </Button>
              </>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Button
                  as={Link}
                  to="/login"
                  variant="outline-primary"
                  size="sm"
                  className="rounded-pill px-3"
                >
                  Log In
                </Button>
                <Button
                  as={Link}
                  to="/signup"
                  variant="primary"
                  size="sm"
                  className="rounded-pill px-3"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
