import React, { useState } from "react";
import { api } from "../services/api";
import "../styles/userdash.css";

export default function UserDashboard() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onPick = (f) => {
    setFile(f || null);
    setResult(null);
    setErr("");
    // xem trước ảnh (optional)
    if (f) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview("");
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setResult(null);
    if (!file) { setErr("Hãy chọn ảnh"); return; }

    const fd = new FormData();
    fd.append("file", file); // phải khớp key với backend

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

  return (
    <div className="userdash">
      <div className="userdash-card">
        <div className="userdash-title">Dự đoán bệnh lá lúa</div>
        <div className="userdash-sub">Chọn ảnh lá lúa của bạn và nhấn dự đoán</div>

        <form className="userdash-form" onSubmit={submit}>
          <input
            className="userdash-file"
            type="file"
            accept="image/*"
            onChange={(e) => onPick(e.target.files?.[0])}
            disabled={loading}
          />
          <button className="userdash-btn" type="submit" disabled={loading || !file}>
            {loading ? "Đang dự đoán..." : "Dự đoán"}
          </button>
        </form>

        {preview && <img className="userdash-preview" src={preview} alt="Xem trước" />}

        {err && <div className="userdash-error">{err}</div>}

        {result && (
          <div className="userdash-result">
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>
              Kết quả: {result.label_name}
            </div>
            <div style={{ fontSize: 16 }}>
              Độ chính xác: <b>{Math.round((result.accuracy || 0) * 100)}%</b>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
