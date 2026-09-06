import React, { useState, useEffect, useCallback } from "react";
import { Container, Button, Spinner } from "react-bootstrap";
import { FiBookmark, FiRefreshCw } from "react-icons/fi";
import { getSavedPosts } from "../services/posts";
import { useUser } from "../context/UserContext";
import { useToast } from "../context/ToastContext";
import PostCard from "../components/PostCard";
import PostSkeleton from "../components/PostSkeleton";
import EmptyState from "../components/EmptyState";

export default function SavedPosts() {
  const { user } = useUser();
  const { showToast } = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, hasNextPage: false, total: 0 });
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchSaved = useCallback(
    async (pageNum = 1, isLoadMore = false) => {
      if (isLoadMore) setLoadingMore(true);
      else setLoading(true);

      try {
        const res = await getSavedPosts({ page: pageNum, limit: 10 });
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
      } catch {
        showToast("Failed to load saved posts.", "danger");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    fetchSaved(1, false);
  }, [fetchSaved]);

  const handleRemovePost = (postId) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  return (
    <main className="saved-posts-page py-4">
      <Container style={{ maxWidth: "720px" }}>
        <div className="mb-4">
          <h4 className="fw-bold mb-1 d-flex align-items-center gap-2">
            <FiBookmark className="text-warning" /> Saved Posts
          </h4>
          <p className="text-muted small mb-0">
            {posts.length > 0 ? `You have saved ${pagination.total} posts` : "Your personal bookmark collection"}
          </p>
        </div>

        {loading ? (
          <div>
            <PostSkeleton />
            <PostSkeleton />
          </div>
        ) : posts.length === 0 ? (
          <EmptyState
            title="No saved posts yet"
            description="Whenever you see a post you'd like to revisit later, click the bookmark icon to save it here."
            actionText="Explore Feed"
            actionLink="/dashboard"
          />
        ) : (
          <div>
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                currentUser={user}
                onDeletePost={handleRemovePost}
              />
            ))}

            {pagination.hasNextPage && (
              <div className="text-center mt-4">
                <Button
                  variant="outline-primary"
                  onClick={() => fetchSaved(page + 1, true)}
                  disabled={loadingMore}
                  className="px-4 py-2"
                >
                  {loadingMore ? (
                    <>
                      <Spinner size="sm" animation="border" className="me-2" /> Loading...
                    </>
                  ) : (
                    <>
                      <FiRefreshCw className="me-2" /> Load More Saved Posts
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </Container>
    </main>
  );
}
