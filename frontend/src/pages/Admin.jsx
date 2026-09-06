import React, { useState, useEffect, useCallback } from "react";
import { Container, Row, Col, Card, Table, Button, Badge, Form, InputGroup, Spinner, Nav } from "react-bootstrap";
import { 
  FiShield, 
  FiUsers, 
  FiFileText, 
  FiAlertTriangle, 
  FiSearch, 
  FiCheckCircle, 
  FiXCircle, 
  FiLock, 
  FiUnlock 
} from "react-icons/fi";
import { getAdminStats, getAdminUsers, toggleUserSuspension, updateUserRole } from "../services/admin";
import { getReports, updateReportStatus } from "../services/reports";
import { useUser } from "../context/UserContext";
import { useToast } from "../context/ToastContext";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";

export default function Admin() {
  const { user } = useUser();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState("overview"); // overview, reports, users
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [userSearch, setUserSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [actionPending, setActionPending] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, reportsRes, usersRes] = await Promise.all([
        getAdminStats(),
        getReports({ status: "ALL", limit: 30 }),
        getAdminUsers({ limit: 30 }),
      ]);
      setStats(statsRes.data?.data);
      setReports(reportsRes.data?.data?.reports || []);
      setUsersList(usersRes.data?.data?.users || []);
    } catch {
      showToast("Failed to load admin data.", "danger");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle User Search
  const handleUserSearch = async (e) => {
    e.preventDefault();
    try {
      const res = await getAdminUsers({ search: userSearch });
      setUsersList(res.data?.data?.users || []);
    } catch {
      showToast("User search failed.", "danger");
    }
  };

  // Toggle Account Suspension
  const handleToggleSuspend = async (userId) => {
    setActionPending(true);
    try {
      const res = await toggleUserSuspension(userId);
      setUsersList((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isSuspended: res.data?.data?.isSuspended } : u))
      );
      showToast(res.data?.message || "User status updated", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update suspension.", "danger");
    } finally {
      setActionPending(false);
    }
  };

  // Change Role
  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      setUsersList((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
      showToast("Role updated", "success", 1500);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to change role.", "danger");
    }
  };

  // Update Report Status
  const handleReportStatus = async (reportId, status) => {
    try {
      await updateReportStatus(reportId, status);
      setReports((prev) =>
        prev.map((r) => (r._id === reportId ? { ...r, status } : r))
      );
      showToast(`Report marked as ${status}`, "success", 1500);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update report.", "danger");
    }
  };

  if (loading) {
    return (
      <main className="py-5">
        <LoadingSpinner message="Loading administration console..." />
      </main>
    );
  }

  if (!user || !["admin", "moderator"].includes(user.role)) {
    return (
      <Container className="py-5 text-center">
        <EmptyState
          title="Access Restricted"
          description="You do not have permission to view the PostHub administration dashboard."
          actionText="Back to Feed"
          actionLink="/dashboard"
        />
      </Container>
    );
  }

  return (
    <main className="admin-page py-4">
      <Container style={{ maxWidth: "980px" }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="fw-bold mb-1 d-flex align-items-center gap-2">
              <FiShield className="text-warning" /> PostHub Administration Dashboard
            </h4>
            <span className="text-muted small">Platform governance, telemetry, and moderation tools</span>
          </div>
          <Badge bg="warning" text="dark" className="px-3 py-1.5 fs-6 text-uppercase fw-semibold">
            {user.role} Console
          </Badge>
        </div>

        {/* Admin Navigation Tabs */}
        <Nav variant="pills" className="mb-4 gap-2 bg-light p-1 rounded-3">
          <Nav.Item>
            <Nav.Link
              active={activeTab === "overview"}
              onClick={() => setActiveTab("overview")}
              className="cursor-pointer py-1.5 px-3 small"
            >
              Overview & KPIs
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              active={activeTab === "reports"}
              onClick={() => setActiveTab("reports")}
              className="cursor-pointer py-1.5 px-3 small d-flex align-items-center gap-1.5"
            >
              Moderation Reports
              {stats?.pendingReports > 0 && (
                <Badge bg="danger" pill>
                  {stats.pendingReports}
                </Badge>
              )}
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              active={activeTab === "users"}
              onClick={() => setActiveTab("users")}
              className="cursor-pointer py-1.5 px-3 small"
            >
              User Management
            </Nav.Link>
          </Nav.Item>
        </Nav>

        {/* 1. Overview Tab */}
        {activeTab === "overview" && stats && (
          <div>
            <Row className="g-3 mb-4">
              <Col xs={6} md={3}>
                <Card className="p-3 border shadow-sm text-center">
                  <div className="text-muted small mb-1 d-flex align-items-center justify-content-center gap-1">
                    <FiUsers /> Total Users
                  </div>
                  <h3 className="fw-bold mb-0 text-primary">{stats.totalUsers}</h3>
                  <span className="text-muted small mt-1">+{stats.usersLast24h || 0} today</span>
                </Card>
              </Col>

              <Col xs={6} md={3}>
                <Card className="p-3 border shadow-sm text-center">
                  <div className="text-muted small mb-1 d-flex align-items-center justify-content-center gap-1">
                    <FiFileText /> Total Posts
                  </div>
                  <h3 className="fw-bold mb-0 text-success">{stats.totalPosts}</h3>
                  <span className="text-muted small mt-1">+{stats.postsLast24h || 0} today</span>
                </Card>
              </Col>

              <Col xs={6} md={3}>
                <Card className="p-3 border shadow-sm text-center">
                  <div className="text-muted small mb-1 d-flex align-items-center justify-content-center gap-1">
                    <FiAlertTriangle className="text-danger" /> Total Reports
                  </div>
                  <h3 className="fw-bold mb-0 text-danger">{stats.totalReports}</h3>
                  <span className="text-muted small mt-1">all time</span>
                </Card>
              </Col>

              <Col xs={6} md={3}>
                <Card className="p-3 border shadow-sm text-center">
                  <div className="text-muted small mb-1 d-flex align-items-center justify-content-center gap-1">
                    <FiShield className="text-warning" /> Pending Reports
                  </div>
                  <h3 className="fw-bold mb-0 text-warning">{stats.pendingReports}</h3>
                  <span className="text-muted small mt-1">needs review</span>
                </Card>
              </Col>
            </Row>

            <Card className="p-4 border shadow-sm">
              <h6 className="fw-bold mb-3">Moderation Guidelines & System Safety</h6>
              <p className="text-muted small mb-2">
                All actions taken within this console are audited. When reviewing reports, check context and evaluate against community standards regarding harassment, hate speech, spam, and safety.
              </p>
              <div className="d-flex gap-2 mt-2">
                <Button variant="outline-primary" size="sm" onClick={() => setActiveTab("reports")}>
                  Review {stats.pendingReports} Pending Reports
                </Button>
                <Button variant="outline-secondary" size="sm" onClick={() => setActiveTab("users")}>
                  Manage Users
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* 2. Reports Tab */}
        {activeTab === "reports" && (
          <Card className="p-4 border shadow-sm">
            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <FiAlertTriangle className="text-danger" /> Safety Reports & Flags
            </h6>

            {reports.length === 0 ? (
              <p className="text-muted small mb-0">No reports found.</p>
            ) : (
              <div className="table-responsive">
                <Table hover align="middle" className="mb-0 small">
                  <thead>
                    <tr className="text-muted">
                      <th>Type</th>
                      <th>Reason</th>
                      <th>Reporter</th>
                      <th>Details</th>
                      <th>Status</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((r) => (
                      <tr key={r._id}>
                        <td>
                          <Badge bg="secondary">{r.targetType}</Badge>
                        </td>
                        <td className="fw-semibold text-danger">{r.reason}</td>
                        <td>{r.reporter?.name || "Member"}</td>
                        <td>
                          <span className="text-truncate d-inline-block" style={{ maxWidth: 200 }}>
                            {r.details || "No additional text provided"}
                          </span>
                        </td>
                        <td>
                          <Badge bg={r.status === "RESOLVED" ? "success" : r.status === "PENDING" ? "warning" : "secondary"}>
                            {r.status}
                          </Badge>
                        </td>
                        <td className="text-end">
                          <div className="d-flex justify-content-end gap-1">
                            {r.status === "PENDING" && (
                              <>
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  className="py-0.5 px-2"
                                  onClick={() => handleReportStatus(r._id, "RESOLVED")}
                                  title="Resolve report"
                                >
                                  <FiCheckCircle />
                                </Button>
                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  className="py-0.5 px-2"
                                  onClick={() => handleReportStatus(r._id, "DISMISSED")}
                                  title="Dismiss report"
                                >
                                  <FiXCircle />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card>
        )}

        {/* 3. Users Management Tab */}
        {activeTab === "users" && (
          <Card className="p-4 border shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0">User Governance</h6>
              <Form onSubmit={handleUserSearch} style={{ maxWidth: 260 }}>
                <InputGroup size="sm">
                  <Form.Control
                    type="text"
                    placeholder="Search name, username..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                  <Button variant="outline-secondary" type="submit">
                    <FiSearch />
                  </Button>
                </InputGroup>
              </Form>
            </div>

            <div className="table-responsive">
              <Table hover align="middle" className="mb-0 small">
                <thead>
                  <tr className="text-muted">
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th className="text-end">Admin Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="fw-semibold">{u.name}</div>
                          <span className="text-muted">(@{u.username})</span>
                        </div>
                      </td>
                      <td className="text-muted">{u.email}</td>
                      <td>
                        {user.role === "admin" ? (
                          <Form.Select
                            size="sm"
                            value={u.role}
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            style={{ width: 110 }}
                            disabled={u._id === user._id}
                          >
                            <option value="user">User</option>
                            <option value="moderator">Moderator</option>
                            <option value="admin">Admin</option>
                          </Form.Select>
                        ) : (
                          <Badge bg="info">{u.role}</Badge>
                        )}
                      </td>
                      <td>
                        <Badge bg={u.isSuspended ? "danger" : "success"}>
                          {u.isSuspended ? "Suspended" : "Active"}
                        </Badge>
                      </td>
                      <td className="text-end">
                        {user.role === "admin" && u._id !== user._id && (
                          <Button
                            variant={u.isSuspended ? "outline-success" : "outline-danger"}
                            size="sm"
                            className="py-0.5 px-2.5"
                            onClick={() => handleToggleSuspend(u._id)}
                            disabled={actionPending}
                          >
                            {u.isSuspended ? (
                              <>
                                <FiUnlock size={12} /> Restore
                              </>
                            ) : (
                              <>
                                <FiLock size={12} /> Suspend
                              </>
                            )}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card>
        )}
      </Container>
    </main>
  );
}
