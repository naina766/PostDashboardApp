import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Nav, Form, Button, Spinner, Modal, Badge } from "react-bootstrap";
import {
  FiUser,
  FiShield,
  FiLock,
  FiBell,
  FiMoon,
  FiSun,
  FiMonitor,
  FiLogOut,
  FiTrash2,
  FiCheck,
  FiAlertTriangle,
} from "react-icons/fi";
import { useUser } from "../context/UserContext";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { updateSettings, changePassword, deleteAccount } from "../services/users";
import { logoutAll } from "../services/auth";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const { user, refreshUser, logout } = useUser();
  const { themePreference, setThemeMode } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("account");
  const [loading, setLoading] = useState(false);

  // Privacy State
  const [privacy, setPrivacy] = useState({
    profileVisibility: "public",
    whoCanComment: "everyone",
    whoCanMention: "everyone",
    whoCanFollow: "everyone",
  });

  // Notification Preferences State
  const [notifications, setNotifications] = useState({
    likes: true,
    comments: true,
    replies: true,
    follows: true,
    mentions: true,
    saves: true,
  });

  // Password Change State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Delete Account Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Populate settings from user object
  useEffect(() => {
    if (user?.privacy) {
      setPrivacy((prev) => ({ ...prev, ...user.privacy }));
    }
    if (user?.notificationSettings) {
      setNotifications((prev) => ({ ...prev, ...user.notificationSettings }));
    }
  }, [user]);

  // Save Privacy / Notification Settings
  const handleSaveSettings = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      await updateSettings({
        privacy,
        notificationSettings: notifications,
      });
      await refreshUser();
      showToast("Settings updated successfully!", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update settings", "danger");
    } finally {
      setLoading(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      showToast("New passwords do not match", "danger");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showToast("New password must be at least 6 characters", "danger");
      return;
    }

    setChangingPassword(true);
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      showToast("Password changed successfully!", "success");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to change password", "danger");
    } finally {
      setChangingPassword(false);
    }
  };

  // Logout All Sessions
  const handleLogoutAll = async () => {
    if (window.confirm("Are you sure you want to log out from all active sessions across all devices?")) {
      try {
        await logoutAll();
        logout();
        showToast("Logged out of all sessions. Please log in again.", "info");
        navigate("/login");
      } catch {
        showToast("Failed to revoke all sessions", "danger");
      }
    }
  };

  // Delete Account
  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      showToast("Please enter your password to confirm deletion", "danger");
      return;
    }
    setDeletingAccount(true);
    try {
      await deleteAccount({ password: deletePassword });
      logout();
      showToast("Your account has been permanently deactivated", "info");
      navigate("/login");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to deactivate account", "danger");
    } finally {
      setDeletingAccount(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <Container className="py-4">
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Account Settings</h2>
        <p className="text-muted small">Manage your account identity, security, privacy preferences, and app theme</p>
      </div>

      <Row className="g-4">
        {/* Left Side Navigation */}
        <Col lg={3} md={4}>
          <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-3">
            <Nav variant="pills" className="flex-column p-2">
              <Nav.Item>
                <Nav.Link
                  active={activeTab === "account"}
                  onClick={() => setActiveTab("account")}
                  className="d-flex align-items-center gap-2 rounded-3 py-2 px-3 fw-medium"
                >
                  <FiUser /> Account
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  active={activeTab === "privacy"}
                  onClick={() => setActiveTab("privacy")}
                  className="d-flex align-items-center gap-2 rounded-3 py-2 px-3 fw-medium"
                >
                  <FiShield /> Privacy
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  active={activeTab === "security"}
                  onClick={() => setActiveTab("security")}
                  className="d-flex align-items-center gap-2 rounded-3 py-2 px-3 fw-medium"
                >
                  <FiLock /> Security
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  active={activeTab === "notifications"}
                  onClick={() => setActiveTab("notifications")}
                  className="d-flex align-items-center gap-2 rounded-3 py-2 px-3 fw-medium"
                >
                  <FiBell /> Notifications
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  active={activeTab === "appearance"}
                  onClick={() => setActiveTab("appearance")}
                  className="d-flex align-items-center gap-2 rounded-3 py-2 px-3 fw-medium"
                >
                  <FiMoon /> Appearance
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Card>
        </Col>

        {/* Right Side Content Panel */}
        <Col lg={9} md={8}>
          {/* 1. Account Tab */}
          {activeTab === "account" && (
            <Card className="border-0 shadow-sm rounded-4 p-4">
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <FiUser className="text-primary" /> Account Details
              </h5>
              <div className="mb-3">
                <label className="form-label text-muted small fw-semibold">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  value={user?.email || ""}
                  disabled
                  readOnly
                />
                <small className="text-muted">Email is linked to your primary login credential.</small>
              </div>

              <div className="mb-3">
                <label className="form-label text-muted small fw-semibold">Username</label>
                <input
                  type="text"
                  className="form-control"
                  value={`@${user?.username || ""}`}
                  disabled
                  readOnly
                />
              </div>

              <div className="d-flex flex-wrap gap-3 py-2 border-top pt-3">
                <div>
                  <span className="text-muted small d-block">Role</span>
                  <Badge bg="primary" className="text-uppercase">{user?.role || "user"}</Badge>
                </div>
                <div>
                  <span className="text-muted small d-block">Verification</span>
                  <Badge bg={user?.isVerified ? "success" : "secondary"}>
                    {user?.isVerified ? "Verified Creator" : "Standard Account"}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted small d-block">Joined</span>
                  <span className="small fw-semibold">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                  </span>
                </div>
              </div>
            </Card>
          )}

          {/* 2. Privacy Tab */}
          {activeTab === "privacy" && (
            <Card className="border-0 shadow-sm rounded-4 p-4">
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <FiShield className="text-primary" /> Privacy Preferences
              </h5>
              <Form onSubmit={handleSaveSettings}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">Profile Visibility</Form.Label>
                  <Form.Select
                    value={privacy.profileVisibility}
                    onChange={(e) => setPrivacy({ ...privacy, profileVisibility: e.target.value })}
                  >
                    <option value="public">Public (Everyone can see your profile & posts)</option>
                    <option value="private">Private (Only followers can see your profile & posts)</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">Who Can Comment On Your Posts</Form.Label>
                  <Form.Select
                    value={privacy.whoCanComment}
                    onChange={(e) => setPrivacy({ ...privacy, whoCanComment: e.target.value })}
                  >
                    <option value="everyone">Everyone</option>
                    <option value="followers">Followers only</option>
                    <option value="none">No one</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">Who Can Mention You</Form.Label>
                  <Form.Select
                    value={privacy.whoCanMention}
                    onChange={(e) => setPrivacy({ ...privacy, whoCanMention: e.target.value })}
                  >
                    <option value="everyone">Everyone</option>
                    <option value="followers">Followers only</option>
                    <option value="none">No one</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-medium">Who Can Follow You</Form.Label>
                  <Form.Select
                    value={privacy.whoCanFollow}
                    onChange={(e) => setPrivacy({ ...privacy, whoCanFollow: e.target.value })}
                  >
                    <option value="everyone">Anyone directly</option>
                    <option value="approval_required">Require follow approval</option>
                  </Form.Select>
                </Form.Group>

                <Button type="submit" variant="primary" className="btn-primary-custom" disabled={loading}>
                  {loading ? <Spinner size="sm" animation="border" className="me-2" /> : <FiCheck className="me-1" />}
                  Save Privacy Settings
                </Button>
              </Form>
            </Card>
          )}

          {/* 3. Security Tab */}
          {activeTab === "security" && (
            <div className="d-flex flex-column gap-4">
              {/* Change Password Card */}
              <Card className="border-0 shadow-sm rounded-4 p-4">
                <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                  <FiLock className="text-primary" /> Change Password
                </h5>
                <Form onSubmit={handleChangePassword}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">Current Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Enter current password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">New Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="At least 6 characters"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-medium">Confirm New Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Confirm new password"
                      value={passwordForm.confirmNewPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })}
                      required
                    />
                  </Form.Group>

                  <Button type="submit" variant="primary" className="btn-primary-custom" disabled={changingPassword}>
                    {changingPassword ? <Spinner size="sm" animation="border" className="me-2" /> : <FiCheck className="me-1" />}
                    Update Password
                  </Button>
                </Form>
              </Card>

              {/* Sessions & Account Danger Zone */}
              <Card className="border-0 shadow-sm rounded-4 p-4">
                <h5 className="fw-bold mb-3 d-flex align-items-center gap-2 text-danger">
                  <FiAlertTriangle /> Security & Session Management
                </h5>
                <p className="text-muted small">
                  Revoke all active refresh tokens across every device or deactivate your PostHub account.
                </p>

                <div className="d-flex flex-wrap gap-3 pt-2">
                  <Button variant="outline-warning" onClick={handleLogoutAll} className="d-flex align-items-center gap-2">
                    <FiLogOut /> Logout From All Sessions
                  </Button>
                  <Button variant="outline-danger" onClick={() => setShowDeleteModal(true)} className="d-flex align-items-center gap-2">
                    <FiTrash2 /> Deactivate Account
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* 4. Notifications Tab */}
          {activeTab === "notifications" && (
            <Card className="border-0 shadow-sm rounded-4 p-4">
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <FiBell className="text-primary" /> Notification Preferences
              </h5>
              <p className="text-muted small mb-4">Choose which in-app and delivery alerts you want to receive.</p>

              <Form onSubmit={handleSaveSettings}>
                <Form.Check
                  type="switch"
                  id="notif-likes"
                  label="Likes on your posts"
                  checked={notifications.likes}
                  onChange={(e) => setNotifications({ ...notifications, likes: e.target.checked })}
                  className="mb-3"
                />
                <Form.Check
                  type="switch"
                  id="notif-comments"
                  label="Comments on your posts"
                  checked={notifications.comments}
                  onChange={(e) => setNotifications({ ...notifications, comments: e.target.checked })}
                  className="mb-3"
                />
                <Form.Check
                  type="switch"
                  id="notif-replies"
                  label="Replies to your comments"
                  checked={notifications.replies}
                  onChange={(e) => setNotifications({ ...notifications, replies: e.target.checked })}
                  className="mb-3"
                />
                <Form.Check
                  type="switch"
                  id="notif-follows"
                  label="New followers"
                  checked={notifications.follows}
                  onChange={(e) => setNotifications({ ...notifications, follows: e.target.checked })}
                  className="mb-3"
                />
                <Form.Check
                  type="switch"
                  id="notif-mentions"
                  label="Mentions (@username) in posts and comments"
                  checked={notifications.mentions}
                  onChange={(e) => setNotifications({ ...notifications, mentions: e.target.checked })}
                  className="mb-3"
                />
                <Form.Check
                  type="switch"
                  id="notif-saves"
                  label="When someone bookmarks your post"
                  checked={notifications.saves}
                  onChange={(e) => setNotifications({ ...notifications, saves: e.target.checked })}
                  className="mb-4"
                />

                <Button type="submit" variant="primary" className="btn-primary-custom" disabled={loading}>
                  {loading ? <Spinner size="sm" animation="border" className="me-2" /> : <FiCheck className="me-1" />}
                  Save Notification Preferences
                </Button>
              </Form>
            </Card>
          )}

          {/* 5. Appearance Tab */}
          {activeTab === "appearance" && (
            <Card className="border-0 shadow-sm rounded-4 p-4">
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <FiMoon className="text-primary" /> Appearance & Theme
              </h5>
              <p className="text-muted small mb-4">Choose how PostHub looks to you across devices.</p>

              <Row className="g-3">
                <Col sm={4}>
                  <Card
                    role="button"
                    onClick={() => setThemeMode("light")}
                    className={`p-3 text-center border-2 rounded-3 h-100 ${
                      themePreference === "light" ? "border-primary bg-primary-subtle" : "border-light-subtle"
                    }`}
                  >
                    <FiSun className="fs-3 text-warning mx-auto mb-2" />
                    <h6 className="fw-bold mb-1">Light</h6>
                    <small className="text-muted">Clean bright interface</small>
                  </Card>
                </Col>

                <Col sm={4}>
                  <Card
                    role="button"
                    onClick={() => setThemeMode("dark")}
                    className={`p-3 text-center border-2 rounded-3 h-100 ${
                      themePreference === "dark" ? "border-primary bg-primary-subtle" : "border-light-subtle"
                    }`}
                  >
                    <FiMoon className="fs-3 text-primary mx-auto mb-2" />
                    <h6 className="fw-bold mb-1">Dark</h6>
                    <small className="text-muted">Easy on the eyes</small>
                  </Card>
                </Col>

                <Col sm={4}>
                  <Card
                    role="button"
                    onClick={() => setThemeMode("system")}
                    className={`p-3 text-center border-2 rounded-3 h-100 ${
                      themePreference === "system" ? "border-primary bg-primary-subtle" : "border-light-subtle"
                    }`}
                  >
                    <FiMonitor className="fs-3 text-secondary mx-auto mb-2" />
                    <h6 className="fw-bold mb-1">System</h6>
                    <small className="text-muted">Matches OS theme</small>
                  </Card>
                </Col>
              </Row>
            </Card>
          )}
        </Col>
      </Row>

      {/* Delete Account Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger fw-bold d-flex align-items-center gap-2">
            <FiAlertTriangle /> Deactivate Account
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted small">
            This action will mark your account as deactivated and hide your profile and posts from public discovery.
            Enter your password below to confirm:
          </p>
          <Form.Group>
            <Form.Label className="fw-medium">Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Confirm your password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteAccount} disabled={deletingAccount}>
            {deletingAccount ? <Spinner size="sm" animation="border" className="me-2" /> : null}
            Permanently Deactivate
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
