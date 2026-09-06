import React, { useState, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { Card, Button, Badge, Spinner } from "react-bootstrap";
import {
  FiHome,
  FiCompass,
  FiUsers,
  FiBookmark,
  FiBarChart2,
  FiSettings,
  FiShield,
  FiPlusSquare,
  FiTrendingUp,
  FiUserPlus,
  FiUserCheck,
  FiActivity,
} from "react-icons/fi";
import { useUser } from "../context/UserContext";
import { useToast } from "../context/ToastContext";
import { getSuggestions, followUser, unfollowUser } from "../services/users";
import { getTrending } from "../services/explore";

export function LeftSidebar() {
  const { user } = useUser();
  if (!user) return null;

  const isAdminOrMod = ["admin", "moderator"].includes(user.role);

  return (
    <aside className="ph-left-sidebar d-none d-lg-flex flex-column gap-3 sticky-top" style={{ top: "80px" }}>
      <Card className="border-0 shadow-sm rounded-4 p-3 bg-card">
        <nav className="d-flex flex-column gap-1" aria-label="Main Navigation">
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) =>
              `ph-sidebar-link d-flex align-items-center gap-2.5 px-3 py-2.5 rounded-3 text-decoration-none fw-medium ${
                isActive ? "active text-primary bg-primary-subtle" : "text-body hover-bg"
              }`
            }
          >
            <FiHome size={18} />
            <span>Home Feed</span>
          </NavLink>

          <NavLink
            to="/explore"
            className={({ isActive }) =>
              `ph-sidebar-link d-flex align-items-center gap-2.5 px-3 py-2.5 rounded-3 text-decoration-none fw-medium ${
                isActive ? "active text-primary bg-primary-subtle" : "text-body hover-bg"
              }`
            }
          >
            <FiCompass size={18} />
            <span>Explore</span>
          </NavLink>

          <NavLink
            to="/saved"
            className={({ isActive }) =>
              `ph-sidebar-link d-flex align-items-center gap-2.5 px-3 py-2.5 rounded-3 text-decoration-none fw-medium ${
                isActive ? "active text-primary bg-primary-subtle" : "text-body hover-bg"
              }`
            }
          >
            <FiBookmark size={18} />
            <span>Saved Posts</span>
          </NavLink>

          <NavLink
            to="/creator"
            className={({ isActive }) =>
              `ph-sidebar-link d-flex align-items-center gap-2.5 px-3 py-2.5 rounded-3 text-decoration-none fw-medium ${
                isActive ? "active text-primary bg-primary-subtle" : "text-body hover-bg"
              }`
            }
          >
            <FiBarChart2 size={18} />
            <span>Creator Analytics</span>
          </NavLink>

          <NavLink
            to={`/profile/${user.username || ""}`}
            className={({ isActive }) =>
              `ph-sidebar-link d-flex align-items-center gap-2.5 px-3 py-2.5 rounded-3 text-decoration-none fw-medium ${
                isActive ? "active text-primary bg-primary-subtle" : "text-body hover-bg"
              }`
            }
          >
            <FiUsers size={18} />
            <span>My Profile</span>
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `ph-sidebar-link d-flex align-items-center gap-2.5 px-3 py-2.5 rounded-3 text-decoration-none fw-medium ${
                isActive ? "active text-primary bg-primary-subtle" : "text-body hover-bg"
              }`
            }
          >
            <FiSettings size={18} />
            <span>Settings</span>
          </NavLink>

          {isAdminOrMod && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `ph-sidebar-link d-flex align-items-center gap-2.5 px-3 py-2.5 rounded-3 text-decoration-none fw-medium text-warning ${
                  isActive ? "active bg-warning-subtle" : "hover-bg"
                }`
              }
            >
              <FiShield size={18} />
              <span>Admin Console</span>
            </NavLink>
          )}
        </nav>

        <div className="pt-3 mt-2 border-top">
          <Button
            as={Link}
            to="/create-post"
            variant="primary"
            className="btn-primary-custom w-100 d-flex align-items-center justify-content-center gap-2 py-2 rounded-pill shadow-sm"
          >
            <FiPlusSquare size={16} />
            <span>Create Post</span>
          </Button>
        </div>
      </Card>
    </aside>
  );
}

export function RightWidgets() {
  const { user } = useUser();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [trendingTags, setTrendingTags] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followingMap, setFollowingMap] = useState({});

  useEffect(() => {
    let isMounted = true;
    const loadWidgets = async () => {
      try {
        const [trendRes, suggRes] = await Promise.allSettled([
          getTrending(),
          getSuggestions(4),
        ]);

        if (isMounted) {
          if (trendRes.status === "fulfilled" && trendRes.value.data?.data) {
            const data = trendRes.value.data.data;
            setTrendingTags(data.trendingHashtags || (Array.isArray(data) ? data : []));
          }
          if (suggRes.status === "fulfilled" && suggRes.value.data?.data) {
            setSuggestions(suggRes.value.data.data || []);
          }
        }
      } catch {
        // Silently tolerate widget errors
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadWidgets();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleFollowToggle = async (creatorId, creatorName) => {
    const isCurrentlyFollowing = Boolean(followingMap[creatorId]);
    setFollowingMap((prev) => ({ ...prev, [creatorId]: !isCurrentlyFollowing }));

    try {
      if (isCurrentlyFollowing) {
        await unfollowUser(creatorId);
        showToast(`Unfollowed ${creatorName}`, "info", 1500);
      } else {
        await followUser(creatorId);
        showToast(`Following ${creatorName}`, "success", 1500);
      }
    } catch {
      setFollowingMap((prev) => ({ ...prev, [creatorId]: isCurrentlyFollowing }));
      showToast("Failed to update follow status", "danger");
    }
  };

  return (
    <aside className="ph-right-widgets d-none d-xl-flex flex-column gap-3 sticky-top" style={{ top: "80px" }}>
      {/* 1. Trending Hashtags Widget */}
      <Card className="border-0 shadow-sm rounded-4 p-3 bg-card">
        <div className="d-flex align-items-center justify-content-between mb-2.5 pb-2 border-bottom">
          <h6 className="fw-bold mb-0 d-flex align-items-center gap-1.5 fs-6">
            <FiTrendingUp className="text-primary" /> Trending Topics
          </h6>
          <Link to="/explore" className="small text-decoration-none text-muted hover-primary">
            View All
          </Link>
        </div>

        {loading ? (
          <div className="py-3 text-center">
            <Spinner size="sm" animation="border" variant="secondary" />
          </div>
        ) : trendingTags.length === 0 ? (
          <p className="small text-muted mb-0 py-2">No trending hashtags today.</p>
        ) : (
          <div className="d-flex flex-column gap-2">
            {trendingTags.slice(0, 5).map((item, idx) => {
              const tagName = typeof item === "string" ? item : item.tag || item.name;
              const count = typeof item === "object" ? item.count : null;
              return (
                <div
                  key={idx}
                  role="button"
                  onClick={() => navigate(`/explore?tag=${encodeURIComponent(tagName)}`)}
                  className="d-flex align-items-center justify-content-between p-1.5 rounded-2 hover-bg cursor-pointer"
                >
                  <span className="small fw-semibold text-primary">#{tagName}</span>
                  {count && <span className="small text-muted font-monospace">{count} posts</span>}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* 2. Suggested Creators Widget */}
      {user && (
        <Card className="border-0 shadow-sm rounded-4 p-3 bg-card">
          <div className="d-flex align-items-center justify-content-between mb-2.5 pb-2 border-bottom">
            <h6 className="fw-bold mb-0 d-flex align-items-center gap-1.5 fs-6">
              <FiUsers className="text-success" /> Who to Follow
            </h6>
          </div>

          {loading ? (
            <div className="py-3 text-center">
              <Spinner size="sm" animation="border" variant="secondary" />
            </div>
          ) : suggestions.length === 0 ? (
            <p className="small text-muted mb-0 py-2">No recommendations right now.</p>
          ) : (
            <div className="d-flex flex-column gap-2.5">
              {suggestions.map((creator) => {
                const isFollowing = Boolean(followingMap[creator._id]);
                return (
                  <div key={creator._id} className="d-flex align-items-center justify-content-between gap-2">
                    <Link
                      to={`/profile/${creator.username}`}
                      className="d-flex align-items-center gap-2 text-decoration-none text-body overflow-hidden"
                    >
                      {creator.avatar ? (
                        <img
                          src={creator.avatar}
                          alt={creator.name}
                          className="rounded-circle object-fit-cover flex-shrink-0"
                          style={{ width: "34px", height: "34px" }}
                        />
                      ) : (
                        <div
                          className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                          style={{ width: "34px", height: "34px", fontSize: "13px" }}
                        >
                          {creator.name ? creator.name[0].toUpperCase() : "U"}
                        </div>
                      )}
                      <div className="overflow-hidden">
                        <div className="small fw-bold text-truncate" style={{ maxWidth: "110px" }}>
                          {creator.name}
                        </div>
                        <div className="text-muted small text-truncate" style={{ maxWidth: "110px", fontSize: "11px" }}>
                          @{creator.username}
                        </div>
                      </div>
                    </Link>

                    <Button
                      variant={isFollowing ? "outline-secondary" : "outline-primary"}
                      size="sm"
                      onClick={() => handleFollowToggle(creator._id, creator.name)}
                      className="rounded-pill px-2.5 py-0.5 small d-flex align-items-center gap-1 flex-shrink-0"
                      style={{ fontSize: "12px" }}
                    >
                      {isFollowing ? (
                        <>
                          <FiUserCheck size={12} />
                        </>
                      ) : (
                        <>
                          <FiUserPlus size={12} /> Follow
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* 3. Community Highlights Card */}
      <Card className="border-0 shadow-sm rounded-4 p-3 bg-card">
        <h6 className="fw-bold mb-1.5 d-flex align-items-center gap-1.5 fs-6 text-body">
          <FiActivity className="text-info" /> Community Telemetry
        </h6>
        <p className="text-muted small mb-2" style={{ fontSize: "12px" }}>
          Explore deterministic rankings, real-time hashtag trends, and creator analytics on PostHub 3.0.
        </p>
        <div className="d-flex flex-wrap gap-1">
          <Badge bg="light" text="dark" className="border small">#DeterministicRanking</Badge>
          <Badge bg="light" text="dark" className="border small">#ExplainableAI</Badge>
          <Badge bg="light" text="dark" className="border small">#MongoDBAtlas</Badge>
        </div>
      </Card>
    </aside>
  );
}
