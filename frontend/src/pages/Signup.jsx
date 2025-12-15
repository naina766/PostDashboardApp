import React, { useState } from "react";
import { signup } from "../services/auth";
import { useNavigate, Link } from "react-router-dom";
import { FiUser, FiMail, FiLock } from "react-icons/fi";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(form);
      nav("/login");
    } catch (error) {
      setErr(error.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md space-y-6"
      >
        <h2 className="text-2xl font-bold text-center text-green-600">
          Signup
        </h2>
        {err && <div className="text-red-600 text-center">{err}</div>}

        <div className="flex items-center gap-2 border rounded px-3 py-2">
          <FiUser className="text-gray-400" />
          <input
            type="text"
            placeholder="Name"
            className="w-full outline-none"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

        <div className="flex items-center gap-2 border rounded px-3 py-2">
          <FiMail className="text-gray-400" />
          <input
            type="email"
            placeholder="Email"
            className="w-full outline-none"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>

        <div className="flex items-center gap-2 border rounded px-3 py-2">
          <FiLock className="text-gray-400" />
          <input
            type="password"
            placeholder="Password"
            className="w-full outline-none"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition font-semibold"
        >
          Signup
        </button>

        <p className="text-center text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-500 font-semibold hover:underline"
          >
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
