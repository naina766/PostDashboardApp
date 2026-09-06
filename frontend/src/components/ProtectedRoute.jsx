import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import AppNavbar from "./Navbar";

export default function ProtectedRoute() {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-container">
      <AppNavbar />
      <Outlet />
    </div>
  );
}
