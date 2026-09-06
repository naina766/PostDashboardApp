import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Spinner, Badge, Modal } from "react-bootstrap";
import { 
  FiHeart, 
  FiMessageCircle, 
  FiEdit, 
  FiTrash2, 
  FiSend,
  FiClock,
  FiMaximize2
} from "react-icons/fi";
import { formatTimeAgo } from "../utils/timeAgo";
import { toggleLike, addComment } from "../services/posts";
import { useToast } from "../context/ToastContext";
import DeleteConfirmModal from "./DeleteConfirmModal";

export default function PostCard({ post, currentUser, onDeletePost }) {
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Determine if currentUser has already liked this post
  const isLikedByMe = Boolean(
    currentUser &&
    post.likes?.some(
      (l) => (l.userId === currentUser._id || l.userId?._id === currentUser._id)
    )
  );

  // Optimistic like state
  const [liked, setLiked] = useState(isLikedByMe);
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [likePending, setLikePending] = useState(false);
  const [animateHeart, setAnimateHeart] = useState(false);

  // Comments state
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [commentText, setCommentText] = useState("");
  const [commentPending, setCommentPending] = useState(false);

  // Image lightbox preview state
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Check ownership
  const postUserId = typeof post.user === "object" ? post.user?._id : post.user;
  const currentUserId = currentUser?._id;
  const isOwner = Boolean(currentUserId && postUserId && currentUserId === postUserId);

  // Optimistic Like Handler
  const handleLikeToggle = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    if (likePending) return;

    const prevLiked = liked;
    const prevCount = likesCount;

    const newLiked = !prevLiked;
    setLiked(newLiked);
    setLikesCount(prevCount + (newLiked ? 1 : -1));
    setLikePending(true);
    setAnimateHeart(true);
    setTimeout(() => setAnimateHeart(false), 350);

    try {
      const res = await toggleLike(post._id);
      if (res.data?.data) {
        setLiked(res.data.data.liked);
        setLikesCount(res.data.data.likesCount);
      }
    } catch (err) {
      // Rollback on error
      setLiked(prevLiked);
      setLikesCount(prevCount);
      showToast(err.response?.data?.message || "Failed to update like. Please try again.", "danger");
    } finally {
      setLikePending(false);
    }
  };

  // Add Comment Handler
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      navigate("/login");
      return;
    }
    if (!commentText.trim()) return;

    setCommentPending(true);

    try {
      const res = await addComment(post._id, commentText.trim());
      if (res.data?.data?.comment) {
        setComments((prev) => [...prev, res.data.data.comment]);
        setCommentText("");
        showToast("Comment added successfully!", "success", 2000);
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to add comment.", "danger");
    } finally {
      setCommentPending(false);
    }
  };

  // Delete Handler
  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await onDeletePost(post._id);
      setShowDeleteModal(false);
      showToast("Post deleted successfully.", "info");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete post.", "danger");
    } finally {
      setDeleting(false);
    }
  };

  const authorInitial = (post.username || "U").charAt(0).toUpperCase();

  return (
    <article className="post-card">
      {/* Header */}
      <div className="post-card-header">
        <div className="d-flex align-items-center gap-3">
          <div className="post-author-avatar" aria-hidden="true">
            {authorInitial}
          </div>
          <div>
            <h6 className="mb-0 fw-semibold text-body">{post.username || "Community Member"}</h6>
            <span className="text-muted small d-flex align-items-center gap-1">
              <FiClock size={12} /> {formatTimeAgo(post.createdAt)}
            </span>
          </div>
        </div>

        {/* Owner actions */}
        {isOwner && (
          <div className="d-flex align-items-center gap-1">
            <Button
              variant="outline-primary"
              size="sm"
              className="d-flex align-items-center gap-1 py-1 px-2 border-0"
              onClick={() => navigate(`/edit-post/${post._id}`)}
              title="Edit post"
              aria-label="Edit post"
            >
              <FiEdit size={14} /> <span className="d-none d-sm-inline">Edit</span>
            </Button>
            <Button
              variant="outline-danger"
              size="sm"
              className="d-flex align-items-center gap-1 py-1 px-2 border-0"
              onClick={() => setShowDeleteModal(true)}
              title="Delete post"
              aria-label="Delete post"
            >
              <FiTrash2 size={14} /> <span className="d-none d-sm-inline">Delete</span>
            </Button>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="post-card-body">
        {post.title && (
          <h5 className="post-title">{post.title}</h5>
        )}
        {post.content && (
          <p className="post-content">{post.content}</p>
        )}
        {post.image && !imageError && (
          <div 
            className="post-image-container position-relative" 
            style={{ cursor: "pointer" }}
            onClick={() => setShowImageModal(true)}
            title="Click to view full image"
          >
            <img 
              src={post.image} 
              alt={post.title || "Post media"} 
              className="post-image"
              loading="lazy"
              onError={() => setImageError(true)}
            />
            <span 
              className="position-absolute bottom-0 end-0 m-2 badge bg-dark bg-opacity-75 text-white d-flex align-items-center gap-1"
            >
              <FiMaximize2 size={12} /> Expand
            </span>
          </div>
        )}
      </div>

      {/* Footer stats & actions */}
      <div className="post-card-footer">
        <div className="d-flex align-items-center gap-3">
          <button
            type="button"
            className={`post-action-btn ${liked ? "liked" : ""} ${animateHeart ? "heart-pop" : ""}`}
            onClick={handleLikeToggle}
            disabled={likePending}
            title={liked ? "Unlike this post" : "Like this post"}
            aria-label={liked ? "Unlike this post" : "Like this post"}
          >
            <FiHeart style={{ fill: liked ? "currentColor" : "none" }} />
            <span>{likesCount} {likesCount === 1 ? "Like" : "Likes"}</span>
          </button>

          <button
            type="button"
            className="post-action-btn"
            onClick={() => setShowComments(!showComments)}
            title="View comments"
            aria-label="Toggle comments"
          >
            <FiMessageCircle />
            <span>{comments.length} {comments.length === 1 ? "Comment" : "Comments"}</span>
          </button>
        </div>

        {isOwner && (
          <Badge bg="secondary" className="opacity-75 small fw-normal">
            Author
          </Badge>
        )}
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="comments-section">
          {comments.length === 0 ? (
            <p className="text-muted small text-center my-2">
              No comments yet. Start the conversation!
            </p>
          ) : (
            <div className="mb-3">
              {comments.map((comment, index) => (
                <div key={comment._id || index} className="comment-item">
                  <div className="comment-avatar" aria-hidden="true">
                    {(comment.username || "U").charAt(0).toUpperCase()}
                  </div>
                  <div className="comment-bubble">
                    <div className="comment-author">
                      <span>{comment.username || "Community Member"}</span>
                      <span className="comment-time">{formatTimeAgo(comment.createdAt)}</span>
                    </div>
                    <p className="comment-text">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Comment input form */}
          <Form onSubmit={handleAddComment}>
            <div className="d-flex gap-2 mb-1">
              <Form.Control
                type="text"
                size="sm"
                placeholder="Write a comment... (Press Enter to submit)"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                maxLength={500}
                disabled={commentPending}
                aria-label="Write a comment"
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={commentPending || !commentText.trim()}
                className="d-flex align-items-center gap-1 px-3"
                aria-label="Submit comment"
              >
                {commentPending ? (
                  <Spinner size="sm" animation="border" />
                ) : (
                  <>
                    <FiSend size={13} /> Send
                  </>
                )}
              </Button>
            </div>
            {commentText.length > 0 && (
              <div className="text-end">
                <span className={`char-counter ${commentText.length > 450 ? "near-limit" : ""}`}>
                  {commentText.length}/500
                </span>
              </div>
            )}
          </Form>
        </div>
      )}

      {/* Image Lightbox Modal */}
      {post.image && (
        <Modal 
          show={showImageModal} 
          onHide={() => setShowImageModal(false)} 
          centered 
          size="lg"
          contentClassName="bg-transparent border-0 shadow-none"
        >
          <Modal.Body className="p-0 text-center position-relative">
            <img 
              src={post.image} 
              alt={post.title || "Full post image"} 
              style={{ maxWidth: "100%", maxHeight: "85vh", borderRadius: 12, objectFit: "contain" }} 
            />
            <Button 
              variant="dark" 
              size="sm" 
              className="position-absolute top-0 end-0 m-3 rounded-circle"
              onClick={() => setShowImageModal(false)}
              style={{ width: 34, height: 34, padding: 0 }}
              aria-label="Close full size image"
            >
              ✕
            </Button>
          </Modal.Body>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        deleting={deleting}
      />
    </article>
  );
}
