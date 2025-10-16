import React, { useState } from "react";
import { api } from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import "../styles/auth.css";

export default function Login(){
  const nav = useNavigate();
  const [form, setForm] = useState({ username:"", password:"" });
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const { data } = await api.post("/auth/login", {
        username: form.username,
        password: form.password
      });
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("full_name", data.full_name);
      nav(data.role === "admin" ? "/admin" : "/user");
    } catch (e){
      setErr(e.response?.data?.msg || "Lỗi đăng nhập");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Panel trái */}
        <section className="auth-left">
          <h1>Báo cáo cuối kì</h1>
          <p>Nhóm 11_Phương pháp phát triển phần mềm hướng đối tượng</p>
          <p>Xây dựng mô hình phân loại bệnh dựa trên ảnh lá lúa</p>

          <div className="auth-social">
            <i className="fa-brands fa-facebook-f" />
            <i className="fa-brands fa-google" />
            <i className="fa-brands fa-pinterest-p" />
          </div>
        </section>

        {/* Panel phải */}
        <section className="auth-right">
          <div className="auth-title">Đăng nhập tài khoản</div>
          <form className="auth-form" onSubmit={submit}>
            <input
              className="auth-input"
              placeholder="Tên tài khoản"
              value={form.username}
              onChange={e=>setForm({...form, username:e.target.value})}
              autoFocus
              required
            />
            <input
              className="auth-input"
              type="password"
              placeholder="Mật khẩu"
              value={form.password}
              onChange={e=>setForm({...form, password:e.target.value})}
              required
            />
            {err && <div style={{color:"#ffb4b4"}}>{err}</div>}
            <div className="auth-actions">
              <button className="auth-btn" type="submit">Đăng nhập</button>
              <Link className="auth-link" to="/register">Chưa có tài khoản?</Link>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
