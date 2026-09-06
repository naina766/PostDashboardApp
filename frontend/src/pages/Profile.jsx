import React, { useEffect, useState } from "react";
import { Container, Row, Col, Form, Button, Spinner } from "react-bootstrap";
import { 
  FiUser, 
  FiMail, 
  FiFileText, 
  FiHeart, 
  FiMessageSquare, 
  FiSave 
} from "react-icons/fi";
import { getProfile, updateProfile } from "../services/auth";
import { useUser } from "../context/UserContext";
import { useToast } from "../context/ToastContext";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Profile() {
  const { setUser: setContextUser } = useUser();
  const { showToast } = useToast();
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    postsCount: 0,
    likesReceived: 0,
    commentsReceived: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await getProfile();
        if (res.data?.data) {
          setProfile(res.data.data);
        }
      } catch {
        showToast("Failed to load profile information.", "danger");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [showToast]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!profile.name.trim() || !profile.email.trim()) {
      showToast("Name and email are required.", "danger");
      return;
    }

    setSaving(true);
    try {
      const res = await updateProfile({
        name: profile.name.trim(),
        email: profile.email.trim(),
      });
      if (res.data?.data) {
        setContextUser((prev) => ({ ...prev, ...res.data.data }));
      }
      showToast("Profile updated successfully!", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update profile.", "danger");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="py-5">
        <LoadingSpinner message="Loading profile..." />
      </main>
    );
  }

  const initial = (profile.name || "U").charAt(0).toUpperCase();

  return (
    <main className="py-4">
      <Container style={{ maxWidth: "680px" }}>
        <div className="auth-card mb-4" style={{ maxWidth: "100%", padding: "2rem" }}>
          {/* Header */}
          <div className="d-flex flex-column flex-sm-row align-items-center gap-3 text-center text-sm-start mb-4">
            <div 
              className="post-author-avatar" 
              style={{ width: 72, height: 72, fontSize: "1.75rem" }}
              aria-hidden="true"
            >
              {initial}
            </div>
            <div>
              <h3 className="fw-bold mb-1">{profile.name}</h3>
              <p className="text-muted mb-0 d-flex align-items-center justify-content-center justify-content-sm-start gap-1">
                <FiMail size={14} /> {profile.email}
              </p>
            </div>
          </div>

          {/* Statistics Grid */}
          <h6 className="fw-bold text-muted text-uppercase small mb-3">Community Activity</h6>
          <Row className="g-3 mb-4">
            <Col xs={12} sm={4}>
              <div className="stat-card">
                <div className="stat-number">{profile.postsCount ?? 0}</div>
                <div className="stat-label d-flex align-items-center justify-content-center gap-1">
                  <FiFileText size={13} /> Posts
                </div>
              </div>
            </Col>
            <Col xs={12} sm={4}>
              <div className="stat-card">
                <div className="stat-number text-danger">{profile.likesReceived ?? 0}</div>
                <div className="stat-label d-flex align-items-center justify-content-center gap-1">
                  <FiHeart size={13} /> Likes Received
                </div>
              </div>
            </Col>
            <Col xs={12} sm={4}>
              <div className="stat-card">
                <div className="stat-number text-primary">{profile.commentsReceived ?? 0}</div>
                <div className="stat-label d-flex align-items-center justify-content-center gap-1">
                  <FiMessageSquare size={13} /> Comments
                </div>
              </div>
            </Col>
          </Row>

          <hr className="my-4" />

          {/* Edit Profile Form */}
          <h5 className="fw-bold mb-3">Edit Profile</h5>

          <Form onSubmit={handleUpdate}>
            <Form.Group className="mb-3" controlId="profileNameInput">
              <Form.Label className="d-flex align-items-center gap-1 small text-muted">
                <FiUser /> Full Name
              </Form.Label>
              <Form.Control
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                required
                disabled={saving}
                aria-label="Full Name"
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="profileEmailInput">
              <Form.Label className="d-flex align-items-center gap-1 small text-muted">
                <FiMail /> Email Address
              </Form.Label>
              <Form.Control
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                required
                disabled={saving}
                aria-label="Email Address"
              />
            </Form.Group>

            <Button
              type="submit"
              className="btn-primary-custom d-flex align-items-center justify-content-center gap-2 w-100"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Spinner size="sm" animation="border" /> Saving Changes...
                </>
              ) : (
                <>
                  <FiSave /> Save Changes
                </>
              )}
            </Button>
          </Form>
        </div>
      </Container>
    </main>
  );
}
