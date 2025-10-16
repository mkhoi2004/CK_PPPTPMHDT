import React, { useState } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";

export default function UserChangePassword() {
  const nav = useNavigate();
  const [form, setForm] = useState({ old_password: "", new_password: "" });
  const [show, setShow] = useState({ old: false, new: false });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("access_token"));

  const fullName = localStorage.getItem("full_name") || "Người dùng";

  const submit = async (e) => {
    e.preventDefault();
    if (!loggedIn) return;
    setErr("");
    setMsg("");

    try {
      const { data } = await api.post("/auth/change-password", form);
      setMsg(data.msg + " Bạn sẽ được yêu cầu đăng nhập lại.");
      localStorage.clear();
      setLoggedIn(false);
      setTimeout(() => nav("/login", { replace: true }), 1200);
    } catch (e) {
      setErr(e.response?.data?.msg || "Lỗi đổi mật khẩu");
    }
  };

  // 🔹 Đăng xuất và chuyển về trang Login
  const logout = () => {
    localStorage.clear();
    setLoggedIn(false);
    setForm({ old_password: "", new_password: "" });
    setMsg("");
    setErr("");
    nav("/login", { replace: true });
  };

  return (
    <div className="dashboard-page">
      {/* Sidebar User */}
      <aside className="sidebar user-sidebar">
        <h2>{fullName}</h2>
        <a onClick={() => nav("/user")}>Dự đoán bệnh</a>
        <a className="active" onClick={() => nav("/user/change-password")}>
          Đổi mật khẩu
        </a>
        <a onClick={logout}>Đăng xuất</a>
      </aside>

      {/* Main Content */}
      <main
        className="dashboard-main"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "calc(100vh - 40px)",
          background:
            "radial-gradient(800px 400px at 60% 40%, #ecf3ff 0%, transparent 70%), #f5f7fb",
        }}
      >
        <div
          className="card"
          style={{
            width: "100%",
            maxWidth: 550,
            padding: "36px 32px",
            borderRadius: 20,
            boxShadow: "0 10px 24px rgba(0,0,0,0.08)",
            background: "white",
          }}
        >
          <h1
            style={{
              marginBottom: 22,
              textAlign: "center",
              fontSize: 26,
              color: "#1e293b",
            }}
          >
            Đổi mật khẩu
          </h1>

          <div style={{ color: "#475569", marginBottom: 10, textAlign: "center" }}>
            {loggedIn ? (
              "Nhập mật khẩu cũ và mật khẩu mới để cập nhật."
            ) : (
              <>
                Bạn đã <b>đăng xuất</b>.{" "}
                <button
                  type="button"
                  onClick={() => nav("/login")}
                  style={{
                    marginLeft: 6,
                    background: "transparent",
                    border: "none",
                    color: "#2563eb",
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  Đăng nhập lại
                </button>{" "}
                để tiếp tục.
              </>
            )}
          </div>

          <form onSubmit={submit} style={{ display: "grid", gap: 18 }}>
            {/* Mật khẩu cũ */}
            <div style={{ display: "grid", gap: 6, position: "relative" }}>
              <label style={{ fontWeight: 600, color: "#334155" }}>Mật khẩu cũ</label>
              <input
                type={show.old ? "text" : "password"}
                placeholder="Nhập mật khẩu cũ"
                value={form.old_password}
                onChange={(e) =>
                  setForm({ ...form, old_password: e.target.value })
                }
                required
                className="input"
                style={{ paddingRight: 44 }}
                disabled={!loggedIn}
              />
              <span
                className="eye-toggle"
                onClick={() => setShow({ ...show, old: !show.old })}
                style={{
                  cursor: loggedIn ? "pointer" : "not-allowed",
                  opacity: loggedIn ? 0.8 : 0.4,
                }}
              >
                {show.old ? "🙈" : "👁️"}
              </span>
            </div>

            {/* Mật khẩu mới */}
            <div style={{ display: "grid", gap: 6, position: "relative" }}>
              <label style={{ fontWeight: 600, color: "#334155" }}>
                Mật khẩu mới (≥8 ký tự)
              </label>
              <input
                type={show.new ? "text" : "password"}
                placeholder="Nhập mật khẩu mới"
                minLength={8}
                value={form.new_password}
                onChange={(e) =>
                  setForm({ ...form, new_password: e.target.value })
                }
                required
                className="input"
                style={{ paddingRight: 44 }}
                disabled={!loggedIn}
              />
              <span
                className="eye-toggle"
                onClick={() => setShow({ ...show, new: !show.new })}
                style={{
                  cursor: loggedIn ? "pointer" : "not-allowed",
                  opacity: loggedIn ? 0.8 : 0.4,
                }}
              >
                {show.new ? "🙈" : "👁️"}
              </span>
            </div>

            {err && <div style={{ color: "#dc2626", fontWeight: 600 }}>{err}</div>}
            {msg && <div style={{ color: "#16a34a", fontWeight: 600 }}>{msg}</div>}

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 10,
                marginTop: 10,
              }}
            >
              <button
                type="submit"
                className="btn-primary"
                style={{
                  minWidth: 120,
                  fontSize: 15,
                  background: "#2563eb",
                }}
                disabled={!loggedIn}
              >
                Xác nhận
              </button>
              <button
                type="button"
                className="btn"
                style={{
                  background: "#64748b",
                  border: "none",
                  minWidth: 120,
                  fontSize: 15,
                }}
                onClick={() => nav("/user")}
              >
                ← Về trang dự đoán
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
