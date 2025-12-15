import React from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit, FiTrash2 } from "react-icons/fi";

export default function PostCard({ post, onDelete }) {
  const nav = useNavigate();

  return (
    <div className="bg-white rounded-xl shadow p-5 flex flex-col justify-between border hover:shadow-xl transition">
      <div>
        {post.image && (
          <img
            src={post.image} 
            alt={post.title}
            className="rounded mb-3 h-40 w-full object-cover"
          />
        )}
        <h3 className="text-xl font-semibold">{post.title}</h3>
        <p className="text-gray-600 mt-2">{post.content}</p>
      </div>
      <div className="flex gap-3 mt-4 justify-end">
        <button
          onClick={() => nav(`/edit-post/${post._id}`)}
          className="flex items-center gap-1 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          <FiEdit /> Edit
        </button>
        <button
          onClick={() => onDelete(post._id)}
          className="flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        >
          <FiTrash2 /> Delete
        </button>
      </div>
    </div>
  );
}
