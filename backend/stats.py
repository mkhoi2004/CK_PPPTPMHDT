from flask import Blueprint, request, jsonify, send_file, abort
from flask_jwt_extended import jwt_required, get_jwt
from sqlalchemy import func
from database import db
from models import DuDoan
from datetime import datetime
from utils_pdf import build_report_pdf
import io

bp_stats = Blueprint("stats", __name__, url_prefix="/api/stats")

def _require_admin():
  claims = get_jwt()
  if claims.get("role") != "admin":
    abort(403, description="Forbidden")

def _parse_date(s):
  if not s:
    return None
  s = s.strip()
  if not s:
    return None
  try:
    return datetime.fromisoformat(s)
  except Exception:
    return None

@bp_stats.get("")
@jwt_required()
def stats_overview():
  _require_admin()
  start = _parse_date(request.args.get("start_date"))
  end = _parse_date(request.args.get("end_date"))

  q = (db.session.query(DuDoan.nhan_dan_benh, func.count().label("count"))
        .group_by(DuDoan.nhan_dan_benh))
  if start:
    q = q.filter(DuDoan.thoi_gian_nhan_kq >= start)
  if end:
    q = q.filter(DuDoan.thoi_gian_nhan_kq <= end)

  rows = q.all()
  total = sum(int(c) for _, c in rows) or 1
  data = [{"label": int(lbl), "count": int(c), "ratio": round(int(c)/total, 4)} for lbl, c in rows]
  return jsonify({"total": total, "items": data})

@bp_stats.get("/accuracy")
@jwt_required()
def stats_accuracy():
  _require_admin()
  start = _parse_date(request.args.get("start_date"))
  end = _parse_date(request.args.get("end_date"))

  q = (db.session.query(DuDoan.nhan_dan_benh, func.avg(DuDoan.do_chinh_xac).label("avg_acc"))
        .group_by(DuDoan.nhan_dan_benh))
  if start:
    q = q.filter(DuDoan.thoi_gian_nhan_kq >= start)
  if end:
    q = q.filter(DuDoan.thoi_gian_nhan_kq <= end)

  rows = q.all()
  items = [{"label": int(lbl), "avg_accuracy": float(acc or 0.0)} for lbl, acc in rows]
  return jsonify({"items": items})

@bp_stats.get("/report")
@jwt_required()
def stats_report():
  _require_admin()
  start_raw = request.args.get("start_date") or ""
  end_raw   = request.args.get("end_date")   or ""
  start = _parse_date(request.args.get("start_date"))
  end   = _parse_date(request.args.get("end_date"))

  q = (db.session.query(DuDoan.nhan_dan_benh, func.count().label("count"))
        .group_by(DuDoan.nhan_dan_benh))
  if start:
    q = q.filter(DuDoan.thoi_gian_nhan_kq >= start)
  if end:
    q = q.filter(DuDoan.thoi_gian_nhan_kq <= end)

  rows = q.all()
  items = [{"label": int(lbl), "count": int(c)} for lbl, c in rows]

  buf = io.BytesIO()
  build_report_pdf(buf, start_raw, end_raw, items)
  buf.seek(0)

  fname = "report.pdf"
  if start_raw or end_raw:
    s = start_raw.replace("-", "")
    e = end_raw.replace("-", "")
    fname = f"report_{s or '...'}_{e or '...'}.pdf"

  return send_file(buf, mimetype="application/pdf", as_attachment=True, download_name=fname)

@bp_stats.route("", methods=["OPTIONS"])
def stats_preflight():
  return ("", 204)
