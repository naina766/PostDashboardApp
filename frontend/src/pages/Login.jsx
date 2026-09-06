import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Form, Button, InputGroup, Spinner, Alert } from "react-bootstrap";
import { FiMail, FiLock, FiShare2, FiEye, FiEyeOff } from "react-icons/fi";
import { login } from "../services/auth";
import { useUser } from "../context/UserContext";
import { useToast } from "../context/ToastContext";

function getFriendlyAuthError(err) {
  const status = err?.response?.status;
  const apiMessage = err?.response?.data?.message;

  if (status === 401 || status === 403) {
    return "Invalid email or password.";
  }
  if (status === 429) {
    return "Too many attempts. Please wait a moment and try again.";
  }
  if (!err?.response) {
    return "Unable to connect. Please check your internet connection.";
  }
  if (apiMessage && !/axios|networkerror|internal server/i.test(apiMessage)) {
    return apiMessage;
  }
  return "Sign in failed. Please try again.";
}

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshUser } = useUser();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setFormError("");

    if (!form.email || !form.password) {
      const msg = "Please fill in all fields.";
      setFormError(msg);
      showToast(msg, "danger");
      return;
    }

    setLoading(true);
    try {
      const res = await login(form);
      const token = res.data?.data?.token;
      const refreshToken = res.data?.data?.refreshToken;
      if (token) {
        localStorage.setItem("token", token);
        if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
        await refreshUser();
        showToast("Welcome back!", "success");
        navigate("/dashboard");
      } else {
        const msg = "Unable to sign in. Please try again.";
        setFormError(msg);
        showToast(msg, "danger");
      }
    } catch (err) {
      const msg = getFriendlyAuthError(err);
      setFormError(msg);
      showToast(msg, "danger");
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
          <h1 className="h3 fw-bold mb-1">Welcome back</h1>
          <p className="text-muted small mb-0">Sign in to continue the conversation</p>
        </div>

        {location.state?.message && (
          <Alert variant="info" className="py-2 small mb-3 text-center border-0">
            {location.state.message}
          </Alert>
        )}

        {formError && (
          <Alert
            variant="danger"
            className="py-2 small mb-3 border-0"
            onClose={() => setFormError("")}
            dismissible
            role="alert"
          >
            {formError}
          </Alert>
        )}

        <Form onSubmit={handleSubmit} noValidate>
          <Form.Group className="mb-3" controlId="loginEmail">
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

          <Form.Group className="mb-4" controlId="loginPassword">
            <Form.Label>Password</Form.Label>
            <InputGroup>
              <InputGroup.Text className="bg-transparent">
                <FiLock className="text-muted" aria-hidden="true" />
              </InputGroup.Text>
              <Form.Control
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                disabled={loading}
                autoComplete="current-password"
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

          <Button
            type="submit"
            className="btn-primary-custom w-100 py-2 mb-3"
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" aria-hidden="true" />{" "}
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </Form>

        <p className="text-center text-muted small mb-0">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="text-primary fw-semibold text-decoration-none">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
