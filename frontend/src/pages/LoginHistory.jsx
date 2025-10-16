import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import "../styles/dashboard.css";

export default function LoginHistory(){
  const nav = useNavigate();

  const fullName = localStorage.getItem("full_name") || "Người dùng";
  const token = localStorage.getItem("access_token");

  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const load = async (p = page, ps = pageSize) => {
    try{
      const { data } = await api.get("/auth/login-history", {
        params: { page: p, page_size: ps },
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setRows(data.items || []);
      setTotal(data.total || 0);
      setPage(data.page || 1);
      setPageSize(data.page_size || ps);
    }catch{
      alert("Không tải được lịch sử đăng nhập");
    }
  };

  useEffect(()=>{ load(1, pageSize); /* eslint-disable-next-line */ }, []);

  const next = () => { if(page < totalPages) load(page + 1, pageSize); };
  const prev = () => { if(page > 1) load(page - 1, pageSize); };

  const logout = () => {
    localStorage.clear();
    nav("/login");
  };

  return (
    <div className="dashboard-page">
      {/* ===== Sidebar tái sử dụng y như Dashboard ===== */}
      <aside className="sidebar">
        <h2 style={{textTransform:"capitalize"}}>{fullName}</h2>

        <a onClick={() => nav("/admin")}>Bảng điều khiển</a>
        <a onClick={() => nav("/change-password")}>Đổi mật khẩu</a>
        <a className="active" onClick={() => nav("/login-history")}>
          Lịch sử đăng nhập
        </a>
        <a onClick={logout}>Đăng xuất</a>
      </aside>

      {/* ===== Main ===== */}
      <main className="dashboard-main">
        <div className="dashboard-header">
          <h1>Lịch sử đăng nhập</h1>
        </div>

        <div className="card">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th style={{width: 80}}>#</th>
                  <th style={{minWidth: 200}}>Tài khoản</th>
                  <th style={{minWidth: 260}}>Thời gian (UTC)</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx)=>(
                  <tr key={idx}>
                    <td>{(page-1)*pageSize + idx + 1}</td>
                    <td style={{fontWeight: 700}}>{r.username}</td>
                    <td>{new Date(r.time).toLocaleString("vi-VN", {hour12:false})}</td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{textAlign:"center", padding: 24, color:"#6b7280"}}>
                      Chưa có dữ liệu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="pager">
            <div style={{display:"flex", gap:12, alignItems:"center"}}>
              <button className="btn" onClick={prev} disabled={page<=1}>Trang trước</button>
              <span className="page-stat">Trang <b>{page}</b>/<b>{totalPages}</b></span>
              <button className="btn" onClick={next} disabled={page>=totalPages}>Trang sau</button>
            </div>

            <div style={{display:"flex", gap:10, alignItems:"center"}}>
              <span className="page-stat">Mỗi trang:</span>
              <select
                className="select"
                value={pageSize}
                onChange={(e)=>{ const ps = parseInt(e.target.value,10); load(1, ps); }}
              >
                {[5,10,20,50].map(n=> <option key={n} value={n}>{n}</option>)}
              </select>

              <span className="page-stat">Tổng: <b>{total}</b></span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
