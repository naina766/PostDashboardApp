import React, { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiLogOut, FiUser, FiFileText, FiPlus } from "react-icons/fi";
import { logout } from "../services/auth";
import { UserContext } from "../context/UserContext";

export default function Header() {
  const nav = useNavigate();
  const { user } = useContext(UserContext);

  const handleLogout = () => {
    logout();
    nav("/login");
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-1 rounded-lg transition ${
      isActive ? "bg-white text-blue-600" : "hover:bg-blue-500"
    }`;

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-4 shadow-md flex justify-between items-center">
      <h1 className="text-xl font-bold">Hi, {user.name || ""}</h1>
      <nav className="flex items-center gap-4">
        <NavLink to="/dashboard" className={linkClass}>
          <FiFileText /> Posts
        </NavLink>
        <NavLink to="/profile" className={linkClass}>
          <FiUser /> Profile
        </NavLink>
        <NavLink to="/create-post" className={linkClass}>
          <FiPlus /> Create
        </NavLink>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-3 py-1 rounded-lg transition"
        >
          <FiLogOut /> Logout
        </button>
      </nav>
    </header>
  );
}
