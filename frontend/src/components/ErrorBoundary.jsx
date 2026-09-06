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
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container className="d-flex flex-column align-items-center justify-content-center min-vh-100 text-center py-5">
          <div className="empty-state" style={{ maxWidth: 500 }}>
            <div className="empty-state-icon text-danger">
              <FiAlertTriangle />
            </div>
            <h3 className="empty-state-title">Something went wrong</h3>
            <p className="empty-state-desc">
              An unexpected error occurred. Please refresh the page or try again.
            </p>
            <Button
              variant="primary"
              className="btn-primary-custom d-inline-flex align-items-center gap-2"
              onClick={this.handleReset}
            >
              <FiRefreshCw /> Try Again
            </Button>
          </div>
        </Container>
      );
    }

    return this.props.children;
  }
}
