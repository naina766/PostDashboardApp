import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { getPosts, updatePost } from "../services/posts";

export default function EditPost() {
  const { id } = useParams();
  const nav = useNavigate();
  const [form, setForm] = useState({ title: "", content: "", image: null });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch the specific post
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await getPosts();
        const post = res.data.data.find((p) => p._id === id);
        if (post) {
          setForm({
            title: post.title,
            content: post.content,
            image: post.image || null,
          });
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchPost();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await updatePost(id, form);
      setSuccess("Post updated successfully!");

      setTimeout(() => {
        nav("/dashboard", { state: { updatedPost: res.data.data } });
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update post");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header title="Edit Post" />
      <main className="max-w-md mx-auto p-6">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-xl shadow-lg space-y-4"
        >
          {error && <div className="text-red-600">{error}</div>}
          {success && <div className="text-green-600">{success}</div>}

          <input
            type="text"
            placeholder="Title"
            className="w-full border px-3 py-2 rounded-lg"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />

          <textarea
            placeholder="Content"
            className="w-full border px-3 py-2 rounded-lg"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            required
            rows={5}
          />

          {/* Show current image */}
          {form.image && typeof form.image === "string" && (
            <img
              src={form.image}
              alt="Current"
              className="mb-3 h-40 w-full object-cover rounded"
            />
          )}

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
          />

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
          >
            Update Post
          </button>
        </form>
      </main>
    </div>
  );
}
