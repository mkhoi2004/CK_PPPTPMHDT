import React, { useState } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";
import "../styles/userdash.css";

export default function UserDashboard() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("access_token"));
  const nav = useNavigate();

  const fullName = localStorage.getItem("full_name") || "Người dùng";

  const onPick = (f) => {
    setFile(f || null);
    setResult(null);
    setErr("");
    if (f) setPreview(URL.createObjectURL(f));
    else setPreview("");
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setResult(null);
    if (!file) {
      setErr("Hãy chọn ảnh");
      return;
    }

    const fd = new FormData();
    fd.append("file", file);

    try {
      setLoading(true);
      const { data } = await api.post("/predict", fd, { timeout: 60000 });
      setResult(data);
    } catch (ex) {
      const msg = ex?.response?.data?.msg || ex.message || "Lỗi dự đoán";
      console.error("Predict error:", ex?.response || ex);
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Đăng xuất và chuyển về trang Login
  const logout = () => {
    localStorage.clear();
    setLoggedIn(false);
    setFile(null);
    setPreview("");
    setResult(null);
    setErr("");
    nav("/login", { replace: true });
  };

  return (
    <div className="dashboard-page">
      {/* Sidebar người dùng */}
      <aside className="sidebar user-sidebar">
        <h2>{fullName}</h2>
        <a className="active" onClick={() => nav("/user")}>
          Dự đoán bệnh
        </a>
        <a onClick={() => nav("/user/change-password")}>Đổi mật khẩu</a>
        <a onClick={logout}>Đăng xuất</a>
      </aside>

      {/* Nội dung chính */}
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
            maxWidth: 600,
            padding: "36px 32px",
            borderRadius: 20,
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            background: "white",
            textAlign: "center",
          }}
        >
          <div
            className="userdash-title"
            style={{
              fontSize: 26,
              fontWeight: 700,
              marginBottom: 12,
              color: "#1e293b",
            }}
          >
            Dự đoán bệnh lá lúa
          </div>

          <div
            className="userdash-sub"
            style={{ fontSize: 15, color: "#475569", marginBottom: 20 }}
          >
            {loggedIn ? (
              <>
                Chọn ảnh lá lúa của bạn và nhấn <b>Dự đoán</b> để xem kết quả.
              </>
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

          <form className="userdash-form" onSubmit={submit}>
  {/* Input ẩn */}
  <input
    id="upload"
    type="file"
    accept="image/*"
    style={{ display: "none" }}
    onChange={(e) => onPick(e.target.files?.[0])}
    disabled={loading || !loggedIn}
  />

  {/* Nút chọn file */}
  <label
    htmlFor="upload"
    className="userdash-file-label"
    style={{
      flex: 1,
      height: 44,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      border: "1px solid #d1d5db",
      borderRadius: 8,
      padding: "0 12px",
      background: "#fff",
      cursor: loading || !loggedIn ? "not-allowed" : "pointer",
      opacity: loading || !loggedIn ? 0.6 : 1,
    }}
  >
    <span>
      {file ? file.name : "Chưa chọn tệp nào"}
    </span>
    <span
      style={{
        background: "#2563eb",
        color: "#fff",
        padding: "6px 12px",
        borderRadius: 6,
        fontWeight: 600,
      }}
    >
      Chọn tệp
    </span>
  </label>

  {/* Nút dự đoán */}
  <button
    className="userdash-btn"
    type="submit"
    disabled={loading || !file || !loggedIn}
    style={{ height: 44, minWidth: 120 }}
  >
    {loading ? "Đang dự đoán..." : "Dự đoán"}
  </button>
</form>


          {preview && (
            <img
              className="userdash-preview"
              src={preview}
              alt="Xem trước"
              style={{
                marginTop: 16,
                maxHeight: 220,
                objectFit: "contain",
                borderRadius: 12,
              }}
            />
          )}

          {err && (
            <div
              className="userdash-error"
              style={{ color: "#dc2626", marginTop: 10, fontWeight: 600 }}
            >
              {err}
            </div>
          )}

          {result && (
            <div
              className="userdash-result"
              style={{
                marginTop: 20,
                background: "#f0f9ff",
                borderRadius: 10,
                padding: "14px 12px",
              }}
            >
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  marginBottom: 6,
                  color: "#0f172a",
                }}
              >
                Kết quả: {result.label_name}
              </div>
              <div style={{ fontSize: 16, color: "#334155" }}>
                Độ chính xác:{" "}
                <b>{Math.round((result.accuracy || 0) * 100)}%</b>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
