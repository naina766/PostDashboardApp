import React from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Button } from "react-bootstrap";
import {
  FiShare2,
  FiArrowRight,
  FiEdit3,
  FiCompass,
  FiUsers,
  FiCheckCircle,
} from "react-icons/fi";
import { useUser } from "../context/UserContext";

export default function Landing() {
  const { user } = useUser();

  return (
    <main className="landing-page py-4 py-md-5 page-enter-animate">
      <Container>
        {/* Hero */}
        <section className="text-center py-4 py-md-5 mx-auto" style={{ maxWidth: "780px" }}>
          <div className="d-inline-flex align-items-center gap-2 mb-3 landing-hero-brand">
            <FiShare2 aria-hidden="true" />
            <span>PostHub</span>
          </div>

          <h1 className="landing-hero-title mb-3">
            Build conversations that matter.
          </h1>

          <p
            className="mb-2 mx-auto"
            style={{
              maxWidth: "620px",
              fontSize: "1.05rem",
              lineHeight: 1.65,
              color: "var(--ph-text-secondary)",
            }}
          >
            A professional community for sharing ideas, building conversations,
            and discovering creators.
          </p>

          <p
            className="mb-4 mx-auto"
            style={{
              maxWidth: "520px",
              fontSize: "0.95rem",
              lineHeight: 1.6,
              color: "var(--ph-text-muted)",
            }}
          >
            Share ideas. Discover creators. Join communities.
          </p>

          <div className="d-flex align-items-center justify-content-center gap-3 flex-wrap mb-2">
            {user ? (
              <>
                <Button
                  as={Link}
                  to="/dashboard"
                  size="lg"
                  className="btn-primary-custom d-inline-flex align-items-center gap-2 px-4 rounded-pill"
                >
                  Go to Your Feed <FiArrowRight aria-hidden="true" />
                </Button>
                <Button
                  as={Link}
                  to="/explore"
                  variant="outline-primary"
                  size="lg"
                  className="ph-btn-secondary d-inline-flex align-items-center gap-2 px-4 rounded-pill"
                >
                  Explore Posts
                </Button>
              </>
            ) : (
              <>
                <Button
                  as={Link}
                  to="/signup"
                  size="lg"
                  className="btn-primary-custom d-inline-flex align-items-center gap-2 px-4 rounded-pill"
                >
                  Join PostHub <FiArrowRight aria-hidden="true" />
                </Button>
                <Button
                  as={Link}
                  to="/explore"
                  variant="outline-primary"
                  size="lg"
                  className="ph-btn-secondary d-inline-flex align-items-center gap-2 px-4 rounded-pill"
                >
                  Explore Posts
                </Button>
              </>
            )}
          </div>
        </section>

        {/* Features */}
        <section className="pb-4 mb-4">
          <div className="text-center mb-4">
            <h2 className="ph-section-title mb-2" style={{ fontSize: "1.35rem" }}>
              Everything you need to share and connect
            </h2>
            <p className="ph-section-copy mb-0">
              Purpose-built for productive, high-signal conversations.
            </p>
          </div>

          <Row className="g-3 g-md-4">
            <Col md={4}>
              <article className="landing-feature-card">
                <div
                  className="rounded-3 d-inline-flex align-items-center justify-content-center mb-3"
                  style={{
                    width: 44,
                    height: 44,
                    backgroundColor: "var(--ph-primary-light)",
                    color: "var(--ph-primary)",
                  }}
                  aria-hidden="true"
                >
                  <FiEdit3 size={20} />
                </div>
                <h3 className="fw-bold mb-2 fs-5">Create</h3>
                <p className="mb-0" style={{ color: "var(--ph-text-secondary)", lineHeight: 1.6, fontSize: "0.925rem" }}>
                  Share your ideas with a clean composer built for thoughtful posts.
                </p>
              </article>
            </Col>

            <Col md={4}>
              <article className="landing-feature-card">
                <div
                  className="rounded-3 d-inline-flex align-items-center justify-content-center mb-3"
                  style={{
                    width: 44,
                    height: 44,
                    backgroundColor: "var(--ph-primary-light)",
                    color: "var(--ph-primary)",
                  }}
                  aria-hidden="true"
                >
                  <FiCompass size={20} />
                </div>
                <h3 className="fw-bold mb-2 fs-5">Discover</h3>
                <p className="mb-0" style={{ color: "var(--ph-text-secondary)", lineHeight: 1.6, fontSize: "0.925rem" }}>
                  Find conversations worth following across topics and creators.
                </p>
              </article>
            </Col>

            <Col md={4}>
              <article className="landing-feature-card">
                <div
                  className="rounded-3 d-inline-flex align-items-center justify-content-center mb-3"
                  style={{
                    width: 44,
                    height: 44,
                    backgroundColor: "var(--ph-primary-light)",
                    color: "var(--ph-primary)",
                  }}
                  aria-hidden="true"
                >
                  <FiUsers size={20} />
                </div>
                <h3 className="fw-bold mb-2 fs-5">Connect</h3>
                <p className="mb-0" style={{ color: "var(--ph-text-secondary)", lineHeight: 1.6, fontSize: "0.925rem" }}>
                  Build meaningful interactions with people who care about the craft.
                </p>
              </article>
            </Col>
          </Row>
        </section>

        {/* Values */}
        <section
          className="p-4 p-md-5 rounded-4 mb-4 border text-center"
          style={{ backgroundColor: "var(--ph-bg-secondary)", borderColor: "var(--ph-border)" }}
        >
          <div className="mx-auto" style={{ maxWidth: "640px" }}>
            <h2 className="ph-section-title mb-3" style={{ fontSize: "1.25rem" }}>
              Community first, always
            </h2>
            <p className="mb-4" style={{ color: "var(--ph-text-secondary)", lineHeight: 1.65 }}>
              Be respectful, share original insights, credit creators, and engage in thoughtful collaboration.
            </p>
            <div
              className="d-flex align-items-center justify-content-center gap-3 gap-md-4 flex-wrap small fw-medium"
              style={{ color: "var(--ph-text-secondary)" }}
            >
              <span className="d-flex align-items-center gap-2">
                <FiCheckCircle className="text-primary" aria-hidden="true" /> Constructive dialogue
              </span>
              <span className="d-flex align-items-center gap-2">
                <FiCheckCircle className="text-primary" aria-hidden="true" /> Creator discovery
              </span>
              <span className="d-flex align-items-center gap-2">
                <FiCheckCircle className="text-primary" aria-hidden="true" /> Signal over noise
              </span>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-4 pb-2 border-top text-center small" style={{ borderColor: "var(--ph-border)" }}>
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
            <div className="d-flex align-items-center gap-2 fw-bold text-primary">
              <FiShare2 aria-hidden="true" /> PostHub
            </div>
            <div className="d-flex align-items-center gap-3">
              <Link to="/explore" className="text-decoration-none hover-primary" style={{ color: "var(--ph-text-secondary)" }}>
                Explore
              </Link>
              <Link to="/login" className="text-decoration-none hover-primary" style={{ color: "var(--ph-text-secondary)" }}>
                Sign In
              </Link>
              <Link to="/signup" className="text-decoration-none hover-primary" style={{ color: "var(--ph-text-secondary)" }}>
                Join
              </Link>
            </div>
          </div>
          <p className="mb-0" style={{ fontSize: "12px", color: "var(--ph-text-muted)" }}>
            &copy; {new Date().getFullYear()} PostHub. Built for authentic creator and developer communities.
          </p>
        </footer>
      </Container>
    </main>
  );
}
