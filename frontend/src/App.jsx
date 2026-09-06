import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import CreatePost from "./pages/CreatePost";
import EditPost from "./pages/EditPost";
import Profile from "./pages/Profile";
import { UserProvider } from "./context/UserContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <UserProvider>
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
              </Route>

              {/* Root & Fallback redirect to dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </UserProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
