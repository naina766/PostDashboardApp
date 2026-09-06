import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Button, InputGroup, Spinner } from "react-bootstrap";
import { FiUser, FiMail, FiLock, FiShare2, FiCheck, FiEye, FiEyeOff } from "react-icons/fi";
import { signup } from "../services/auth";
import { useToast } from "../context/ToastContext";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      showToast("Please fill in all required fields.", "danger");
      return;
    }

    if (form.password.length < 6) {
      showToast("Password must be at least 6 characters.", "danger");
      return;
    }

    if (form.password !== form.confirmPassword) {
      showToast("Passwords do not match. Please re-check.", "danger");
      return;
    }

    setLoading(true);
    try {
      await signup({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      showToast("Account created successfully! Please sign in.", "success");
      navigate("/login");
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to create account. Please try again.",
        "danger"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="text-center mb-4">
          <div className="auth-brand-badge">
            <FiShare2 /> PostHub
          </div>
          <h2 className="fw-bold mb-1">Create your account</h2>
          <p className="text-muted small">Join our community and share what's on your mind</p>
        </div>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="signupName">
            <Form.Label className="d-flex align-items-center gap-1">
              <FiUser className="text-muted" /> Full Name
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g. Naina Varshney"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              disabled={loading}
              aria-label="Full name"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="signupEmail">
            <Form.Label className="d-flex align-items-center gap-1">
              <FiMail className="text-muted" /> Email Address
            </Form.Label>
            <Form.Control
              type="email"
              placeholder="name@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              disabled={loading}
              aria-label="Email address"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="signupPassword">
            <Form.Label className="d-flex align-items-center gap-1">
              <FiLock className="text-muted" /> Password
            </Form.Label>
            <InputGroup>
              <Form.Control
                type={showPassword ? "text" : "password"}
                placeholder="At least 6 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                disabled={loading}
                aria-label="Password"
              />
              <Button
                variant="outline-secondary"
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </Button>
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-4" controlId="signupConfirmPassword">
            <Form.Label className="d-flex align-items-center gap-1">
              <FiCheck className="text-muted" /> Confirm Password
            </Form.Label>
            <InputGroup>
              <Form.Control
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                required
                disabled={loading}
                aria-label="Confirm password"
              />
              <Button
                variant="outline-secondary"
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                title={showConfirmPassword ? "Hide password" : "Show password"}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </Button>
            </InputGroup>
          </Form.Group>

          <Button
            type="submit"
            className="btn-primary-custom w-100 py-2 mb-3"
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" /> Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </Form>

        <p className="text-center text-muted small mb-0">
          Already have an account?{" "}
          <Link to="/login" className="text-primary fw-semibold text-decoration-none">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
