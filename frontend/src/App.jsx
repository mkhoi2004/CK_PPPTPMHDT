import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ChangePassword from "./pages/ChangePassword.jsx";
import UserDashboard from "./pages/UserDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import LoginHistory from "./pages/LoginHistory.jsx"; // NEW
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Navbar from "./components/Navbar.jsx";

export default function App(){
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/change-password" element={<ChangePassword/>} />
          <Route path="/user" element={<UserDashboard/>} />
          <Route path="/admin" element={<AdminDashboard/>} />
          <Route path="/login-history" element={<LoginHistory/>} /> {/* NEW */}
        </Route>
      </Routes>
    </>
  );
}
