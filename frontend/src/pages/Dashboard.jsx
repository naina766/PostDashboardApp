import React, { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Container, Form, InputGroup, Button, Spinner, Nav } from "react-bootstrap";
import { 
  FiSearch, 
  FiPlusSquare, 
  FiFilter, 
  FiRefreshCw, 
  FiCheckCircle, 
  FiTrendingUp, 
  FiUsers, 
  FiClock, 
  FiCompass,
  FiImage,
  FiPieChart,
  FiLink,
  FiFileText
} from "react-icons/fi";
import { getPosts, deletePost as deletePostApi } from "../services/posts";
import { useUser } from "../context/UserContext";
import { useToast } from "../context/ToastContext";
import PostCard from "../components/PostCard";
import PostSkeleton from "../components/PostSkeleton";
import EmptyState from "../components/EmptyState";
import { LeftSidebar, RightWidgets } from "../components/Sidebar";

export default function Dashboard() {
  const { user } = useUser();
  const { showToast } = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searching, setSearching] = useState(false);

  // Tabs: "forYou", "following", "trending", "latest"
  const [feedTab, setFeedTab] = useState("forYou");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
  });

  const searchTimeoutRef = useRef(null);

  const fetchFeed = useCallback(
    async (
      pageNum = 1,
      searchQuery = search,
      sortOrder = sort,
      tab = feedTab,
      isLoadMore = false
    ) => {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const res = await getPosts({
          page: pageNum,
          limit: 10,
          search: searchQuery.trim(),
          sort: sortOrder,
          feedType: tab,
        });

        const data = res.data?.data;
        if (data) {
          if (isLoadMore) {
            setPosts((prev) => [...prev, ...data.posts]);
          } else {
            setPosts(data.posts || []);
          }
          setPagination(data.pagination);
          setPage(pageNum);
        }
      } catch (err) {
        showToast(
          err.response?.data?.message || "Failed to load posts. Please check your connection.",
          "danger"
        );
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setSearching(false);
      }
    },
    [search, sort, feedTab, showToast]
  );

  useEffect(() => {
    fetchFeed(1, search, sort, feedTab, false);
  }, [sort, feedTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    setSearching(true);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      fetchFeed(1, val, sort, feedTab, false);
    }, 400);
  };

  const handleClearSearch = () => {
    setSearch("");
    setSearching(false);
    fetchFeed(1, "", sort, feedTab, false);
  };

  const handleLoadMore = () => {
    if (pagination.hasNextPage && !loadingMore) {
      fetchFeed(page + 1, search, sort, feedTab, true);
    }
  };

  const handleDeletePost = async (id) => {
    await deletePostApi(id);
    setPosts((prev) => prev.filter((p) => p._id !== id));
    setPagination((prev) => ({
      ...prev,
      total: Math.max(0, prev.total - 1),
    }));
  };

  return (
    <main className="py-4">
      <Container fluid="xl">
        <div className="row g-4 justify-content-center">
          {/* Left Column: Navigation Sidebar (Desktop >= lg) */}
          <div className="col-lg-3 d-none d-lg-block">
            <LeftSidebar />
          </div>

          {/* Center Column: Feed Stream */}
          <div className="col-12 col-lg-9 col-xl-6">
            {/* Quick composer prompt */}
            <div className="composer-card mb-4">
              <div className="d-flex align-items-center gap-3 mb-3">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="post-author-avatar rounded-circle object-fit-cover"
                    style={{ width: 42, height: 42 }}
                  />
                ) : (
                  <div className="post-author-avatar" style={{ width: 42, height: 42 }} aria-hidden="true">
                    {(user?.name || "U").charAt(0).toUpperCase()}
                  </div>
                )}
                <Link
                  to="/create-post"
                  className="flex-grow-1 text-decoration-none"
                  aria-label="Create a post"
                >
                  <div className="form-control bg-body-tertiary text-muted py-2 px-3 rounded-pill border-0 text-start" style={{ cursor: "pointer" }}>
                    What's on your mind, {user?.name?.split(" ")[0] || "there"}?
                  </div>
                </Link>
                <Button
                  as={Link}
                  to="/create-post"
                  className="btn-primary-custom d-flex align-items-center gap-1.5 text-decoration-none px-3 py-2 rounded-pill shadow-sm"
                  size="sm"
                >
                  <FiPlusSquare /> <span className="d-none d-sm-inline">Post</span>
                </Button>
              </div>

              {/* Action Triggers: Photo, Poll, Link, Draft */}
              <div className="d-flex align-items-center justify-content-between pt-2 border-top">
                <div className="d-flex align-items-center gap-2">
                  <Link
                    to="/create-post"
                    state={{ postType: "IMAGE" }}
                    className="btn btn-sm btn-ghost text-muted d-flex align-items-center gap-1.5 px-2.5 py-1 rounded-pill hover-bg text-decoration-none"
                  >
                    <FiImage className="text-success" size={15} />
                    <span className="small fw-medium">Photo</span>
                  </Link>
                  <Link
                    to="/create-post"
                    state={{ postType: "POLL" }}
                    className="btn btn-sm btn-ghost text-muted d-flex align-items-center gap-1.5 px-2.5 py-1 rounded-pill hover-bg text-decoration-none"
                  >
                    <FiPieChart className="text-warning" size={15} />
                    <span className="small fw-medium">Poll</span>
                  </Link>
                  <Link
                    to="/create-post"
                    state={{ postType: "LINK" }}
                    className="btn btn-sm btn-ghost text-muted d-flex align-items-center gap-1.5 px-2.5 py-1 rounded-pill hover-bg text-decoration-none"
                  >
                    <FiLink className="text-info" size={15} />
                    <span className="small fw-medium">Link</span>
                  </Link>
                </div>
                {localStorage.getItem("posthub_draft") && (
                  <Link
                    to="/create-post"
                    className="btn btn-sm btn-ghost text-muted d-flex align-items-center gap-1 px-2 py-1 rounded-pill hover-bg text-decoration-none small"
                    title="You have a saved draft"
                  >
                    <FiFileText size={13} className="text-primary" />
                    <span className="small text-primary fw-medium">Draft</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Social Feed Tabs */}
            <div className="d-flex justify-content-between align-items-center border-bottom mb-3 pb-1">
              <Nav variant="underline" className="feed-nav-tabs gap-2">
                <Nav.Item>
                  <Nav.Link
                    active={feedTab === "forYou"}
                    onClick={() => setFeedTab("forYou")}
                    className="d-flex align-items-center gap-1 cursor-pointer py-2 px-3 fw-semibold"
                  >
                    <FiCompass /> For You
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    active={feedTab === "following"}
                    onClick={() => setFeedTab("following")}
                    className="d-flex align-items-center gap-1 cursor-pointer py-2 px-3 fw-semibold"
                  >
                    <FiUsers /> Following
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    active={feedTab === "trending"}
                    onClick={() => setFeedTab("trending")}
                    className="d-flex align-items-center gap-1 cursor-pointer py-2 px-3 fw-semibold text-danger"
                  >
                    <FiTrendingUp /> Trending
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    active={feedTab === "latest"}
                    onClick={() => setFeedTab("latest")}
                    className="d-flex align-items-center gap-1 cursor-pointer py-2 px-3 fw-semibold"
                  >
                    <FiClock /> Latest
                  </Nav.Link>
                </Nav.Item>
              </Nav>

              {/* Optional Sort Dropdown */}
              <div className="d-none d-sm-flex align-items-center gap-1.5">
                <label htmlFor="feedSortSelect" className="text-muted small mb-0">
                  <FiFilter />
                </label>
                <Form.Select
                  id="feedSortSelect"
                  size="sm"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  style={{ width: "135px" }}
                  aria-label="Sort posts"
                >
                  <option value="latest">Latest</option>
                  <option value="trending">Trending</option>
                  <option value="likes">Most Liked</option>
                  <option value="comments">Most Commented</option>
                </Form.Select>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-4">
              <InputGroup size="sm">
                <InputGroup.Text id="search-addon">
                  {searching ? (
                    <Spinner size="sm" animation="border" variant="primary" style={{ width: 14, height: 14 }} />
                  ) : (
                    <FiSearch className="text-muted" />
                  )}
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search posts by keyword or author..."
                  value={search}
                  onChange={handleSearchChange}
                  aria-label="Search posts"
                  aria-describedby="search-addon"
                />
                {search && (
                  <Button variant="outline-secondary" onClick={handleClearSearch} title="Clear search">
                    ✕
                  </Button>
                )}
              </InputGroup>
            </div>

            {/* Feed Content */}
            {loading ? (
              <div>
                <PostSkeleton />
                <PostSkeleton />
                <PostSkeleton />
              </div>
            ) : posts.length === 0 ? (
              <EmptyState
                title={
                  feedTab === "following"
                    ? "No posts from creators you follow"
                    : search
                    ? `No posts found for "${search}"`
                    : "No posts yet"
                }
                message={
                  feedTab === "following"
                    ? "Follow creators from the Explore page or recommendations to see their latest updates here!"
                    : search
                    ? "Try adjusting your search terms or clearing the filter."
                    : "Be the first to share something with the PostHub community!"
                }
                actionText={feedTab === "following" ? "Discover Creators" : "Create Post"}
                actionLink={feedTab === "following" ? "/explore" : "/create-post"}
              />
            ) : (
              <div className="feed-stream">
                {posts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    currentUser={user}
                    onDeletePost={handleDeletePost}
                  />
                ))}

                {/* Pagination / Infinite Scroll Trigger */}
                {pagination.hasNextPage ? (
                  <div className="text-center py-4">
                    <Button
                      variant="outline-primary"
                      className="px-4 py-2 rounded-pill fw-medium"
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                    >
                      {loadingMore ? (
                        <>
                          <Spinner size="sm" animation="border" className="me-2" /> Loading more...
                        </>
                      ) : (
                        <>
                          <FiRefreshCw className="me-2" /> Load More Posts ({posts.length} of {pagination.total})
                        </>
                      )}
                    </Button>
                  </div>
                ) : posts.length > 5 ? (
                  <div className="text-center py-4 text-muted small d-flex align-items-center justify-content-center gap-1">
                    <FiCheckCircle size={14} className="text-success" /> You've caught up with all posts.
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Right Column: Trending & Suggestions Widgets (Desktop >= xl) */}
          <div className="col-xl-3 d-none d-xl-block">
            <RightWidgets />
          </div>
        </div>
      </Container>
    </main>
  );
}
