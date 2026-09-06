import React, { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Container, Form, InputGroup, Button, Spinner } from "react-bootstrap";
import { FiSearch, FiPlusSquare, FiFilter, FiRefreshCw, FiCheckCircle } from "react-icons/fi";
import { getPosts, deletePost as deletePostApi } from "../services/posts";
import { useUser } from "../context/UserContext";
import { useToast } from "../context/ToastContext";
import PostCard from "../components/PostCard";
import PostSkeleton from "../components/PostSkeleton";
import EmptyState from "../components/EmptyState";

export default function Dashboard() {
  const { user } = useUser();
  const { showToast } = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searching, setSearching] = useState(false);

  // Search, sort, and pagination state
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

  const fetchFeed = useCallback(async (pageNum = 1, searchQuery = search, sortOrder = sort, isLoadMore = false) => {
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
      showToast(err.response?.data?.message || "Failed to load posts. Please check your connection.", "danger");
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setSearching(false);
    }
  }, [search, sort, showToast]);

  // Initial load & when sort changes
  useEffect(() => {
    fetchFeed(1, search, sort, false);
  }, [sort]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle Search with debounce
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    setSearching(true);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      fetchFeed(1, val, sort, false);
    }, 400);
  };

  const handleClearSearch = () => {
    setSearch("");
    setSearching(false);
    fetchFeed(1, "", sort, false);
  };

  // Handle Load More
  const handleLoadMore = () => {
    if (pagination.hasNextPage && !loadingMore) {
      fetchFeed(page + 1, search, sort, true);
    }
  };

  // Handle Post Delete
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
      <Container style={{ maxWidth: "720px" }}>
        {/* Quick composer prompt */}
        <div className="composer-card d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <div className="post-author-avatar" style={{ width: 38, height: 38, fontSize: "0.95rem" }} aria-hidden="true">
              {(user?.name || "U").charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="mb-0 fw-medium text-body">
                What's on your mind, {user?.name?.split(" ")[0] || "there"}?
              </p>
              <span className="text-muted small">Share your thoughts, story, or photo</span>
            </div>
          </div>
          <Button
            as={Link}
            to="/create-post"
            className="btn-primary-custom d-flex align-items-center gap-1 text-decoration-none"
            size="sm"
          >
            <FiPlusSquare /> Create Post
          </Button>
        </div>

        {/* Feed Header, Search & Sort Bar */}
        <div className="mb-4">
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3">
            <div>
              <h4 className="fw-bold mb-0">Social Feed</h4>
              <span className="text-muted small">
                {posts.length > 0 && !loading ? `Showing ${posts.length} of ${pagination.total} posts` : "Latest community updates"}
              </span>
            </div>

            {/* Sort Control */}
            <div className="d-flex align-items-center gap-2">
              <label htmlFor="feedSortSelect" className="text-muted small d-flex align-items-center gap-1 mb-0">
                <FiFilter /> Sort:
              </label>
              <Form.Select
                id="feedSortSelect"
                size="sm"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                style={{ width: "160px" }}
                aria-label="Sort posts"
              >
                <option value="latest">Latest</option>
                <option value="likes">Most Liked</option>
                <option value="comments">Most Commented</option>
              </Form.Select>
            </div>
          </div>

          {/* Search Input */}
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
              placeholder="Search posts by author, title, or content..."
              value={search}
              onChange={handleSearchChange}
              aria-label="Search posts"
              aria-describedby="search-addon"
            />
            {search && (
              <Button
                variant="outline-secondary"
                onClick={handleClearSearch}
                title="Clear search"
                aria-label="Clear search"
              >
                ✕
              </Button>
            )}
          </InputGroup>
        </div>

        {/* Feed Content: Skeletons while loading initially */}
        {loading ? (
          <div>
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </div>
        ) : posts.length === 0 ? (
          <EmptyState
            title={search ? "No posts match your search" : "No posts yet"}
            description={
              search
                ? `We couldn't find anything matching "${search}". Try different keywords.`
                : "Be the first member to share something with the community!"
            }
            actionText={search ? "Clear Search" : "Create a Post"}
            actionLink={search ? null : "/create-post"}
            onAction={search ? handleClearSearch : null}
          />
        ) : (
          <div>
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                currentUser={user}
                onDeletePost={handleDeletePost}
              />
            ))}

            {/* Pagination Controls */}
            {pagination.hasNextPage ? (
              <div className="text-center mt-4 mb-5">
                <Button
                  variant="outline-primary"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-4 py-2"
                >
                  {loadingMore ? (
                    <>
                      <Spinner size="sm" animation="border" className="me-2" /> Loading more posts...
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
                <FiCheckCircle size={14} className="text-success" /> You've reached the end of the feed.
              </div>
            ) : null}
          </div>
        )}
      </Container>
    </main>
  );
}
