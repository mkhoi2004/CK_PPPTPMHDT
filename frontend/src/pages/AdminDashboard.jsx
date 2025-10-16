import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import "../styles/dashboard.css";

const LABELS = { 0: "Bạc lá", 1: "Đốm nâu", 2: "Lá than đen" };

export default function AdminDashboard() {
  const nav = useNavigate();
  const fullName = localStorage.getItem("full_name") || "Người dùng";

  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [data, setData] = useState([]);

  const load = async () => {
    try {
      const params = {};
      if (start) params.start_date = start;
      if (end) params.end_date = end;

      const { data } = await api.get("/stats", { params });
      const rows = (data.items || []).map((r) => ({
        name: LABELS[r.label] || r.label,
        count: r.count,
      }));
      setData(rows);
    } catch {
      alert("Không tải được thống kê");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const exportPDF = async () => {
    try {
      const res = await api.get("/stats/report", { responseType: "blob" });
      const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = "report.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Không xuất được PDF");
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
        {/* Hiển thị tên thay cho chữ Admin */}
        <h2>{fullName}</h2>

        <a href="#" className="active">Bảng điều khiển</a>
        <a onClick={() => nav("/change-password")}>Đổi mật khẩu</a>
        <a onClick={logout}>Đăng xuất</a>
      </aside>

      {/* Main content */}
      <main className="dashboard-main">
        <div className="dashboard-header">
          <h1>Thống kê hệ thống</h1>
          <button onClick={exportPDF}>Xuất PDF</button>
        </div>

        {/* Cards tổng quan */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Tổng dự đoán</h3>
            <div className="value">{data.reduce((a, b) => a + b.count, 0)}</div>
            <div className="change">+5.4% tháng này</div>
          </div>
          <div className="stat-card">
            <h3>Loại bệnh phổ biến</h3>
            <div className="value">{data[0]?.name || "—"}</div>
            <div className="change">Top 1</div>
          </div>
          <div className="stat-card">
            <h3>Ngày cập nhật</h3>
            <div className="value">{new Date().toLocaleDateString("vi-VN")}</div>
          </div>
        </div>

        {/* Bộ lọc */}
        <div className="filters">
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
          <button onClick={load}>Lọc</button>
        </div>

        {/* Biểu đồ */}
        <div className="chart-box">
          <h3>Thống kê theo loại bệnh</h3>
          <BarChart width={700} height={350} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#2563eb" />
          </BarChart>
        </div>
      </main>
    </div>
  );
}
