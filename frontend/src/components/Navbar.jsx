import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const nav = useNavigate();
  const { pathname } = useLocation();

  // 👉 Ẩn Navbar ở các trang đăng nhập, đăng ký, admin dashboard, đổi mật khẩu
  const hideNavPaths = ["/login", "/register", "/admin", "/change-password"];
  if (hideNavPaths.some(path => pathname.startsWith(path))) return null;

  // 👉 Lấy thông tin từ localStorage
  const token = localStorage.getItem("access_token");
  const role = localStorage.getItem("role");
  const fullName = localStorage.getItem("full_name") || "";

  // 👉 Xử lý đăng xuất
  const logout = () => {
    localStorage.clear();
    nav("/login");
  };

  return (
    <div
      className="navbar"
      style={{
        display: "flex",
        alignItems: "center",
        padding: "10px 20px",
        background: "#f8f9fa",
        borderBottom: "1px solid #e5e7eb",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* Bỏ "Trang chủ" cho gọn */}
      {!token ? (
        <>
          <Link to="/login" style={{ marginLeft: 12, textDecoration: "none" }}>
            Đăng nhập
          </Link>
          <Link to="/register" style={{ marginLeft: 12, textDecoration: "none" }}>
            Đăng ký
          </Link>
        </>
      ) : (
        <>
          <span style={{ marginLeft: 12 }}>Xin chào, {fullName}</span>
          {role === "admin" ? (
            <Link to="/admin" style={{ marginLeft: 12, textDecoration: "none" }}>
              Admin
            </Link>
          ) : (
            <Link to="/user" style={{ marginLeft: 12, textDecoration: "none" }}>
              User
            </Link>
          )}
          <Link
            to="/change-password"
            style={{ marginLeft: 12, textDecoration: "none" }}
          >
            Đổi mật khẩu
          </Link>
          <button
            onClick={logout}
            style={{
              marginLeft: 12,
              background: "#2563eb",
              color: "#fff",
              border: "none",
              padding: "6px 12px",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Đăng xuất
          </button>
        </>
      )}
    </div>
  );
}
