import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { 
  FiShare2, 
  FiFileText, 
  FiPlusSquare, 
  FiUser, 
  FiLogOut, 
  FiSun, 
  FiMoon 
} from "react-icons/fi";
import { useUser } from "../context/UserContext";
import { useTheme } from "../context/ThemeContext";

export default function AppNavbar() {
  const { user, logout } = useUser();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const handleLogout = () => {
    logout();
    setExpanded(false);
    navigate("/login");
  };

  const handleNavClick = () => {
    setExpanded(false);
  };

  return (
    <Navbar 
      expanded={expanded} 
      onToggle={setExpanded} 
      expand="lg" 
      className="posthub-navbar sticky-top"
    >
      <Container>
        <Navbar.Brand as={Link} to="/dashboard" onClick={handleNavClick} className="posthub-brand">
          <FiShare2 className="text-primary" /> PostHub
        </Navbar.Brand>

        <div className="d-flex align-items-center gap-2 d-lg-none ms-auto me-2">
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
              <FiFileText /> Social Feed
            </Nav.Link>
            <Nav.Link 
              as={NavLink} 
              to="/create-post" 
              onClick={handleNavClick} 
              className="posthub-nav-link"
            >
              <FiPlusSquare /> Create Post
            </Nav.Link>
            <Nav.Link 
              as={NavLink} 
              to="/profile" 
              onClick={handleNavClick} 
              className="posthub-nav-link"
            >
              <FiUser /> Profile
            </Nav.Link>
          </Nav>

          <div className="d-flex align-items-center gap-3 mt-3 mt-lg-0">
            <button
              onClick={toggleTheme}
              className="theme-toggle-btn d-none d-lg-flex"
              title={`Switch to ${theme === "light" ? "Dark" : "Light"} mode`}
              type="button"
            >
              {theme === "light" ? (
                <>
                  <FiMoon /> Dark
                </>
              ) : (
                <>
                  <FiSun /> Light
                </>
              )}
            </button>

            {user && (
              <span className="text-muted small d-none d-xl-inline">
                Signed in as <strong className="text-body">{user.name}</strong>
              </span>
            )}

            <Button
              variant="outline-danger"
              size="sm"
              onClick={handleLogout}
              className="d-flex align-items-center gap-1 px-3 py-1"
            >
              <FiLogOut /> Logout
            </Button>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
