import React, { useState } from "react";
import { api } from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import "../styles/auth.css";

export default function Register(){
  const nav = useNavigate();
  const [form, setForm] = useState({
    username:"", full_name:"", phone:"", password:""
  });
  const [showPass, setShowPass] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setOk("");
    try {
      await api.post("/auth/register", form);
      setOk("Đăng ký thành công, mời đăng nhập!");
      setTimeout(()=> nav("/login"), 800);
    } catch (ex) {
      setErr(ex?.response?.data?.msg || "Đăng ký thất bại");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <section className="auth-left">
          <h1>Báo cáo cuối kì</h1>
          <p>Nhóm 11_Phương pháp phát triển phần mềm hướng đối tượng</p>
          <p>Xây dựng mô hình phân loại bệnh dựa trên ảnh lá lúa</p>
          <div className="auth-social">
            <div className="auth-social">
                <a
                  href="https://www.facebook.com/tran.nguyen.minh.khoi.380762"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                >
                  <i className="fa-brands fa-facebook-f" />
                </a>

                <a
                  href="https://www.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                >
                  <i className="fa-brands fa-google" />
                </a>

                <a
                  href="https://www.pinterest.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                >
                  <i className="fa-brands fa-pinterest-p" />
  </a>
</div>

          </div>
        </section>

        <section className="auth-right">
          <div className="auth-title">Đăng ký tài khoản</div>
          <form className="auth-form" onSubmit={submit}>
            <input
              className="auth-input"
              placeholder="Tên tài khoản"
              value={form.username}
              onChange={(e)=>setForm({...form, username:e.target.value})}
              required
            />
            <input
              className="auth-input"
              placeholder="Họ và tên"
              value={form.full_name}
              onChange={(e)=>setForm({...form, full_name:e.target.value})}
              required
            />
            <input
              className="auth-input"
              placeholder="Số điện thoại (bắt đầu bằng 0)"
              value={form.phone}
              onChange={(e)=>setForm({...form, phone:e.target.value})}
              pattern="^0\\d{9,10}$"
              title="SĐT phải 10–11 số, bắt đầu bằng 0"
              required
            />
            
            {/* Mật khẩu có icon 👁️ */}
            <div className="auth-field" style={{ position: "relative" }}>
              <input
                className="auth-input"
                type={showPass ? "text" : "password"}
                placeholder="Mật khẩu (>=8 ký tự)"
                value={form.password}
                onChange={(e)=>setForm({...form, password:e.target.value})}
                minLength={8}
                required
                style={{ paddingRight: 42 }}
              />
              <span className="eye-toggle" onClick={()=>setShowPass(!showPass)}>
                {showPass ? "🙈" : "👁️"}
              </span>
            </div>

            {ok && <div style={{color:"#7ef"}}>{ok}</div>}
            {err && <div style={{color:"#ffb4b4"}}>{err}</div>}

            <div className="auth-actions">
              <button className="auth-btn" type="submit">Đăng ký</button>
              <Link className="auth-link" to="/login">Đã có tài khoản?</Link>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
