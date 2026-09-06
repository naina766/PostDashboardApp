import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import CreatePost from "./pages/CreatePost";
import EditPost from "./pages/EditPost";
import Profile from "./pages/Profile";
import Explore from "./pages/Explore";
import Notifications from "./pages/Notifications";
import SavedPosts from "./pages/SavedPosts";
import Analytics from "./pages/Analytics";
import Admin from "./pages/Admin";

import { UserProvider } from "./context/UserContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import AppNavbar from "./components/Navbar";

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <UserProvider>
            <div className="d-flex flex-column min-vh-100">
              <AppNavbar />
              <div className="flex-grow-1">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />

                  {/* Protected Routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/create-post" element={<CreatePost />} />
                    <Route path="/edit-post/:id" element={<EditPost />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/profile/:username" element={<Profile />} />
                    <Route path="/explore" element={<Explore />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/saved" element={<SavedPosts />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/admin" element={<Admin />} />
                  </Route>

                  {/* Root & Fallback redirect to dashboard */}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </div>
            </div>
          </UserProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
