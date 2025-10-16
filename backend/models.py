# models.py
from datetime import datetime
from database import db
from passlib.hash import bcrypt

class QuyenHan(db.Model):
    __tablename__ = "quyen_han"
    ma_quyen_han = db.Column(db.String(3), primary_key=True)    # '001'/'002'
    ten_quyen_han = db.Column(db.String(50), unique=True, nullable=False)

class TaiKhoan(db.Model):
    __tablename__ = "tai_khoan"
    ma_tai_khoan = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    ma_quyen_han  = db.Column(db.String(3), db.ForeignKey("quyen_han.ma_quyen_han"), nullable=False)
    ten_tai_khoan = db.Column(db.String(50), unique=True, nullable=False)
    mat_khau      = db.Column(db.String(255), nullable=False)   # bcrypt (tương thích pgcrypto('bf'))
    so_dien_thoai = db.Column(db.String(20))
    ho_va_ten     = db.Column(db.String(100), nullable=False)
    ngay_tao      = db.Column(db.DateTime, default=datetime.utcnow)

    quyen = db.relationship("QuyenHan")
    du_doans = db.relationship("DuDoan", backref="tai_khoan", lazy=True)

    # Nếu sau này bạn tạo user mới bằng Python, có thể dùng set_password()
    def set_password(self, raw: str):
        self.mat_khau = bcrypt.hash(raw)

    def check_password(self, raw: str) -> bool:
        try:
            return bcrypt.verify(raw, self.mat_khau)
        except Exception:
            return False

    @property
    def role(self):
        return "admin" if self.ma_quyen_han == "001" else "user"

class LichSuDangNhap(db.Model):
    __tablename__ = "lich_su_dang_nhap"
    ma_lich_su   = db.Column(db.BigInteger, primary_key=True)
    ma_tai_khoan = db.Column(db.BigInteger, db.ForeignKey("tai_khoan.ma_tai_khoan"), nullable=False)
    thoi_gian_dn = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    ten_dang_nhap_tai_khoan = db.Column(db.String(50), nullable=False)

class DuDoan(db.Model):
    __tablename__ = "du_doan"
    ma_du_doan        = db.Column(db.BigInteger, primary_key=True)
    ma_tai_khoan      = db.Column(db.BigInteger, db.ForeignKey("tai_khoan.ma_tai_khoan"), nullable=False)
    do_chinh_xac      = db.Column(db.Float, nullable=False)
    thoi_gian_nhan_kq = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    nhan_dan_benh     = db.Column(db.String(100), nullable=False)  # 0/1/2 hoặc text
