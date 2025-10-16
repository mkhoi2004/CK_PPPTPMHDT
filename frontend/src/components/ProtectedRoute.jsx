import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function ProtectedRoute() {
  const token = localStorage.getItem("access_token");
  if (!token) return <Navigate to="/login" replace />;

  try {
    const payload = jwtDecode(token); // decode token
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      localStorage.removeItem("access_token");
      return <Navigate to="/login" replace />;
    }
    return <Outlet />;
  } catch (err) {
    console.error("Invalid token:", err);
    localStorage.removeItem("access_token");
    return <Navigate to="/login" replace />;
  }
}
