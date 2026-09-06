import React from "react";
import { Container, Button } from "react-bootstrap";
import { FiAlertTriangle, FiRefreshCw } from "react-icons/fi";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    // Component error boundary hook
  }

  handleReset = () => {
    this.setState({ hasError: false });
    window.location.href = "/dashboard";
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container className="d-flex flex-column align-items-center justify-content-center min-vh-100 text-center py-5 page-enter-animate">
          <div
            className="empty-state"
            style={{ maxWidth: 480 }}
            role="alert"
            aria-live="assertive"
          >
            <div className="empty-state-icon text-danger" aria-hidden="true">
              <FiAlertTriangle />
            </div>
            <h1 className="empty-state-title h3">Something went wrong</h1>
            <p className="empty-state-desc">
              We couldn&apos;t load this content. Refresh the page or return to your feed.
            </p>
            <Button
              variant="primary"
              className="btn-primary-custom d-inline-flex align-items-center gap-2"
              onClick={this.handleReset}
            >
              <FiRefreshCw aria-hidden="true" /> Try Again
            </Button>
          </div>
        </Container>
      );
    }

    return this.props.children;
  }
}
