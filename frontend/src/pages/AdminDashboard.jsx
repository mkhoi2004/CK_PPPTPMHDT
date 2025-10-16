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
  const [data, setData] = useState([]);           // đếm theo loại
  const [accData, setAccData] = useState([]);     // độ chính xác theo loại (%)

  const load = async () => {
    try {
      const params = {};
      if (start) params.start_date = start;
      if (end) params.end_date = end;

      // 1) Đếm theo loại
      const { data: d1 } = await api.get("/stats", { params });
      const rows = (d1.items || []).map((r) => ({
        name: LABELS[r.label] || r.label,
        count: r.count,
      }));
      setData(rows);

      // 2) Độ chính xác theo loại
      const { data: d2 } = await api.get("/stats/accuracy", { params });
      const accRows = (d2.items || []).map((r) => ({
        name: LABELS[r.label] || r.label,
        acc: Math.round((r.avg_accuracy || 0) * 10000) / 100, // %
      }));
      setAccData(accRows);
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
        <h2>{fullName}</h2>

        <a href="#" className="active">Bảng điều khiển</a>
        <a onClick={() => nav("/change-password")}>Đổi mật khẩu</a>
        {/* NEW: đặt ở giữa */}
        <a onClick={() => nav("/login-history")}>Lịch sử đăng nhập</a>
        <a onClick={logout}>Đăng xuất</a>
      </aside>

      {/* Main */}
      <main className="dashboard-main">
        <div className="dashboard-header">
          <h1>Thống kê hệ thống</h1>
          <button onClick={exportPDF}>Xuất PDF</button>
        </div>

        {/* Cards tổng quan */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Tổng dự đoán</h3>
            <div className="value">{data.reduce((a, b) => a + (b.count || 0), 0)}</div>
            <div className="change">+5.4% tháng này</div>
          </div>
          <div className="stat-card">
            <h3>Loại bệnh phổ biến</h3>
            <div className="value">{[...data].sort((a,b)=>b.count-a.count)[0]?.name || "—"}</div>
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

        {/* NEW: Grid 2 biểu đồ */}
        <div className="charts-grid">
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

          <div className="chart-box">
            <h3>Độ chính xác trung bình (%)</h3>
            <BarChart width={700} height={350} data={accData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="acc" fill="#10b981" />
            </BarChart>
          </div>
        </div>
      </main>
    </div>
  );
}
