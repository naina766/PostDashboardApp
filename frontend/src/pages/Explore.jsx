import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Container, Row, Col, Form, InputGroup, Button, Badge, Spinner, Nav } from "react-bootstrap";
import { 
  FiSearch, 
  FiCompass, 
  FiTag, 
  FiUsers, 
  FiTrendingUp, 
  FiUserPlus, 
  FiUserCheck, 
  FiCheckCircle 
} from "react-icons/fi";
import { getTrendingPosts, getTrendingHashtags, getPostsByHashtag, globalSearch } from "../services/explore";
import { getSuggestions, followUser, unfollowUser } from "../services/users";
import { useUser } from "../context/UserContext";
import { useToast } from "../context/ToastContext";
import PostCard from "../components/PostCard";
import PostSkeleton from "../components/PostSkeleton";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";

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
  const [searching, setSearching] = useState(false);
  const searchTimeout = useRef(null);

  // Load trending hashtags and suggestions
  useEffect(() => {
    const loadSidebarData = async () => {
      try {
        const [tagsRes, usersRes] = await Promise.all([
          getTrendingHashtags(8),
          currentUser ? getSuggestions(5) : Promise.resolve({ data: { data: [] } }),
        ]);
        setTrendingTags(tagsRes.data?.data || []);
        setSuggestedUsers(usersRes.data?.data || []);
      } catch {
        // Silently ignore
      }
    };
    loadSidebarData();
  }, [currentUser]);

  // Load posts based on tab
  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === "hashtag" && currentTag) {
        const res = await getPostsByHashtag(currentTag);
        setTrendingPosts(res.data?.data?.posts || []);
      } else {
        const res = await getTrendingPosts();
        setTrendingPosts(res.data?.data?.posts || []);
      }
    } catch {
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
    <main className="explore-page py-4">
      <Container>
        {/* Top Search Bar */}
        <div className="mx-auto mb-4" style={{ maxWidth: "680px" }}>
          <InputGroup size="lg" className="shadow-sm rounded-pill overflow-hidden border">
            <InputGroup.Text className="bg-body border-0 ps-3">
              {searching ? (
                <Spinner size="sm" animation="border" variant="primary" />
              ) : (
                <FiSearch className="text-muted" size={18} />
              )}
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search creators, topics, or hashtags..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="border-0 bg-body shadow-none explore-search-input"
              aria-label="Search creators, topics, or hashtags"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                className="border-0 bg-body pe-3 text-muted"
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults(null);
                }}
                aria-label="Clear search"
              >
                ✕
              </Button>
            )}
          </InputGroup>
        </div>

        {/* Live Search Results View */}
        {searchResults && (
          <div className="search-results-overlay mx-auto mb-5" style={{ maxWidth: "780px" }}>
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <FiSearch /> Search Results for "{searchQuery}"
            </h5>

            {/* Matching Users */}
            {searchResults.users && searchResults.users.length > 0 && (
              <div className="mb-4">
                <h6 className="text-muted text-uppercase small fw-bold mb-2">People</h6>
                <div className="row g-2">
                  {searchResults.users.map((u) => (
                    <div key={u._id} className="col-12 col-md-6">
                      <Link
                        to={`/profile/${u.username}`}
                        className="card p-3 h-100 text-decoration-none text-body hover-shadow border"
                      >
                        <div className="d-flex align-items-center gap-2.5">
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.name} className="rounded-circle object-fit-cover" style={{ width: 40, height: 40 }} />
                          ) : (
                            <div className="avatar-placeholder rounded-circle bg-primary text-white fw-bold d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                              {(u.name || "U")[0].toUpperCase()}
                            </div>
                          )}
                          <div className="overflow-hidden">
                            <div className="fw-semibold small text-truncate d-flex align-items-center gap-1">
                              {u.name} {u.isVerified && <FiCheckCircle className="text-primary" size={12} />}
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
                      className="rounded-pill"
                      onClick={() => handleTagClick(h.tag)}
                    >
                      #{h.tag} <Badge bg="primary" pill className="ms-1">{h.count}</Badge>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Matching Posts */}
            {searchResults.posts && searchResults.posts.length > 0 && (
              <div>
                <h6 className="text-muted text-uppercase small fw-bold mb-2">Posts</h6>
                {searchResults.posts.map((post) => (
                  <PostCard key={post._id} post={post} currentUser={currentUser} />
                ))}
              </div>
            )}

            {searchResults.users?.length === 0 && searchResults.posts?.length === 0 && searchResults.hashtags?.length === 0 && (
              <EmptyState title="No results found" description={`Nothing matched "${searchQuery}". Try another keyword.`} />
            )}
          </div>
        )}

        {/* Regular Explore Grid */}
        {!searchResults && (
          <Row className="g-4">
            {/* Main Column */}
            <Col lg={8}>
              {/* Explore Navigation Tabs */}
              <Nav variant="underline" className="feed-nav-tabs mb-3">
                <Nav.Item>
                  <Nav.Link
                    active={activeTab === "trending"}
                    onClick={() => {
                      setActiveTab("trending");
                      setCurrentTag("");
                      setSearchParams({});
                    }}
                    className="d-flex align-items-center gap-1 cursor-pointer py-2 px-3 fw-semibold text-danger"
                  >
                    <FiTrendingUp /> Trending
                  </Nav.Link>
                </Nav.Item>
                {currentTag && (
                  <Nav.Item>
                    <Nav.Link
                      active={activeTab === "hashtag"}
                      className="d-flex align-items-center gap-1 cursor-pointer py-2 px-3 fw-semibold text-primary"
                    >
                      <FiTag /> #{currentTag}
                    </Nav.Link>
                  </Nav.Item>
                )}
              </Nav>

              {loading ? (
                <div>
                  <PostSkeleton />
                  <PostSkeleton />
                  <PostSkeleton />
                </div>
              ) : trendingPosts.length === 0 ? (
                <EmptyState
                  title={currentTag ? `No posts with #${currentTag}` : "No trending posts right now"}
                  description="Be the first to post about this topic!"
                  actionText="Create Post"
                  actionLink="/create-post"
                />
              ) : (
                <div>
                  {trendingPosts.map((post) => (
                    <PostCard key={post._id} post={post} currentUser={currentUser} />
                  ))}
                </div>
              )}
            </Col>

            {/* Sidebar Column */}
            <Col lg={4}>
              {/* Trending Hashtags Widget */}
              <div className="bg-body p-3.5 rounded-4 border shadow-sm mb-4">
                <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                  <FiTrendingUp className="text-danger" /> Trending Topics
                </h6>
                <div className="d-flex flex-column gap-2">
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
                          <span className="text-muted" style={{ fontSize: "11px" }}>{tag.count} {tag.count === 1 ? "post" : "posts"}</span>
                        </div>
                        <Badge bg="light" text="dark" className="border">Trending</Badge>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Suggested Creators Widget */}
              {suggestedUsers.length > 0 && (
                <div className="bg-body p-3.5 rounded-4 border shadow-sm">
                  <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                    <FiUsers className="text-primary" /> Who to Follow
                  </h6>
                  <div className="d-flex flex-column gap-3">
                    {suggestedUsers.map((u) => (
                      <div key={u._id} className="d-flex align-items-center justify-content-between">
                        <Link to={`/profile/${u.username}`} className="d-flex align-items-center gap-2 text-decoration-none text-body overflow-hidden">
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.name} className="rounded-circle object-fit-cover" style={{ width: 36, height: 36 }} />
                          ) : (
                            <div className="avatar-placeholder rounded-circle bg-primary text-white fw-bold d-flex align-items-center justify-content-center small" style={{ width: 36, height: 36 }}>
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
                        >
                          {u.isFollowing ? <FiUserCheck /> : <FiUserPlus />}
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
