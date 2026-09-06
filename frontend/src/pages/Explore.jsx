import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Container, Row, Col, Button, Badge, Spinner } from "react-bootstrap";
import { 
  FiSearch, 
  FiTag, 
  FiUsers, 
  FiTrendingUp, 
  FiUserPlus, 
  FiUserCheck, 
  FiCheckCircle,
  FiAlertCircle
} from "react-icons/fi";
import { getTrendingPosts, getTrendingHashtags, getPostsByHashtag, globalSearch } from "../services/explore";
import { getSuggestions, followUser, unfollowUser } from "../services/users";
import { useUser } from "../context/UserContext";
import { useToast } from "../context/ToastContext";
import PostCard from "../components/PostCard";
import PostSkeleton from "../components/PostSkeleton";
import EmptyState from "../components/EmptyState";
import PageHeader from "../components/PageHeader";

export default function Explore() {
  const { user: currentUser } = useUser();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialTag = searchParams.get("tag") || "";
  const initialQuery = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState(initialTag ? "hashtag" : "trending");
  const [currentTag, setCurrentTag] = useState(initialTag);

  const [trendingPosts, setTrendingPosts] = useState([]);
  const [trendingTags, setTrendingTags] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [searchResults, setSearchResults] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchTimeout = useRef(null);

  // Load trending hashtags and suggestions
  useEffect(() => {
    const loadSidebarData = async () => {
      try {
        const [tagsRes, usersRes] = await Promise.allSettled([
          getTrendingHashtags(8),
          currentUser ? getSuggestions(5) : Promise.resolve({ data: { data: [] } }),
        ]);
        if (tagsRes.status === "fulfilled") {
          setTrendingTags(tagsRes.value.data?.data || []);
        }
        if (usersRes.status === "fulfilled") {
          setSuggestedUsers(usersRes.value.data?.data || []);
        }
      } catch {
        // Silently ignore
      }
    };
    loadSidebarData();
  }, [currentUser]);

  // Load posts based on tab
  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      if (activeTab === "hashtag" && currentTag) {
        const res = await getPostsByHashtag(currentTag);
        setTrendingPosts(res.data?.data?.posts || []);
      } else {
        const res = await getTrendingPosts();
        setTrendingPosts(res.data?.data?.posts || []);
      }
    } catch {
      setError(true);
      setTrendingPosts([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentTag]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // Sync with URL param tag and q
  useEffect(() => {
    const urlTag = searchParams.get("tag");
    const urlQuery = searchParams.get("q");

    if (urlTag && urlTag !== currentTag) {
      setCurrentTag(urlTag);
      setActiveTab("hashtag");
    }

    if (urlQuery && urlQuery !== searchQuery) {
      setSearchQuery(urlQuery);
      setSearching(true);
      globalSearch(urlQuery.trim())
        .then((res) => {
          setSearchResults(res.data?.data || { users: [], posts: [], hashtags: [] });
        })
        .catch(() => {
          setSearchResults({ users: [], posts: [], hashtags: [] });
        })
        .finally(() => {
          setSearching(false);
        });
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // Server-side debounced search
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (!query.trim()) {
      setSearchResults(null);
      setSearching(false);
      return;
    }

    setSearching(true);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await globalSearch(query.trim());
        setSearchResults(res.data?.data || { users: [], posts: [], hashtags: [] });
      } catch {
        setSearchResults({ users: [], posts: [], hashtags: [] });
      } finally {
        setSearching(false);
      }
    }, 350);
  };

  const handleTagClick = (tag) => {
    setCurrentTag(tag);
    setActiveTab("hashtag");
    setSearchParams({ tag });
    setSearchResults(null);
    setSearchQuery("");
  };

  // Follow / unfollow in suggestions
  const handleToggleFollow = async (userId) => {
    if (!currentUser) return;
    try {
      const userObj = suggestedUsers.find((u) => u._id === userId);
      if (!userObj) return;

      if (userObj.isFollowing) {
        await unfollowUser(userId);
        setSuggestedUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, isFollowing: false } : u))
        );
        showToast(`Unfollowed @${userObj.username}`, "info", 1500);
      } else {
        await followUser(userId);
        setSuggestedUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, isFollowing: true } : u))
        );
        showToast(`Following @${userObj.username}`, "success", 1500);
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Action failed.", "danger");
    }
  };

  return (
    <main className="explore-page py-4 page-enter-animate">
      <Container style={{ maxWidth: "1200px" }}>
        {/* Unified Page Header */}
        <PageHeader
          title="Explore"
          description="Discover conversations, creators, and ideas worth following."
        />

        {/* Top Prominent Search Bar */}
        <div className="search-bar-wrapper d-flex align-items-center px-3 py-2 mb-4 mx-auto" style={{ maxWidth: "720px" }}>
          {searching ? (
            <Spinner size="sm" animation="border" variant="primary" style={{ width: 16, height: 16 }} className="me-2.5 flex-shrink-0" />
          ) : (
            <FiSearch className="text-muted me-2.5 flex-shrink-0" size={16} />
          )}
          <input
            type="text"
            placeholder="Search creators, topics, or hashtags..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-bar-input flex-grow-1 bg-transparent border-0 text-body"
            aria-label="Search creators, topics, or hashtags"
          />
          {searchQuery && (
            <button
              type="button"
              className="btn btn-sm text-muted p-0 border-0 ms-1 flex-shrink-0"
              onClick={() => {
                setSearchQuery("");
                setSearchResults(null);
              }}
              title="Clear search"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Compact Filter Chips Row */}
        {trendingTags.length > 0 && !searchResults && (
          <div className="d-flex align-items-center gap-2 overflow-x-auto pb-2 mb-4 mx-auto no-scrollbar" style={{ maxWidth: "720px" }}>
            <button
              type="button"
              className={`explore-filter-chip ${activeTab === "trending" && !currentTag ? "active" : ""}`}
              onClick={() => {
                setActiveTab("trending");
                setCurrentTag("");
                setSearchParams({});
              }}
            >
              All
            </button>
            {trendingTags.map((t) => (
              <button
                key={t.tag}
                type="button"
                className={`explore-filter-chip ${activeTab === "hashtag" && currentTag === t.tag ? "active" : ""}`}
                onClick={() => handleTagClick(t.tag)}
              >
                #{t.tag}
              </button>
            ))}
          </div>
        )}

        {/* Live Search Results View */}
        {searchResults && (
          <div className="search-results-overlay mx-auto mb-5" style={{ maxWidth: "780px" }}>
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2 text-body">
              <FiSearch className="text-primary" /> Search Results for "{searchQuery}"
            </h5>

            {/* Matching Users */}
            {searchResults.users && searchResults.users.length > 0 && (
              <div className="mb-4">
                <h6 className="text-muted text-uppercase small fw-bold mb-2">People</h6>
                <div className="row g-2.5">
                  {searchResults.users.map((u) => (
                    <div key={u._id} className="col-12 col-md-6">
                      <Link
                        to={`/profile/${u.username}`}
                        className="card p-3 h-100 text-decoration-none text-body hover-shadow border rounded-3 bg-card"
                      >
                        <div className="d-flex align-items-center gap-2.5">
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.name} className="rounded-circle object-fit-cover" style={{ width: 40, height: 40 }} />
                          ) : (
                            <div className="rounded-circle bg-primary text-white fw-bold d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                              {(u.name || "U")[0].toUpperCase()}
                            </div>
                          )}
                          <div className="overflow-hidden">
                            <div className="fw-semibold small text-truncate d-flex align-items-center gap-1">
                              {u.name} {u.isVerified && <FiCheckCircle className="text-primary" size={13} />}
                            </div>
                            <div className="text-muted small text-truncate" style={{ fontSize: "12px" }}>@{u.username}</div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Matching Hashtags */}
            {searchResults.hashtags && searchResults.hashtags.length > 0 && (
              <div className="mb-4">
                <h6 className="text-muted text-uppercase small fw-bold mb-2">Hashtags</h6>
                <div className="d-flex flex-wrap gap-2">
                  {searchResults.hashtags.map((h) => (
                    <Button
                      key={h.tag}
                      variant="outline-primary"
                      size="sm"
                      className="rounded-pill px-3 py-1 small fw-medium"
                      onClick={() => handleTagClick(h.tag)}
                    >
                      #{h.tag} <Badge bg="primary" pill className="ms-1.5">{h.count}</Badge>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Matching Posts */}
            {searchResults.posts && searchResults.posts.length > 0 && (
              <div className="d-flex flex-column gap-3">
                <h6 className="text-muted text-uppercase small fw-bold mb-0">Posts</h6>
                {searchResults.posts.map((post) => (
                  <PostCard key={post._id} post={post} currentUser={currentUser} />
                ))}
              </div>
            )}

            {searchResults.users?.length === 0 && searchResults.posts?.length === 0 && searchResults.hashtags?.length === 0 && (
              <EmptyState 
                title="No results found" 
                message={`Nothing matched "${searchQuery}". Try another keyword or explore trending topics.`}
                actionText="Explore Trending"
                actionLink="/explore"
              />
            )}
          </div>
        )}

        {/* Regular Explore Two-Column Layout */}
        {!searchResults && (
          <Row className="g-4">
            {/* Main Discovery Feed Column */}
            <Col lg={8}>
              {/* Unified Feed Navigation Control */}
              <div className="feed-tabs-container mb-3">
                <div className="feed-tabs-scroll" role="tablist" aria-label="Explore tabs">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "trending"}
                    className={`feed-tab-btn ${activeTab === "trending" ? "active" : ""}`}
                    onClick={() => {
                      setActiveTab("trending");
                      setCurrentTag("");
                      setSearchParams({});
                    }}
                  >
                    <FiTrendingUp size={15} /> <span>Trending Topics</span>
                  </button>
                  {currentTag && (
                    <button
                      type="button"
                      role="tab"
                      aria-selected={activeTab === "hashtag"}
                      className={`feed-tab-btn ${activeTab === "hashtag" ? "active" : ""}`}
                    >
                      <FiTag size={15} /> <span>#{currentTag}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Discovery Feed Stream */}
              {error ? (
                <div className="text-center py-5 px-3 rounded-4 bg-card border shadow-sm">
                  <div className="text-danger mb-2">
                    <FiAlertCircle size={36} />
                  </div>
                  <h5 className="fw-bold mb-1 text-body">Couldn't load Explore</h5>
                  <p className="text-muted small mb-3">Something went wrong while loading discovery content.</p>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="rounded-pill px-4"
                    onClick={loadPosts}
                  >
                    Try Again
                  </Button>
                </div>
              ) : loading ? (
                <div className="d-flex flex-column gap-3">
                  <PostSkeleton />
                  <PostSkeleton />
                  <PostSkeleton />
                </div>
              ) : trendingPosts.length === 0 ? (
                <EmptyState
                  title={currentTag ? `No posts with #${currentTag}` : "No trending posts right now"}
                  message="Be the first to share an insight about this topic with the community!"
                  actionText="Create Post"
                  actionLink="/create-post"
                />
              ) : (
                <div className="d-flex flex-column gap-3">
                  {trendingPosts.map((post) => (
                    <PostCard key={post._id} post={post} currentUser={currentUser} />
                  ))}
                </div>
              )}
            </Col>

            {/* Discovery Sidebar Widgets Column */}
            <Col lg={4}>
              {/* Trending Hashtags Widget */}
              <div className="bg-card p-3.5 rounded-4 border shadow-sm mb-4">
                <h6 className="fw-bold mb-3 d-flex align-items-center gap-2 text-body">
                  <FiTrendingUp className="text-primary" /> Trending Hashtags
                </h6>
                <div className="d-flex flex-column gap-1.5">
                  {trendingTags.length === 0 ? (
                    <p className="text-muted small mb-0">No trending topics yet.</p>
                  ) : (
                    trendingTags.map((tag) => (
                      <div
                        key={tag.tag}
                        className="d-flex justify-content-between align-items-center p-2 rounded-3 hover-bg cursor-pointer"
                        onClick={() => handleTagClick(tag.tag)}
                      >
                        <div>
                          <div className="fw-semibold small text-primary">#{tag.tag}</div>
                          <span className="text-muted" style={{ fontSize: "11px" }}>
                            {tag.count} {tag.count === 1 ? "post" : "posts"}
                          </span>
                        </div>
                        <Badge bg="primary-subtle" text="primary" className="border-0 px-2 py-1">
                          Trending
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Suggested Creators Widget */}
              {suggestedUsers.length > 0 && (
                <div className="bg-card p-3.5 rounded-4 border shadow-sm">
                  <h6 className="fw-bold mb-3 d-flex align-items-center gap-2 text-body">
                    <FiUsers className="text-primary" /> Popular Creators
                  </h6>
                  <div className="d-flex flex-column gap-2.5">
                    {suggestedUsers.map((u) => (
                      <div key={u._id} className="d-flex align-items-center justify-content-between gap-2">
                        <Link to={`/profile/${u.username}`} className="d-flex align-items-center gap-2 text-decoration-none text-body overflow-hidden">
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.name} className="rounded-circle object-fit-cover flex-shrink-0" style={{ width: 36, height: 36 }} />
                          ) : (
                            <div className="rounded-circle bg-primary text-white fw-bold d-flex align-items-center justify-content-center small flex-shrink-0" style={{ width: 36, height: 36 }}>
                              {(u.name || "U")[0].toUpperCase()}
                            </div>
                          )}
                          <div className="overflow-hidden">
                            <div className="fw-semibold small text-truncate">{u.name}</div>
                            <div className="text-muted small text-truncate" style={{ fontSize: "11px" }}>@{u.username}</div>
                          </div>
                        </Link>
                        <Button
                          variant={u.isFollowing ? "outline-secondary" : "outline-primary"}
                          size="sm"
                          className="rounded-pill py-0.5 px-2.5 small flex-shrink-0"
                          onClick={() => handleToggleFollow(u._id)}
                          aria-label={u.isFollowing ? `Unfollow ${u.name}` : `Follow ${u.name}`}
                        >
                          {u.isFollowing ? <FiUserCheck size={13} /> : <FiUserPlus size={13} />}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Col>
          </Row>
        )}
      </Container>
    </main>
  );
}
