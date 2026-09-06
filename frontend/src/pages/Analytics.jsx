import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, ProgressBar, Badge } from "react-bootstrap";
import { 
  FiBarChart2, 
  FiFileText, 
  FiHeart, 
  FiMessageSquare, 
  FiBookmark, 
  FiUsers, 
  FiActivity, 
  FiTrendingUp, 
  FiPieChart 
} from "react-icons/fi";
import { getCreatorAnalytics } from "../services/analytics";
import { useToast } from "../context/ToastContext";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";

export default function Analytics() {
  const { showToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const res = await getCreatorAnalytics();
        setData(res.data?.data);
      } catch {
        showToast("Failed to load analytics.", "danger");
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, [showToast]);

  if (loading) {
    return (
      <main className="py-5">
        <LoadingSpinner message="Calculating creator insights..." />
      </main>
    );
  }

  if (!data) {
    return (
      <Container className="py-5 text-center">
        <EmptyState title="No Analytics Available" description="Publish posts and interact with others to generate insights." />
      </Container>
    );
  }

  const {
    totalPosts,
    totalLikes,
    totalComments,
    totalSaves,
    engagementRate,
    followersCount,
    breakdown,
    topPosts,
    timeline,
  } = data;

  const totalFormatCount = (breakdown?.text || 0) + (breakdown?.image || 0) + (breakdown?.poll || 0) + (breakdown?.link || 0) || 1;
  const textPct = Math.round(((breakdown?.text || 0) / totalFormatCount) * 100);
  const imagePct = Math.round(((breakdown?.image || 0) / totalFormatCount) * 100);
  const pollPct = Math.round(((breakdown?.poll || 0) / totalFormatCount) * 100);
  const linkPct = Math.round(((breakdown?.link || 0) / totalFormatCount) * 100);

  return (
    <main className="analytics-page py-4">
      <Container style={{ maxWidth: "860px" }}>
        <div className="mb-4">
          <h4 className="fw-bold mb-1 d-flex align-items-center gap-2">
            <FiBarChart2 className="text-primary" /> Creator Analytics & Insights
          </h4>
          <p className="text-muted small mb-0">
            Real performance telemetry calculated from your community content.
          </p>
        </div>

        {/* Primary Metric KPI Cards */}
        <Row className="g-3 mb-4">
          <Col xs={6} md={3}>
            <Card className="p-3 border shadow-sm text-center">
              <div className="text-muted small d-flex align-items-center justify-content-center gap-1 mb-1">
                <FiFileText size={13} /> Total Posts
              </div>
              <h3 className="fw-bold mb-0 text-primary">{totalPosts}</h3>
            </Card>
          </Col>

          <Col xs={6} md={3}>
            <Card className="p-3 border shadow-sm text-center">
              <div className="text-muted small d-flex align-items-center justify-content-center gap-1 mb-1">
                <FiHeart size={13} className="text-danger" /> Likes Received
              </div>
              <h3 className="fw-bold mb-0 text-danger">{totalLikes}</h3>
            </Card>
          </Col>

          <Col xs={6} md={3}>
            <Card className="p-3 border shadow-sm text-center">
              <div className="text-muted small d-flex align-items-center justify-content-center gap-1 mb-1">
                <FiMessageSquare size={13} className="text-info" /> Comments
              </div>
              <h3 className="fw-bold mb-0 text-info">{totalComments}</h3>
            </Card>
          </Col>

          <Col xs={6} md={3}>
            <Card className="p-3 border shadow-sm text-center">
              <div className="text-muted small d-flex align-items-center justify-content-center gap-1 mb-1">
                <FiBookmark size={13} className="text-warning" /> Saves
              </div>
              <h3 className="fw-bold mb-0 text-warning">{totalSaves}</h3>
            </Card>
          </Col>
        </Row>

        <Row className="g-4 mb-4">
          {/* Engagement Rate & Network */}
          <Col md={6}>
            <Card className="p-4 border shadow-sm h-100">
              <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <FiActivity className="text-success" /> Engagement Performance
              </h6>
              <div className="d-flex align-items-baseline gap-2 mb-2">
                <h2 className="fw-bold mb-0 text-success">{engagementRate}</h2>
                <span className="text-muted small">avg interactions / post</span>
              </div>
              <p className="text-muted small mb-3">
                Calculated deterministically from your likes, comments, and saves divided by total posts.
              </p>

              <div className="p-3 rounded-3 bg-light d-flex justify-content-around text-center">
                <div>
                  <div className="fw-bold text-body">{followersCount}</div>
                  <div className="text-muted small" style={{ fontSize: "11px" }}>Followers</div>
                </div>
                <div className="border-start"></div>
                <div>
                  <div className="fw-bold text-body">{data.followingCount}</div>
                  <div className="text-muted small" style={{ fontSize: "11px" }}>Following</div>
                </div>
                <div className="border-start"></div>
                <div>
                  <div className="fw-bold text-body">{totalLikes + totalComments}</div>
                  <div className="text-muted small" style={{ fontSize: "11px" }}>Reactions</div>
                </div>
              </div>
            </Card>
          </Col>

          {/* Post Formats Breakdown */}
          <Col md={6}>
            <Card className="p-4 border shadow-sm h-100">
              <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <FiPieChart className="text-primary" /> Content Format Mix
              </h6>
              <div className="d-flex flex-column gap-2 mb-3">
                <div>
                  <div className="d-flex justify-content-between small mb-1">
                    <span>Text Stories</span>
                    <span className="fw-bold">{breakdown?.text || 0} ({textPct}%)</span>
                  </div>
                  <ProgressBar variant="primary" now={textPct} style={{ height: 6 }} />
                </div>

                <div>
                  <div className="d-flex justify-content-between small mb-1">
                    <span>Images & Media</span>
                    <span className="fw-bold">{breakdown?.image || 0} ({imagePct}%)</span>
                  </div>
                  <ProgressBar variant="success" now={imagePct} style={{ height: 6 }} />
                </div>

                <div>
                  <div className="d-flex justify-content-between small mb-1">
                    <span>Community Polls</span>
                    <span className="fw-bold">{breakdown?.poll || 0} ({pollPct}%)</span>
                  </div>
                  <ProgressBar variant="warning" now={pollPct} style={{ height: 6 }} />
                </div>

                <div>
                  <div className="d-flex justify-content-between small mb-1">
                    <span>Link Shares</span>
                    <span className="fw-bold">{breakdown?.link || 0} ({linkPct}%)</span>
                  </div>
                  <ProgressBar variant="info" now={linkPct} style={{ height: 6 }} />
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Top Performing Posts Table */}
        <Card className="p-4 border shadow-sm mb-4">
          <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
            <FiTrendingUp className="text-danger" /> Top Performing Posts
          </h6>
          {topPosts && topPosts.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr className="text-muted small">
                    <th>Post</th>
                    <th>Type</th>
                    <th className="text-center">Likes</th>
                    <th className="text-center">Comments</th>
                    <th className="text-center">Saves</th>
                  </tr>
                </thead>
                <tbody>
                  {topPosts.map((post) => (
                    <tr key={post._id}>
                      <td>
                        <div className="fw-semibold small text-truncate" style={{ maxWidth: 280 }}>
                          {post.title || post.content || "Untitled"}
                        </div>
                      </td>
                      <td>
                        <Badge bg="light" text="dark" className="border small">
                          {post.postType}
                        </Badge>
                      </td>
                      <td className="text-center small text-danger fw-semibold">{post.likesCount || 0}</td>
                      <td className="text-center small text-primary fw-semibold">{post.commentsCount || 0}</td>
                      <td className="text-center small text-warning fw-semibold">{post.savesCount || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted small mb-0">No posts published yet.</p>
          )}
        </Card>

        {/* 6-Month Timeline */}
        {timeline && timeline.length > 0 && (
          <Card className="p-4 border shadow-sm">
            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <FiUsers className="text-secondary" /> Activity History (Monthly)
            </h6>
            <div className="d-flex justify-content-between align-items-end gap-2 pt-3" style={{ height: 160 }}>
              {timeline.map((item, idx) => {
                const height = Math.min(100, Math.max(20, (item.count / Math.max(...timeline.map((t) => t.count))) * 100));
                return (
                  <div key={idx} className="d-flex flex-column align-items-center flex-grow-1">
                    <span className="small text-muted mb-1" style={{ fontSize: "11px" }}>{item.count}</span>
                    <div
                      className="bg-primary rounded-top w-100"
                      style={{ height: `${height}%`, minHeight: "15px", maxWidth: "45px" }}
                    />
                    <span className="small text-muted mt-2" style={{ fontSize: "11px" }}>
                      M{item._id.month}/{item._id.year}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </Container>
    </main>
  );
}
