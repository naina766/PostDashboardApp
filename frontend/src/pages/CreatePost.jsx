import React, { useState } from "react";
import Header from "../components/Header";
import { createPost } from "../services/posts";
import { useNavigate } from "react-router-dom";

export default function CreatePost({ onNewPost }) {
  const nav = useNavigate();
  const [form, setForm] = useState({ title: "", content: "", image: null });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await createPost(form);

      if (onNewPost) onNewPost(res.data.data);

      setSuccess("Post created successfully!");
      setForm({ title: "", content: "", image: null });
      setTimeout(() => nav("/dashboard"), 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create post");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header title="Create Post" />
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
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
          />
          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
          >
            Create Post
          </button>
        </form>
      </main>
    </div>
  );
}
