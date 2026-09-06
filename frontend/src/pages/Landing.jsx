import React from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { 
  FiShare2, 
  FiArrowRight, 
  FiTrendingUp, 
  FiBarChart2, 
  FiShield, 
  FiCheckCircle, 
  FiCompass, 
  FiMessageSquare,
  FiZap,
  FiLock
} from "react-icons/fi";
import { useUser } from "../context/UserContext";

export default function Landing() {
  const { user } = useUser();

  return (
    <main className="landing-page py-5 page-enter-animate">
      <Container>
        {/* Hero Section */}
        <section className="text-center py-5 mx-auto" style={{ maxWidth: "860px" }}>
          <div className="d-inline-flex align-items-center gap-2 px-3 py-1.5 rounded-pill mb-4 border" style={{ backgroundColor: "var(--ph-primary-light)", borderColor: "rgba(37, 99, 235, 0.2)" }}>
            <FiZap className="text-primary" size={14} />
            <span className="small fw-semibold text-primary">Next-Gen Creator & Developer Community</span>
          </div>

          <h1 className="display-4 fw-bold mb-3 tracking-tight" style={{ color: "var(--ph-text)", letterSpacing: "-1.5px" }}>
            Connect. Create. <span style={{ color: "var(--ph-primary)" }}>Grow.</span>
          </h1>

          <p className="lead text-muted mb-4 mx-auto" style={{ maxWidth: "660px", fontSize: "1.15rem", lineHeight: 1.6 }}>
            PostHub is the modern social platform designed for builders, creators, and technologists. 
            Share ideas, track authentic audience engagement, and build meaningful connections without algorithmic noise.
          </p>

          <div className="d-flex align-items-center justify-content-center gap-3 flex-wrap mb-5">
            {user ? (
              <Button
                as={Link}
                to="/dashboard"
                size="lg"
                className="btn-primary-custom d-inline-flex align-items-center gap-2 px-4 py-2.5 rounded-pill shadow-sm"
              >
                Go to Your Feed <FiArrowRight />
              </Button>
            ) : (
              <>
                <Button
                  as={Link}
                  to="/signup"
                  size="lg"
                  className="btn-primary-custom d-inline-flex align-items-center gap-2 px-4 py-2.5 rounded-pill shadow-sm"
                >
                  Join PostHub Free <FiArrowRight />
                </Button>
                <Button
                  as={Link}
                  to="/login"
                  variant="outline-secondary"
                  size="lg"
                  className="d-inline-flex align-items-center gap-2 px-4 py-2.5 rounded-pill"
                >
                  Sign In
                </Button>
              </>
            )}
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-4 mb-5">
          <div className="text-center mb-5">
            <h2 className="fw-bold mb-2 fs-3" style={{ color: "var(--ph-text)" }}>Everything you need to share and connect</h2>
            <p className="text-muted small">Purpose-built features for productive, high-signal conversations.</p>
          </div>

          <Row className="g-4">
            <Col md={6} lg={4}>
              <Card className="h-100 p-4 border rounded-4 bg-card shadow-sm">
                <div className="rounded-3 p-2.5 d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 44, height: 44, backgroundColor: "var(--ph-primary-light)", color: "var(--ph-primary)" }}>
                  <FiCompass size={22} />
                </div>
                <h5 className="fw-bold mb-2">Discovery Engine</h5>
                <p className="text-muted small mb-0" style={{ lineHeight: 1.6 }}>
                  Explore trending hashtags, topics, and verified creators in real-time. Discover original perspectives across engineering and creative fields.
                </p>
              </Card>
            </Col>

            <Col md={6} lg={4}>
              <Card className="h-100 p-4 border rounded-4 bg-card shadow-sm">
                <div className="rounded-3 p-2.5 d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 44, height: 44, backgroundColor: "var(--ph-primary-light)", color: "var(--ph-primary)" }}>
                  <FiBarChart2 size={22} />
                </div>
                <h5 className="fw-bold mb-2">Creator Analytics</h5>
                <p className="text-muted small mb-0" style={{ lineHeight: 1.6 }}>
                  Track reach, engagement rates, bookmark frequency, and audience growth with genuine telemetry and transparent performance metrics.
                </p>
              </Card>
            </Col>

            <Col md={6} lg={4}>
              <Card className="h-100 p-4 border rounded-4 bg-card shadow-sm">
                <div className="rounded-3 p-2.5 d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 44, height: 44, backgroundColor: "var(--ph-primary-light)", color: "var(--ph-primary)" }}>
                  <FiShield size={22} />
                </div>
                <h5 className="fw-bold mb-2">Civil Community</h5>
                <p className="text-muted small mb-0" style={{ lineHeight: 1.6 }}>
                  Proactive moderation, report triage, and respectful community guidelines ensure high-quality, constructive discussions.
                </p>
              </Card>
            </Col>

            <Col md={6} lg={4}>
              <Card className="h-100 p-4 border rounded-4 bg-card shadow-sm">
                <div className="rounded-3 p-2.5 d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 44, height: 44, backgroundColor: "var(--ph-primary-light)", color: "var(--ph-primary)" }}>
                  <FiMessageSquare size={22} />
                </div>
                <h5 className="fw-bold mb-2">Rich Social Composer</h5>
                <p className="text-muted small mb-0" style={{ lineHeight: 1.6 }}>
                  Express insights seamlessly with image galleries, interactive polls, link previews, and draft auto-saving.
                </p>
              </Card>
            </Col>

            <Col md={6} lg={4}>
              <Card className="h-100 p-4 border rounded-4 bg-card shadow-sm">
                <div className="rounded-3 p-2.5 d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 44, height: 44, backgroundColor: "var(--ph-primary-light)", color: "var(--ph-primary)" }}>
                  <FiTrendingUp size={22} />
                </div>
                <h5 className="fw-bold mb-2">Dynamic Social Feed</h5>
                <p className="text-muted small mb-0" style={{ lineHeight: 1.6 }}>
                  Filter seamlessly between "For You", "Following", "Trending", and "Latest" feeds with quick sorting and double-click appreciation.
                </p>
              </Card>
            </Col>

            <Col md={6} lg={4}>
              <Card className="h-100 p-4 border rounded-4 bg-card shadow-sm">
                <div className="rounded-3 p-2.5 d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 44, height: 44, backgroundColor: "var(--ph-primary-light)", color: "var(--ph-primary)" }}>
                  <FiLock size={22} />
                </div>
                <h5 className="fw-bold mb-2">Privacy & Security</h5>
                <p className="text-muted small mb-0" style={{ lineHeight: 1.6 }}>
                  Fine-grained audience controls, user blocking, muting, session management, and JWT security protect your identity and peace of mind.
                </p>
              </Card>
            </Col>
          </Row>
        </section>

        {/* Community Values Section */}
        <section className="p-4 p-md-5 rounded-4 mb-5 border text-center" style={{ backgroundColor: "var(--ph-bg-secondary)" }}>
          <div className="mx-auto" style={{ maxWidth: "680px" }}>
            <h3 className="fw-bold mb-3" style={{ color: "var(--ph-text)" }}>Community First, Always</h3>
            <p className="text-muted mb-4" style={{ lineHeight: 1.65 }}>
              PostHub is guided by simple values: be respectful, share original insights, credit creators, and engage in thoughtful collaboration.
            </p>
            <div className="d-flex align-items-center justify-content-center gap-4 flex-wrap text-muted small fw-medium">
              <span className="d-flex align-items-center gap-1.5"><FiCheckCircle className="text-primary" /> Constructive Dialogue</span>
              <span className="d-flex align-items-center gap-1.5"><FiCheckCircle className="text-primary" /> Verified Creators</span>
              <span className="d-flex align-items-center gap-1.5"><FiCheckCircle className="text-primary" /> Zero Algorithm Traps</span>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-4 pb-2 border-top text-center text-muted small">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
            <div className="d-flex align-items-center gap-2 fw-bold text-primary">
              <FiShare2 /> PostHub
            </div>
            <div className="d-flex align-items-center gap-3">
              <Link to="/explore" className="text-muted text-decoration-none hover-primary">Explore</Link>
              <Link to="/login" className="text-muted text-decoration-none hover-primary">Sign In</Link>
              <Link to="/signup" className="text-muted text-decoration-none hover-primary">Register</Link>
            </div>
          </div>
          <p className="mb-0 text-muted" style={{ fontSize: "12px" }}>
            &copy; {new Date().getFullYear()} PostHub. Designed for authentic creator and developer community collaboration.
          </p>
        </footer>
      </Container>
    </main>
  );
}
