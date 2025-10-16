import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ChangePassword from "./pages/ChangePassword.jsx";
import UserDashboard from "./pages/UserDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import LoginHistory from "./pages/LoginHistory.jsx";
import UserChangePassword from "./pages/UserChangePassword.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Navbar from "./components/Navbar.jsx";

export default function App(){
  const location = useLocation();
  const hideNavbar = location.pathname.startsWith("/user");  // 👈 các trang user

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/change-password" element={<ChangePassword/>} />
          <Route path="/admin" element={<AdminDashboard/>} />
          <Route path="/login-history" element={<LoginHistory/>} />
          {/* USER */}
          <Route path="/user" element={<UserDashboard/>} />
          <Route path="/user/change-password" element={<UserChangePassword/>} />
        </Route>
      </Routes>
    </>
  );
}
