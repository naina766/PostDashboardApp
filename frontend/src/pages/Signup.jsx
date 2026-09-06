import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Button, InputGroup, Spinner, Alert } from "react-bootstrap";
import { FiUser, FiMail, FiLock, FiShare2, FiCheck, FiEye, FiEyeOff } from "react-icons/fi";
import { signup } from "../services/auth";
import { useToast } from "../context/ToastContext";

function getFriendlySignupError(err) {
  const status = err?.response?.status;
  const apiMessage = err?.response?.data?.message;

  if (status === 409) {
    return "An account with this email already exists.";
  }
  if (!err?.response) {
    return "Unable to connect. Please check your internet connection.";
  }
  if (apiMessage && !/axios|networkerror|internal server/i.test(apiMessage)) {
    return apiMessage;
  }
  return "Failed to create account. Please try again.";
}

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
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setServerError("");

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      const msg = "Please fill in all required fields.";
      setServerError(msg);
      showToast(msg, "danger");
      return;
    }

    if (form.password.length < 6) {
      const msg = "Password must be at least 6 characters.";
      setServerError(msg);
      showToast(msg, "danger");
      return;
    }

    if (form.password !== form.confirmPassword) {
      const msg = "Passwords do not match. Please re-check.";
      setServerError(msg);
      showToast(msg, "danger");
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
      const errMsg = getFriendlySignupError(err);
      setServerError(errMsg);
      showToast(errMsg, "danger");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper page-enter-animate">
      <div className="auth-card">
        <div className="text-center mb-4">
          <div className="auth-brand-badge">
            <FiShare2 aria-hidden="true" /> PostHub
          </div>
          <h1 className="h3 fw-bold mb-1">Create your account</h1>
          <p className="text-muted small mb-0">Join PostHub and start sharing ideas</p>
        </div>

        <Form onSubmit={handleSubmit} noValidate>
          {serverError && (
            <Alert
              variant="danger"
              className="py-2 small mb-3 border-0"
              onClose={() => setServerError("")}
              dismissible
              role="alert"
            >
              {serverError}
            </Alert>
          )}

          <Form.Group className="mb-3" controlId="signupName">
            <Form.Label>Full name</Form.Label>
            <InputGroup>
              <InputGroup.Text className="bg-transparent">
                <FiUser className="text-muted" aria-hidden="true" />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                disabled={loading}
                autoComplete="name"
              />
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-3" controlId="signupEmail">
            <Form.Label>Email</Form.Label>
            <InputGroup>
              <InputGroup.Text className="bg-transparent">
                <FiMail className="text-muted" aria-hidden="true" />
              </InputGroup.Text>
              <Form.Control
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                disabled={loading}
                autoComplete="email"
              />
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-3" controlId="signupPassword">
            <Form.Label>Password</Form.Label>
            <InputGroup>
              <InputGroup.Text className="bg-transparent">
                <FiLock className="text-muted" aria-hidden="true" />
              </InputGroup.Text>
              <Form.Control
                type={showPassword ? "text" : "password"}
                placeholder="At least 6 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                disabled={loading}
                autoComplete="new-password"
              />
              <Button
                variant="outline-secondary"
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <FiEyeOff aria-hidden="true" />
                ) : (
                  <FiEye aria-hidden="true" />
                )}
              </Button>
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-4" controlId="signupConfirmPassword">
            <Form.Label>Confirm password</Form.Label>
            <InputGroup>
              <InputGroup.Text className="bg-transparent">
                <FiCheck className="text-muted" aria-hidden="true" />
              </InputGroup.Text>
              <Form.Control
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                required
                disabled={loading}
                autoComplete="new-password"
              />
              <Button
                variant="outline-secondary"
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                title={showConfirmPassword ? "Hide password" : "Show password"}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
                  <FiEyeOff aria-hidden="true" />
                ) : (
                  <FiEye aria-hidden="true" />
                )}
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
                <Spinner size="sm" animation="border" className="me-2" aria-hidden="true" />{" "}
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </Form>

        <p className="text-center text-muted small mb-0">
          Already have an account?{" "}
          <Link to="/login" className="text-primary fw-semibold text-decoration-none">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
