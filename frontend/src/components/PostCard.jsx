import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Button, Spinner, Badge, Modal, ProgressBar } from "react-bootstrap";
import { 
  FiHeart, 
  FiMessageCircle, 
  FiEdit, 
  FiTrash2, 
  FiSend,
  FiClock,
  FiMaximize2,
  FiBookmark,
  FiShare2,
  FiFlag,
  FiCheckCircle,
  FiCornerDownRight,
  FiExternalLink,
  FiTrendingUp
} from "react-icons/fi";
import { formatTimeAgo } from "../utils/timeAgo";
import { 
  toggleLike, 
  toggleSave, 
  addComment, 
  deleteComment, 
  addReply, 
  toggleCommentLike, 
  votePoll 
} from "../services/posts";
import { useToast } from "../context/ToastContext";
import DeleteConfirmModal from "./DeleteConfirmModal";
import ReportModal from "./ReportModal";

export default function PostCard({ post, currentUser, onDeletePost }) {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const authorUsername = post.user?.username || post.username || "user";
  const authorName = post.user?.name || post.username || "Community Member";
  const authorAvatar = post.user?.avatar || post.userAvatar || "";
  const isVerified = Boolean(post.user?.isVerified);

  // Like state
  const isLikedByMe = Boolean(
    post.isLiked ||
    (currentUser && post.likes?.some((l) => (l.userId === currentUser._id || l.userId?._id === currentUser._id)))
  );
  const [liked, setLiked] = useState(isLikedByMe);
  const [likesCount, setLikesCount] = useState(post.likesCount || post.likes?.length || 0);
  const [likePending, setLikePending] = useState(false);
  const [animateHeart, setAnimateHeart] = useState(false);

  // Save / Bookmark state
  const [saved, setSaved] = useState(Boolean(post.isSaved));
  const [savePending, setSavePending] = useState(false);

  // Poll state
  const [poll, setPoll] = useState(post.poll);
  const [userVotedOption, setUserVotedOption] = useState(post.userVotedOption);
  const [voting, setVoting] = useState(false);

  // Comments state
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [commentText, setCommentText] = useState("");
  const [commentPending, setCommentPending] = useState(false);

  // Active reply input state
  const [replyToCommentId, setReplyToCommentId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replyPending, setReplyPending] = useState(false);

  // Image lightbox preview state
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(post.image || post.media?.[0]?.url || "");
  const [imageError, setImageError] = useState(false);

  // Delete & Report modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Content truncation state
  const [isExpanded, setIsExpanded] = useState(false);

  // Check ownership or admin
  const postUserId = typeof post.user === "object" ? post.user?._id : post.user;
  const currentUserId = currentUser?._id;
  const isOwner = Boolean(currentUserId && postUserId && currentUserId.toString() === postUserId.toString());
  const isAdminOrMod = Boolean(currentUser && ["admin", "moderator"].includes(currentUser.role));

  // Like Handler
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
      setLiked(prevLiked);
      setLikesCount(prevCount);
      showToast(err.response?.data?.message || "Failed to update like.", "danger");
    } finally {
      setLikePending(false);
    }
  };

  // Bookmark / Save Handler
  const handleSaveToggle = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    if (savePending) return;

    const prevSaved = saved;
    setSaved(!prevSaved);
    setSavePending(true);

    try {
      const res = await toggleSave(post._id);
      if (res.data?.data) {
        setSaved(res.data.data.saved);
        showToast(res.data.data.saved ? "Saved to your bookmarks" : "Removed from bookmarks", "info", 2000);
      }
    } catch (err) {
      setSaved(prevSaved);
      showToast(err.response?.data?.message || "Failed to save post.", "danger");
    } finally {
      setSavePending(false);
    }
  };

  // Share Handler
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/dashboard#${post._id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title || `Post by ${authorName} on PostHub`,
          text: post.content?.slice(0, 100),
          url: shareUrl,
        });
      } catch {
        // Share cancelled or failed
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      showToast("Link copied to clipboard!", "success", 2000);
    }
  };

  // Poll Vote Handler
  const handleVote = async (optionIndex) => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    if (voting) return;

    setVoting(true);
    try {
      const res = await votePoll(post._id, optionIndex);
      if (res.data?.data) {
        setPoll(res.data.data.poll);
        setUserVotedOption(res.data.data.userVotedOption);
        showToast("Vote recorded!", "success", 2000);
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to cast vote.", "danger");
    } finally {
      setVoting(false);
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
        showToast("Comment posted!", "success", 2000);
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to add comment.", "danger");
    } finally {
      setCommentPending(false);
    }
  };

  // Add Reply Handler (Level 2)
  const handleAddReply = async (commentId) => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    if (!replyText.trim()) return;

    setReplyPending(true);
    try {
      const res = await addReply(post._id, commentId, replyText.trim());
      if (res.data?.data?.reply) {
        setComments((prev) =>
          prev.map((c) => {
            if (c._id === commentId) {
              return {
                ...c,
                replies: [...(c.replies || []), res.data.data.reply],
              };
            }
            return c;
          })
        );
        setReplyText("");
        setReplyToCommentId(null);
        showToast("Reply posted!", "success", 2000);
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to add reply.", "danger");
    } finally {
      setReplyPending(false);
    }
  };

  // Delete Comment Handler
  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(post._id, commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      showToast("Comment deleted", "info", 2000);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete comment", "danger");
    }
  };

  // Toggle Comment Like
  const handleToggleCommentLike = async (commentId) => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    try {
      await toggleCommentLike(post._id, commentId);
      setComments((prev) =>
        prev.map((c) => {
          if (c._id === commentId) {
            const userId = currentUser._id;
            const likes = c.likes || [];
            const hasLiked = likes.includes(userId);
            return {
              ...c,
              likes: hasLiked ? likes.filter((id) => id !== userId) : [...likes, userId],
            };
          }
          return c;
        })
      );
    } catch {
      // Silently fail
    }
  };

  // Delete Post Confirm
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

  // Calculate poll stats
  const totalPollVotes = poll?.options?.reduce((acc, opt) => acc + (opt.votes?.length || 0), 0) || 0;
  const pollExpired = poll?.expiresAt ? new Date() > new Date(poll.expiresAt) : false;

  const allMedia = post.media && post.media.length > 0 ? post.media : post.image ? [{ url: post.image }] : [];

  return (
    <article className="post-card" id={post._id}>
      {/* Explainable Discovery Header Pill */}
      {post.discoveryReason && (
        <div className="d-flex align-items-center gap-1.5 px-3 pt-3 pb-0 text-muted small">
          <FiTrendingUp size={13} className="text-primary" />
          <span className="fw-medium">{post.discoveryReason}</span>
        </div>
      )}

      {/* Header */}
      <div className="post-card-header">
        <div className="d-flex align-items-center gap-3">
          <Link to={`/profile/${authorUsername}`} className="text-decoration-none">
            {authorAvatar ? (
              <img
                src={authorAvatar}
                alt={authorName}
                className="post-author-avatar rounded-circle object-fit-cover"
                style={{ width: "42px", height: "42px" }}
              />
            ) : (
              <div className="post-author-avatar" aria-hidden="true">
                {authorName.charAt(0).toUpperCase()}
              </div>
            )}
          </Link>
          <div>
            <div className="d-flex align-items-center gap-1.5">
              <Link to={`/profile/${authorUsername}`} className="fw-semibold text-body text-decoration-none hover-underline">
                {authorName}
              </Link>
              {isVerified && <FiCheckCircle className="text-primary small" title="Verified Creator" />}
              {post.user?.role && post.user.role !== "user" && (
                <Badge bg="warning" text="dark" className="small py-0.5 px-1.5 fw-normal text-capitalize">
                  {post.user.role}
                </Badge>
              )}
            </div>
            <div className="text-muted small d-flex align-items-center gap-2">
              <span>@{authorUsername}</span>
              <span>•</span>
              <span className="d-flex align-items-center gap-1">
                <FiClock size={12} /> {formatTimeAgo(post.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Dropdown / Controls */}
        <div className="d-flex align-items-center gap-1">
          {isOwner && (
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
          )}

          {(isOwner || isAdminOrMod) && (
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
          )}

          <Button
            variant="ghost"
            size="sm"
            className="text-muted p-1 border-0"
            onClick={() => setShowReportModal(true)}
            title="Report post"
            aria-label="Report post"
          >
            <FiFlag size={14} />
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="post-card-body">
        {post.title && <h5 className="post-title">{post.title}</h5>}
        {post.content && (
          <div className="post-content-container mb-3">
            <p className="post-content mb-1" style={{ whiteSpace: "pre-line" }}>
              {post.content.length > 300 && !isExpanded
                ? `${post.content.slice(0, 300)}...`
                : post.content}
            </p>
            {post.content.length > 300 && (
              <button
                type="button"
                className="btn btn-link p-0 text-primary fw-semibold small text-decoration-none"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? "Show less" : "Read more"}
              </button>
            )}
          </div>
        )}

        {/* Hashtags */}
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="d-flex flex-wrap gap-1.5 mb-3">
            {post.hashtags.map((tag) => (
              <Link
                key={tag}
                to={`/explore?tag=${tag}`}
                className="badge bg-light text-primary text-decoration-none border px-2 py-1 small"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Poll Presentation */}
        {poll && poll.options && poll.options.length > 0 && (
          <div className="poll-container p-3 rounded-3 border mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="fw-semibold mb-0">{poll.question || "Poll"}</h6>
              <span className="text-muted small">
                {pollExpired ? "Closed" : `${totalPollVotes} ${totalPollVotes === 1 ? "vote" : "votes"}`}
              </span>
            </div>

            <div className="d-flex flex-column gap-2 mt-2">
              {poll.options.map((opt, idx) => {
                const optVotes = opt.votes?.length || 0;
                const percent = totalPollVotes > 0 ? Math.round((optVotes / totalPollVotes) * 100) : 0;
                const isSelected = userVotedOption === idx;

                return (
                  <div
                    key={idx}
                    className={`poll-option p-2 rounded border position-relative overflow-hidden ${isSelected ? "border-primary" : ""}`}
                    style={{ cursor: pollExpired ? "default" : "pointer" }}
                    onClick={() => !pollExpired && handleVote(idx)}
                  >
                    <div
                      className="poll-option-bar position-absolute top-0 start-0 h-100 bg-primary opacity-25"
                      style={{ width: `${percent}%`, transition: "width 0.3s ease" }}
                    />
                    <div className="position-relative d-flex justify-content-between align-items-center px-1">
                      <span className="small fw-medium d-flex align-items-center gap-1.5">
                        {isSelected && <FiCheckCircle className="text-primary" />}
                        {opt.text}
                      </span>
                      <span className="small text-muted fw-semibold">{percent}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Link Preview Presentation */}
        {post.linkPreview && post.linkPreview.url && (
          <a
            href={post.linkPreview.url}
            target="_blank"
            rel="noopener noreferrer"
            className="link-preview-card d-block p-3 rounded-3 border text-decoration-none text-body mb-3 hover-shadow"
          >
            <div className="d-flex align-items-center gap-2 text-primary small fw-semibold mb-1">
              <FiExternalLink /> {new URL(post.linkPreview.url).hostname}
            </div>
            {post.linkPreview.title && <div className="fw-bold mb-1">{post.linkPreview.title}</div>}
            {post.linkPreview.description && (
              <div className="text-muted small line-clamp-2">{post.linkPreview.description}</div>
            )}
          </a>
        )}

        {/* Media / Images Gallery */}
        {allMedia.length > 0 && !imageError && (
          <div className="post-media-grid mb-2">
            {allMedia.map((m, idx) => (
              <div
                key={idx}
                className="post-image-container position-relative rounded-3 overflow-hidden border"
                style={{ cursor: "pointer", maxHeight: "450px" }}
                onClick={() => {
                  setSelectedImage(m.url);
                  setShowImageModal(true);
                }}
              >
                <img
                  src={m.url}
                  alt={post.title || `Media ${idx + 1}`}
                  className="post-image w-100 object-fit-cover"
                  loading="lazy"
                  onError={() => setImageError(true)}
                />
                <span className="position-absolute bottom-0 end-0 m-2 badge bg-dark bg-opacity-75 text-white d-flex align-items-center gap-1">
                  <FiMaximize2 size={12} /> Expand
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer / Engagement Bar */}
      <div className="post-card-footer">
        <div className="d-flex align-items-center gap-2">
          {/* Like */}
          <button
            type="button"
            className={`post-action-btn ${liked ? "liked" : ""} ${animateHeart ? "heart-pop" : ""}`}
            onClick={handleLikeToggle}
            disabled={likePending}
            title={liked ? "Unlike post" : "Like post"}
          >
            <FiHeart style={{ fill: liked ? "currentColor" : "none" }} />
            <span>{likesCount}</span>
          </button>

          {/* Comments Toggle */}
          <button
            type="button"
            className="post-action-btn"
            onClick={() => setShowComments(!showComments)}
            title="Comments"
          >
            <FiMessageCircle />
            <span>{comments.length}</span>
          </button>

          {/* Save / Bookmark */}
          <button
            type="button"
            className={`post-action-btn ${saved ? "text-warning" : ""}`}
            onClick={handleSaveToggle}
            disabled={savePending}
            title={saved ? "Remove bookmark" : "Save post"}
          >
            <FiBookmark style={{ fill: saved ? "currentColor" : "none" }} />
          </button>

          {/* Share */}
          <button
            type="button"
            className="post-action-btn"
            onClick={handleShare}
            title="Share post"
          >
            <FiShare2 />
          </button>
        </div>

        {post.trendingScore > 120 && (
          <Badge bg="danger" className="d-flex align-items-center gap-1 small fw-medium">
            🔥 Trending
          </Badge>
        )}
      </div>

      {/* Comments & Replies Section */}
      {showComments && (
        <div className="comments-section p-3 border-top bg-light-subtle">
          {comments.length === 0 ? (
            <p className="text-muted small text-center my-2">No comments yet. Start the conversation!</p>
          ) : (
            <div className="d-flex flex-column gap-3 mb-3">
              {comments.map((comment) => {
                const commentUserInitial = (comment.username || "U").charAt(0).toUpperCase();
                const isCommentAuthor = currentUser && (comment.userId === currentUser._id || comment.userId?._id === currentUser._id);
                const canDelete = isCommentAuthor || isOwner || isAdminOrMod;
                const commentLikes = comment.likes?.length || 0;
                const hasLikedComment = currentUser && comment.likes?.includes(currentUser._id);

                return (
                  <div key={comment._id} className="comment-thread">
                    {/* Primary Comment */}
                    <div className="comment-item d-flex gap-2">
                      <div className="comment-avatar rounded-circle d-flex align-items-center justify-content-center bg-primary text-white small flex-shrink-0" style={{ width: 32, height: 32 }}>
                        {commentUserInitial}
                      </div>
                      <div className="comment-bubble flex-grow-1 p-2.5 rounded-3 bg-body border">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="small fw-bold">{comment.username || "Member"}</span>
                          <span className="text-muted small" style={{ fontSize: "11px" }}>{formatTimeAgo(comment.createdAt)}</span>
                        </div>
                        <p className="comment-text small mb-2">{comment.text}</p>

                        <div className="d-flex align-items-center gap-3">
                          <button
                            type="button"
                            className={`btn btn-link p-0 text-decoration-none small d-flex align-items-center gap-1 ${hasLikedComment ? "text-danger" : "text-muted"}`}
                            onClick={() => handleToggleCommentLike(comment._id)}
                            style={{ fontSize: "12px" }}
                          >
                            <FiHeart size={12} style={{ fill: hasLikedComment ? "currentColor" : "none" }} />
                            <span>{commentLikes > 0 ? commentLikes : "Like"}</span>
                          </button>

                          <button
                            type="button"
                            className="btn btn-link p-0 text-decoration-none small text-muted d-flex align-items-center gap-1"
                            onClick={() => setReplyToCommentId(replyToCommentId === comment._id ? null : comment._id)}
                            style={{ fontSize: "12px" }}
                          >
                            <FiCornerDownRight size={12} /> Reply
                          </button>

                          {canDelete && (
                            <button
                              type="button"
                              className="btn btn-link p-0 text-decoration-none small text-danger"
                              onClick={() => handleDeleteComment(comment._id)}
                              style={{ fontSize: "12px" }}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Level 2 Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="replies-list ms-4 ps-2 border-start mt-2 d-flex flex-column gap-2">
                        {comment.replies.map((reply, rIdx) => (
                          <div key={reply._id || rIdx} className="d-flex gap-2">
                            <div className="rounded-circle d-flex align-items-center justify-content-center bg-secondary text-white small flex-shrink-0" style={{ width: 26, height: 26, fontSize: "11px" }}>
                              {(reply.username || "U").charAt(0).toUpperCase()}
                            </div>
                            <div className="p-2 rounded-3 bg-body border flex-grow-1">
                              <div className="d-flex justify-content-between align-items-center mb-0.5">
                                <span className="small fw-semibold">{reply.username}</span>
                                <span className="text-muted" style={{ fontSize: "10px" }}>{formatTimeAgo(reply.createdAt)}</span>
                              </div>
                              <p className="small mb-0">{reply.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Input Form */}
                    {replyToCommentId === comment._id && (
                      <div className="reply-form ms-4 mt-2">
                        <div className="d-flex gap-2">
                          <Form.Control
                            type="text"
                            size="sm"
                            placeholder={`Reply to ${comment.username}...`}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            maxLength={500}
                            disabled={replyPending}
                            autoFocus
                          />
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={replyPending || !replyText.trim()}
                            onClick={() => handleAddReply(comment._id)}
                          >
                            {replyPending ? <Spinner size="sm" animation="border" /> : "Reply"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* New Comment Input */}
          <Form onSubmit={handleAddComment}>
            <div className="d-flex gap-2 mb-1">
              <Form.Control
                type="text"
                size="sm"
                placeholder="Write a comment... (Enter to post)"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                maxLength={500}
                disabled={commentPending}
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={commentPending || !commentText.trim()}
                className="d-flex align-items-center gap-1 px-3"
              >
                {commentPending ? <Spinner size="sm" animation="border" /> : <><FiSend size={13} /> Send</>}
              </Button>
            </div>
          </Form>
        </div>
      )}

      {/* Image Lightbox Modal */}
      {selectedImage && (
        <Modal 
          show={showImageModal} 
          onHide={() => setShowImageModal(false)} 
          centered 
          size="lg"
          contentClassName="bg-transparent border-0 shadow-none"
        >
          <Modal.Body className="p-0 text-center position-relative">
            <img 
              src={selectedImage} 
              alt={post.title || "Post media"} 
              style={{ maxWidth: "100%", maxHeight: "85vh", borderRadius: 12, objectFit: "contain" }} 
            />
            <Button 
              variant="dark" 
              size="sm" 
              className="position-absolute top-0 end-0 m-3 rounded-circle"
              onClick={() => setShowImageModal(false)}
              style={{ width: 34, height: 34, padding: 0 }}
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

      {/* Report Modal */}
      <ReportModal
        show={showReportModal}
        onHide={() => setShowReportModal(false)}
        targetType="POST"
        targetId={post._id}
      />
    </article>
  );
}
