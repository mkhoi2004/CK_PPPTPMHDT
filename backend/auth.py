from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt
from database import db
from models import TaiKhoan, LichSuDangNhap
from datetime import datetime
import re

bp_auth = Blueprint("auth", __name__, url_prefix="/api/auth")

PHONE_RE = re.compile(r"^0\d{9,10}$")   # 10-11 số, bắt đầu bằng 0

@bp_auth.post("/login")
def login():
    data = request.get_json() or {}
    # Chỉ login bằng username (khớp tiêu chí)
    username = (data.get("username") or data.get("username_or_email") or "").strip()
    password = data.get("password", "")

    if not username or not password:
        return jsonify({"msg": "Thiếu thông tin đăng nhập"}), 400

    user = TaiKhoan.query.filter(TaiKhoan.ten_tai_khoan == username).first()
    if not user or not user.check_password(password):
        return jsonify({"msg": "Sai thông tin đăng nhập"}), 401

    role = "admin" if user.ma_quyen_han == "001" else "user"
    token = create_access_token(identity=str(user.ma_tai_khoan),
                                additional_claims={"role": role})

    # log lịch sử (không làm hỏng luồng nếu lỗi)
    try:
        db.session.add(LichSuDangNhap(
            ma_tai_khoan=user.ma_tai_khoan,
            thoi_gian_dn=datetime.utcnow(),
            ten_dang_nhap_tai_khoan=user.ten_tai_khoan
        ))
        db.session.commit()
    except Exception:
        db.session.rollback()

    return jsonify({
        "access_token": token,
        "role": role,
        "full_name": user.ho_va_ten or user.ten_tai_khoan
    }), 200

@bp_auth.post("/register")
def register():
    data = request.get_json() or {}
    username   = (data.get("username")   or "").strip()
    full_name  = (data.get("full_name")  or "").strip()
    phone      = (data.get("phone")      or "").strip()
    password   = data.get("password", "")

    # ✅ Bắt buộc đủ như tiêu chí bảng
    if not all([username, full_name, phone, password]):
        return jsonify({"msg":"Thiếu thông tin: cần username, họ tên, sđt, mật khẩu"}), 400
    if len(password) < 8:
        return jsonify({"msg":"Mật khẩu phải >= 8 ký tự"}), 400
    if not PHONE_RE.fullmatch(phone):
        return jsonify({"msg":"Số điện thoại không hợp lệ (phải 10-11 số, bắt đầu bằng 0)"}), 400

    if TaiKhoan.query.filter(TaiKhoan.ten_tai_khoan == username).first():
        return jsonify({"msg":"Username đã tồn tại"}), 409

    u = TaiKhoan(
        ma_quyen_han="002",
        ten_tai_khoan=username,
        ho_va_ten=full_name,
        so_dien_thoai=phone,
    )
    u.set_password(password)
    db.session.add(u)
    db.session.commit()
    return jsonify({"msg":"Đăng ký thành công"}), 201

@bp_auth.post("/change-password")
@jwt_required()
def change_password():
    data = request.get_json() or {}
    old_pw = data.get("old_password", "")
    new_pw = data.get("new_password", "")

    if len(new_pw) < 8:
        return jsonify({"msg": "Mật khẩu mới phải >= 8 ký tự"}), 400

    uid = int(get_jwt()["sub"])
    user = TaiKhoan.query.get(uid)
    if not user or not user.check_password(old_pw):
        return jsonify({"msg":"Mật khẩu cũ không đúng"}), 400

    user.set_password(new_pw)
    db.session.commit()
    return jsonify({"msg":"Đổi mật khẩu thành công. Vui lòng đăng nhập lại."}), 200
