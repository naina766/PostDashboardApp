import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { getPosts, deletePost } from "../services/posts";
import { getProfile } from "../services/auth";
import PostCard from "../components/PostCard";
import { Link, useLocation } from "react-router-dom";

export default function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [search, setSearch] = useState("");
  // const [success, setSuccess] = useState("");

  const location = useLocation();

  // Fetch profile & posts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const pRes = await getProfile();
        const postRes = await getPosts();

        // Set state asynchronously to avoid cascading renders
        Promise.resolve().then(() => {
          setProfile(pRes.data.data || {});
          setPosts(postRes.data.data || []);
        });
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  // Handle delete post
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this post?")) return;
    await deletePost(id);
    setPosts((prev) => prev.filter((p) => p._id !== id));
  };

  // Handle profile update
  // const handleProfileUpdate = async () => {
  //   try {
  //     await updateProfile(profile);
  //     setSuccess("Profile updated successfully!");
  //     setTimeout(() => setSuccess(""), 3000);
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  // Live update when returning from edit post
  useEffect(() => {
    if (location.state?.updatedPost) {
      const updated = location.state.updatedPost;

      // Defer state update to avoid synchronous setState warning
      Promise.resolve().then(() => {
        setPosts((prev) =>
          prev.map((p) => (p._id === updated._id ? updated : p))
        );
      });
    }
  }, [location.state]);

  const filtered = posts.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Header title={`Hi, ${profile.name || ""}`} />

      <main className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Your Posts</h2>
          <Link
            to="/create-post"
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
          >
            Create Post
          </Link>
        </div>

        <input
          type="text"
          placeholder="Search posts..."
          className="w-full border px-4 py-2 rounded-lg mb-6"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {filtered.length === 0 ? (
          <p className="text-center text-gray-500">No posts found</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((post) => (
              <PostCard key={post._id} post={post} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
