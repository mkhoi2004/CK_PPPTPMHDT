import React, { useState } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";
import "../styles/auth.css";

export default function ChangePassword() {
  const nav = useNavigate();
  const [form, setForm] = useState({ old_password: "", new_password: "" });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

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

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ gridTemplateColumns: "1fr" }}>
        <section className="auth-right">
          <div className="auth-title">Đổi mật khẩu</div>

          <form className="auth-form" onSubmit={submit}>
            <div className="auth-field">
              <label className="auth-label">Mật khẩu cũ</label>
              <input
                className="auth-input"
                type="password"
                placeholder="Nhập mật khẩu cũ"
                value={form.old_password}
                onChange={(e) =>
                  setForm({ ...form, old_password: e.target.value })
                }
                required
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">Mật khẩu mới (≥8 ký tự)</label>
              <input
                className="auth-input"
                type="password"
                placeholder="Nhập mật khẩu mới"
                minLength={8}
                value={form.new_password}
                onChange={(e) =>
                  setForm({ ...form, new_password: e.target.value })
                }
                required
              />
            </div>

            {err && <div style={{ color: "#ffb4b4" }}>{err}</div>}
            {msg && <div style={{ color: "#7ef" }}>{msg}</div>}

            <div className="auth-actions">
              <button className="auth-btn" type="submit">
                Xác nhận
              </button>

              {/* Nút quay lại có cùng màu và bo tròn */}
              <button
                type="button"
                className="auth-btn auth-btn--outline"
                onClick={() => nav(-1)}
              >
                ← Quay lại
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
