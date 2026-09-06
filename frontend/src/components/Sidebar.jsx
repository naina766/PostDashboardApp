import React, { useState, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { Card, Button } from "react-bootstrap";
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
  FiBell
} from "react-icons/fi";
import { useUser } from "../context/UserContext";
import { useToast } from "../context/ToastContext";
import { getSuggestions, followUser, unfollowUser } from "../services/users";
import { getTrending } from "../services/explore";
import { getInitials } from "../utils/initials";

export function LeftSidebar() {
  const { user } = useUser();
  if (!user) return null;

  const isAdminOrMod = ["admin", "moderator"].includes(user.role);

  return (
    <aside className="ph-left-sidebar d-none d-lg-flex flex-column sticky-top" style={{ top: "80px" }}>
      <div className="ph-left-sidebar-card">
        {/* User Profile Mini Header */}
        <Link
          to={`/profile/${user.username || ""}`}
          className="ph-sidebar-profile"
          title="View your profile"
          aria-label="View your profile"
        >
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="rounded-circle object-fit-cover flex-shrink-0"
              style={{ width: 40, height: 40 }}
            />
          ) : (
            <div
              className="post-author-avatar rounded-circle flex-shrink-0 d-flex align-items-center justify-content-center fw-bold"
              style={{ width: 40, height: 40, fontSize: "1rem" }}
              aria-hidden="true"
            >
              {getInitials(user.name)}
            </div>
          )}
          <div className="overflow-hidden">
            <div className="fw-semibold text-truncate small">{user.name}</div>
            <div className="text-muted text-truncate" style={{ fontSize: "0.8rem" }}>
              @{user.username}
            </div>
          </div>
        </Link>

        {/* Primary Application Navigation */}
        <nav className="ph-sidebar-nav" aria-label="Main Navigation">
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) =>
              `ph-sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <FiHome size={18} />
            <span>Home Feed</span>
          </NavLink>

          <NavLink
            to="/explore"
            className={({ isActive }) =>
              `ph-sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <FiCompass size={18} />
            <span>Explore</span>
          </NavLink>

          <NavLink
            to="/notifications"
            className={({ isActive }) =>
              `ph-sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <FiBell size={18} />
            <span>Notifications</span>
          </NavLink>

          <NavLink
            to="/saved"
            className={({ isActive }) =>
              `ph-sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <FiBookmark size={18} />
            <span>Saved Posts</span>
          </NavLink>

          <NavLink
            to="/creator-analytics"
            className={({ isActive }) =>
              `ph-sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <FiBarChart2 size={18} />
            <span>Creator Analytics</span>
          </NavLink>

          <NavLink
            to={`/profile/${user.username || ""}`}
            className={({ isActive }) =>
              `ph-sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <FiUsers size={18} />
            <span>My Profile</span>
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `ph-sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <FiSettings size={18} />
            <span>Settings</span>
          </NavLink>

          {isAdminOrMod && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `ph-sidebar-link ph-admin-link ${isActive ? "active" : ""}`
              }
            >
              <FiShield size={18} />
              <span>Admin Console</span>
            </NavLink>
          )}
        </nav>

        {/* Create Post CTA */}
        <div className="pt-2.5 mt-1 border-top">
          <Button
            as={Link}
            to="/create-post"
            className="ph-sidebar-create-btn w-100"
            aria-label="Create a new post"
          >
            <FiPlusSquare size={17} />
            <span>Create Post</span>
          </Button>
        </div>
      </div>
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
  const [trendingError, setTrendingError] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState(false);
  const [followingMap, setFollowingMap] = useState({});

  const loadWidgets = async () => {
    setLoading(true);
    setTrendingError(false);
    setSuggestionsError(false);

    try {
      const [trendRes, suggRes] = await Promise.allSettled([
        getTrending(),
        getSuggestions(4),
      ]);

      if (trendRes.status === "fulfilled" && trendRes.value.data?.data) {
        const data = trendRes.value.data.data;
        setTrendingTags(data.trendingHashtags || (Array.isArray(data) ? data : []));
      } else {
        setTrendingError(true);
      }

      if (suggRes.status === "fulfilled" && suggRes.value.data?.data) {
        setSuggestions(suggRes.value.data.data || []);
      } else {
        setSuggestionsError(true);
      }
    } catch {
      setTrendingError(true);
      setSuggestionsError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWidgets();
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
    <div className="ph-right-widgets d-flex flex-column gap-3 sticky-top" style={{ top: "80px" }}>
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
          <div className="d-flex flex-column gap-2 py-1">
            <div className="skeleton" style={{ height: "24px", width: "75%" }}></div>
            <div className="skeleton" style={{ height: "24px", width: "90%" }}></div>
            <div className="skeleton" style={{ height: "24px", width: "65%" }}></div>
            <div className="skeleton" style={{ height: "24px", width: "80%" }}></div>
          </div>
        ) : trendingError ? (
          <div className="py-3 text-center">
            <p className="small text-muted mb-2">Unable to load trending topics.</p>
            <Button
              size="sm"
              variant="outline-primary"
              className="rounded-pill px-3 py-1 small fw-medium"
              onClick={loadWidgets}
            >
              Retry
            </Button>
          </div>
        ) : trendingTags.length === 0 ? (
          <div className="py-3 text-center">
            <div className="text-muted mb-1 opacity-75">
              <FiTrendingUp size={22} />
            </div>
            <div className="small fw-semibold text-body mb-0.5">No trending topics yet</div>
            <p className="text-muted mb-0" style={{ fontSize: "11.5px" }}>
              Popular topics will appear here as the community grows.
            </p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-1.5">
            {trendingTags.slice(0, 5).map((item, idx) => {
              const tagName = typeof item === "string" ? item : item.tag || item.name;
              const count = typeof item === "object" ? item.count : null;
              return (
                <div
                  key={idx}
                  role="button"
                  onClick={() => navigate(`/explore?tag=${encodeURIComponent(tagName)}`)}
                  className="ph-trending-item d-flex align-items-center justify-content-between p-1.5 rounded-2 hover-bg cursor-pointer"
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
            <div className="d-flex flex-column gap-2.5 py-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="d-flex align-items-center gap-2">
                  <div className="skeleton skeleton-avatar" style={{ width: 34, height: 34 }}></div>
                  <div className="flex-grow-1">
                    <div className="skeleton mb-1" style={{ height: 12, width: "65%" }}></div>
                    <div className="skeleton" style={{ height: 10, width: "40%" }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : suggestionsError ? (
            <div className="py-3 text-center">
              <p className="small text-muted mb-2">Unable to load recommendations.</p>
              <Button
                size="sm"
                variant="outline-primary"
                className="rounded-pill px-3 py-1 small fw-medium"
                onClick={loadWidgets}
              >
                Retry
              </Button>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="py-3 text-center">
              <div className="text-muted mb-1 opacity-75">
                <FiUsers size={22} />
              </div>
              <div className="small fw-semibold text-body mb-0.5">No recommendations right now</div>
              <p className="text-muted mb-0" style={{ fontSize: "11.5px" }}>
                New creators will appear here as members join PostHub.
              </p>
            </div>
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
                          style={{ width: "34px", height: "34px", fontSize: "11px" }}
                          aria-hidden="true"
                        >
                          {getInitials(creator.name)}
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
                      className={`ph-follow-btn rounded-pill px-2.5 py-0.5 small d-flex align-items-center gap-1 flex-shrink-0 ${isFollowing ? "is-following" : ""}`}
                      style={{ fontSize: "12px" }}
                    >
                      {isFollowing ? (
                        <FiUserCheck size={12} />
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

      {/* 3. Community Highlights & Guidelines Card */}
      <Card className="border-0 shadow-sm rounded-4 p-3 bg-card">
        <h6 className="fw-bold mb-2 d-flex align-items-center gap-1.5 fs-6 text-body">
          <FiShield className="text-primary" /> Community Guidelines
        </h6>
        <div className="small text-muted d-flex flex-column gap-1.5 mb-2.5" style={{ fontSize: "12px" }}>
          <div className="d-flex align-items-baseline gap-1.5">
            <span className="text-primary fw-bold">•</span>
            <span>Be respectful, inclusive, and constructive</span>
          </div>
          <div className="d-flex align-items-baseline gap-1.5">
            <span className="text-primary fw-bold">•</span>
            <span>Share original work, ideas, and insights</span>
          </div>
          <div className="d-flex align-items-baseline gap-1.5">
            <span className="text-primary fw-bold">•</span>
            <span>Avoid spam, misleading claims, and self-promotion</span>
          </div>
          <div className="d-flex align-items-baseline gap-1.5">
            <span className="text-primary fw-bold">•</span>
            <span>Support fellow creators with thoughtful feedback</span>
          </div>
        </div>
        <div className="pt-2 border-top d-flex align-items-center justify-content-between">
          <span className="text-muted" style={{ fontSize: "11px" }}>PostHub Social</span>
          <Link to="/explore" className="small text-decoration-none text-primary fw-medium" style={{ fontSize: "11px" }}>
            Explore Hub →
          </Link>
        </div>
      </Card>
    </div>
  );
}
