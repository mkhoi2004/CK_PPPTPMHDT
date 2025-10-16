import React, { useState } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";

export default function ChangePassword() {
  const nav = useNavigate();
  const [form, setForm] = useState({ old_password: "", new_password: "" });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const fullName = localStorage.getItem("full_name") || "Người dùng";

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");

    try {
      const { data } = await api.post("/auth/change-password", form);
      setMsg(data.msg + " Bạn sẽ được yêu cầu đăng nhập lại.");
      localStorage.clear();
      setTimeout(() => nav("/login"), 1500);
    } catch (e) {
      setErr(e.response?.data?.msg || "Lỗi đổi mật khẩu");
    }
  };

  const logout = () => {
    localStorage.clear();
    nav("/login");
  };

  return (
    <div className="dashboard-page">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>{fullName}</h2>
        <a onClick={() => nav("/admin")}>Bảng điều khiển</a>
        <a className="active" onClick={() => nav("/change-password")}>
          Đổi mật khẩu
        </a>
        <a onClick={() => nav("/login-history")}>Lịch sử đăng nhập</a>
        <a onClick={logout}>Đăng xuất</a>
      </aside>

      {/* Main */}
      <main
        className="dashboard-main"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "calc(100vh - 40px)", // chiếm full chiều cao
        }}
      >
        <div
          className="card"
          style={{
            width: "100%",
            maxWidth: 600,
            padding: "40px 36px",
            borderRadius: 20,
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          }}
        >
          <h1 style={{ marginBottom: 24, textAlign: "center", fontSize: 28 }}>
            Đổi mật khẩu
          </h1>

          <form
            onSubmit={submit}
            style={{
              display: "grid",
              gap: 20,
            }}
          >
            <div style={{ display: "grid", gap: 8 }}>
              <label style={{ fontWeight: 600, color: "#374151" }}>
                Mật khẩu cũ
              </label>
              <input
                type="password"
                placeholder="Nhập mật khẩu cũ"
                value={form.old_password}
                onChange={(e) =>
                  setForm({ ...form, old_password: e.target.value })
                }
                required
                className="input"
              />
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              <label style={{ fontWeight: 600, color: "#374151" }}>
                Mật khẩu mới (≥8 ký tự)
              </label>
              <input
                type="password"
                placeholder="Nhập mật khẩu mới"
                minLength={8}
                value={form.new_password}
                onChange={(e) =>
                  setForm({ ...form, new_password: e.target.value })
                }
                required
                className="input"
              />
            </div>

            {err && (
              <div style={{ color: "#dc2626", fontWeight: 600 }}>{err}</div>
            )}
            {msg && (
              <div style={{ color: "#16a34a", fontWeight: 600 }}>{msg}</div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 12,
                marginTop: 10,
              }}
            >
              <button
                type="submit"
                className="btn-primary"
                style={{ minWidth: 120, fontSize: 15 }}
              >
                Xác nhận
              </button>
              <button
                type="button"
                className="btn"
                style={{
                  background: "#475569",
                  border: "none",
                  minWidth: 120,
                  fontSize: 15,
                }}
                onClick={() => nav(-1)}
              >
                ← Quay lại
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
