import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Container, Form, Button, Spinner } from "react-bootstrap";
import { FiImage, FiX, FiSend, FiArrowLeft } from "react-icons/fi";
import { createPost } from "../services/posts";
import { useToast } from "../context/ToastContext";

export default function CreatePost() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validMimes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validMimes.includes(file.type)) {
      showToast("Please select a valid image format (JPEG, PNG, or WEBP).", "danger");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("Image size must be less than 5MB.", "danger");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim() && !imageFile) {
      showToast("Please add some text or an image to your post.", "danger");
      return;
    }

    if (content.length > 2000) {
      showToast("Content cannot exceed 2000 characters.", "danger");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      if (title.trim()) formData.append("title", title.trim());
      if (content.trim()) formData.append("content", content.trim());
      if (imageFile) formData.append("image", imageFile);

      await createPost(formData);
      showToast("Post published successfully!", "success");
      navigate("/dashboard");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to create post. Please try again.", "danger");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="py-4">
      <Container style={{ maxWidth: "640px" }}>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <Button
            as={Link}
            to="/dashboard"
            variant="link"
            className="text-decoration-none text-muted p-0 d-flex align-items-center gap-1"
          >
            <FiArrowLeft /> Back to Feed
          </Button>
          <span className="text-muted small">Share with the community</span>
        </div>

        <div className="auth-card" style={{ maxWidth: "100%", padding: "1.75rem" }}>
          <h3 className="fw-bold mb-1">Create a Post</h3>
          <p className="text-muted small mb-4">What's on your mind today?</p>

          <Form onSubmit={handleSubmit}>
            {/* Optional Title */}
            <Form.Group className="mb-3" controlId="postTitleInput">
              <Form.Label className="small text-muted mb-1">Title (Optional)</Form.Label>
              <Form.Control
                type="text"
                placeholder="Give your post a title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={120}
                disabled={loading}
              />
            </Form.Group>

            {/* Content with character counter */}
            <Form.Group className="mb-3" controlId="postContentInput">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <Form.Label className="small text-muted mb-0">Content</Form.Label>
                <span className={`char-counter ${content.length > 1800 ? "near-limit" : ""}`}>
                  {content.length} / 2000
                </span>
              </div>
              <Form.Control
                as="textarea"
                rows={5}
                placeholder="Write your story, thoughts, or idea here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={2000}
                disabled={loading}
              />
            </Form.Group>

            {/* Image Preview */}
            {imagePreview && (
              <div className="composer-preview-container mb-3">
                <img src={imagePreview} alt="Preview" className="composer-preview-img" />
                <button
                  type="button"
                  className="composer-remove-img"
                  onClick={handleRemoveImage}
                  title="Remove image"
                  disabled={loading}
                  aria-label="Remove image"
                >
                  <FiX />
                </button>
              </div>
            )}

            {/* File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/jpeg,image/png,image/webp"
              style={{ display: "none" }}
              disabled={loading}
              aria-label="Upload post image"
            />

            <div className="d-flex align-items-center justify-content-between pt-3 border-top">
              <Button
                type="button"
                variant="outline-secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="d-flex align-items-center gap-1"
                aria-label={imageFile ? "Change image" : "Add image"}
              >
                <FiImage /> {imageFile ? "Change Image" : "Add Image"}
              </Button>

              <div className="d-flex align-items-center gap-2">
                <Button
                  as={Link}
                  to="/dashboard"
                  variant="outline-secondary"
                  size="sm"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="btn-primary-custom d-flex align-items-center gap-2"
                  disabled={loading || (!content.trim() && !imageFile)}
                >
                  {loading ? (
                    <>
                      <Spinner size="sm" animation="border" /> Publishing...
                    </>
                  ) : (
                    <>
                      <FiSend size={14} /> Publish Post
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Form>
        </div>
      </Container>
    </main>
  );
}
