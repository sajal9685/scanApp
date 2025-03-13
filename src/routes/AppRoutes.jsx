import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseConfig"; // Firebase configuration

// Pages and Components
import Home from "../pages/Home";
import QRCodeGenerator from "../pages/QRCodeGenerator";
import AdminLogin from "../Admin/AdminLogin";
import Dashboard from "../Admin/Dashboard";
import AdminRegister from "../Admin/AdminRegister";
import UserRegister from "../User/UserRegister";
import UserLogin from "../User/UserLogin";
import UserDashboard from "../User/UserDashboard";
import HomePage from "../Homepage/HomePage";

const AppRoutes = () => {
  const [user, setUser] = useState(null); // Tracks user login status
  const [role, setRole] = useState(null); // Tracks user role: 'admin' or 'user'
  const [loading, setLoading] = useState(true); // Tracks auth state loading

  // Monitor authentication state and set user role
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // Replace mock role logic with actual role-fetching logic
        // Example: Fetch role from Firestore or custom claims
        const fetchRole = async () => {
          const email = currentUser.email;

          if (email === "cs2022239@global.org.in") {
            setRole("admin");
          } else {
            setRole("user");
          }
        };

        fetchRole();
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false); // Auth state resolved
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  // Protect routes for authorized users only
  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (loading) return <div>Loading...</div>; // Show loading state while checking auth

    // Restrict access based on role
    if (!user) return <Navigate to="/UserLogin" />;
    if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/" />; // Redirect unauthorized users

    return children;
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/HomePage" element={<HomePage />} />
      <Route path="/Home" element={<Home />} />
      <Route path="/UserRegister" element={<UserRegister />} />
      <Route path="/about" element={<QRCodeGenerator />} />

      {/* Admin Login */}
      <Route
        path="/AdminLogin"
        element={user ? <Navigate to="/dashboard" /> : <AdminLogin />}
      />

      {/* Admin Registration (Public Access) */}
      <Route path="/AdminRegister" element={<AdminRegister />} />

      {/* Protected Admin Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* User Login */}
      <Route
        path="/UserLogin"
        element={user ? <Navigate to="/UserDashboard" /> : <UserLogin />}
      />

      {/* Protected User Dashboard */}
      <Route
        path="/UserDashboard"
        element={
          <ProtectedRoute allowedRoles={["user", "admin"]}>
            <UserDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
