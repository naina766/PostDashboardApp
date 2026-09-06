import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Spinner } from "react-bootstrap";
import {
  FiImage,
  FiPieChart,
  FiLink,
  FiFileText,
  FiPlusSquare,
  FiSend
} from "react-icons/fi";
import { createPost as createPostApi } from "../services/posts";
import { useToast } from "../context/ToastContext";

export default function Composer({ user, onPostCreated }) {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }
    if (!content.trim() && !title.trim()) {
      showToast("Please enter some text for your post", "warning");
      return;
    }

    setPosting(true);
    try {
      const res = await createPostApi({
        title: title.trim(),
        content: content.trim(),
      });
      const newPost = res.data?.data?.post || res.data?.data;
      if (newPost && onPostCreated) {
        onPostCreated(newPost);
      }
      setTitle("");
      setContent("");
      setExpanded(false);
      showToast("Post published to community!", "success", 2000);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to publish post.", "danger");
    } finally {
      setPosting(false);
    }
  };

  const handleCancel = () => {
    setExpanded(false);
    setTitle("");
    setContent("");
  };

  const userInitial = (user?.name || "U").charAt(0).toUpperCase();
  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <div className={`ph-composer-card ${expanded ? "expanded" : ""}`}>
      {!expanded ? (
        /* Collapsed Compact State */
        <div className="ph-composer-collapsed">
          <div className="d-flex align-items-center gap-3 mb-3">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="ph-composer-avatar rounded-circle object-fit-cover flex-shrink-0"
              />
            ) : (
              <div className="ph-composer-avatar rounded-circle flex-shrink-0 d-flex align-items-center justify-content-center fw-bold text-white">
                {userInitial}
              </div>
            )}
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="ph-composer-prompt-btn flex-grow-1 text-start border-0"
              aria-label="Create a post"
            >
              What's on your mind, {firstName}?
            </button>
            <Button
              onClick={() => setExpanded(true)}
              className="ph-composer-post-btn d-flex align-items-center gap-1.5"
              size="sm"
              aria-label="Open post composer"
            >
              <FiPlusSquare size={15} />
              <span>Post</span>
            </Button>
          </div>

          {/* Quick Triggers: Photo, Poll, Link, Draft */}
          <div className="ph-composer-triggers d-flex align-items-center justify-content-between pt-2.5 border-top">
            <div className="d-flex align-items-center gap-2">
              <Link
                to="/create-post"
                state={{ postType: "IMAGE" }}
                className="ph-composer-trigger-btn"
                aria-label="Create photo post"
              >
                <FiImage className="text-success" size={15} />
                <span>Media</span>
              </Link>
              <Link
                to="/create-post"
                state={{ postType: "POLL" }}
                className="ph-composer-trigger-btn"
                aria-label="Create poll post"
              >
                <FiPieChart className="text-warning" size={15} />
                <span>Poll</span>
              </Link>
              <Link
                to="/create-post"
                state={{ postType: "LINK" }}
                className="ph-composer-trigger-btn"
                aria-label="Create link post"
              >
                <FiLink className="text-info" size={15} />
                <span>Link</span>
              </Link>
            </div>

            {localStorage.getItem("posthub_draft") && (
              <Link
                to="/create-post"
                className="ph-composer-trigger-btn text-primary"
                title="You have a saved draft"
                aria-label="Resume draft"
              >
                <FiFileText size={14} />
                <span>Draft</span>
              </Link>
            )}
          </div>
        </div>
      ) : (
        /* Expanded Inline Form */
        <form onSubmit={handleSubmit} className="ph-composer-expanded">
          <div className="d-flex align-items-center gap-2.5 mb-2.5 pb-2 border-bottom">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="rounded-circle object-fit-cover flex-shrink-0"
                style={{ width: 34, height: 34 }}
              />
            ) : (
              <div
                className="rounded-circle flex-shrink-0 d-flex align-items-center justify-content-center fw-bold text-white bg-primary"
                style={{ width: 34, height: 34, fontSize: "0.85rem" }}
              >
                {userInitial}
              </div>
            )}
            <div>
              <div className="fw-semibold small lh-1 mb-0.5">{user?.name}</div>
              <div className="text-muted small" style={{ fontSize: "11px" }}>Post to Public Community</div>
            </div>
            <span className="text-muted small ms-auto font-monospace" style={{ fontSize: "11px" }}>
              {content.length}/2000
            </span>
          </div>

          <input
            type="text"
            placeholder="Post title (optional)..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            className="form-control ph-composer-title-input mb-2"
            aria-label="Post title"
          />

          <textarea
            rows={3}
            placeholder={`Share something with the community, ${firstName}...`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={2000}
            className="form-control ph-composer-content-textarea mb-3"
            aria-label="Post content"
            autoFocus
          />

          <div className="d-flex align-items-center justify-content-between pt-2.5 border-top">
            <div className="d-flex align-items-center gap-1.5">
              <Link
                to="/create-post"
                state={{ postType: "IMAGE" }}
                className="ph-composer-trigger-btn"
                aria-label="Upload photo"
              >
                <FiImage className="text-success" size={14} />
                <span>Media</span>
              </Link>
              <Link
                to="/create-post"
                state={{ postType: "POLL" }}
                className="ph-composer-trigger-btn"
                aria-label="Add poll"
              >
                <FiPieChart className="text-warning" size={14} />
                <span>Poll</span>
              </Link>
              <Link
                to="/create-post"
                state={{ postType: "LINK" }}
                className="ph-composer-trigger-btn"
                aria-label="Add link"
              >
                <FiLink className="text-info" size={14} />
                <span>Link</span>
              </Link>
            </div>

            <div className="d-flex align-items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={handleCancel}
                className="text-muted px-2.5 py-1 small border-0 hover-bg rounded-pill"
                aria-label="Cancel post"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={posting || (!content.trim() && !title.trim())}
                className="ph-composer-submit-btn rounded-pill px-3 py-1 fw-semibold d-flex align-items-center gap-1.5"
                aria-label="Publish post"
              >
                {posting ? (
                  <Spinner size="sm" animation="border" />
                ) : (
                  <>
                    <span>Post</span>
                    <FiSend size={13} />
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
