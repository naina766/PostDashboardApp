import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Form, Button, InputGroup, Spinner } from "react-bootstrap";
import { FiMail, FiLock, FiShare2, FiEye, FiEyeOff } from "react-icons/fi";
import { login } from "../services/auth";
import { useUser } from "../context/UserContext";
import { useToast } from "../context/ToastContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshUser } = useUser();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      showToast("Please fill in all fields.", "danger");
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
        showToast("Invalid response from server. Please try again.", "danger");
      }
    } catch (err) {
      showToast(
        err.response?.data?.message || "Login failed. Please check your credentials.",
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
          <h2 className="fw-bold mb-1">Welcome back</h2>
          <p className="text-muted small">Sign in to join the social conversation</p>
        </div>

        {location.state?.message && (
          <div className="alert alert-info py-2 small mb-3 text-center">
            {location.state.message}
          </div>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="loginEmail">
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

          <Form.Group className="mb-4" controlId="loginPassword">
            <Form.Label className="d-flex align-items-center gap-1">
              <FiLock className="text-muted" /> Password
            </Form.Label>
            <InputGroup>
              <Form.Control
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
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

          <Button
            type="submit"
            className="btn-primary-custom w-100 py-2 mb-3"
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" /> Signing in...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </Form>

        <p className="text-center text-muted small mb-0">
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary fw-semibold text-decoration-none">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
