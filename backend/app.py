# backend/app.py
from flask import jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from database import create_app, init_extensions
from auth import bp_auth
from predict import bp_predict, get_model  # <- lấy get_model để warm-up
from stats import bp_stats
from os import getenv
import numpy as np  # <- warm-up input giả

app = create_app()
init_extensions(app)

# Cho phép /api/x và /api/x/ đều hợp lệ
app.url_map.strict_slashes = False

# CORS: cho phép FE Vite (5173) gọi API
origins = getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
CORS(
    app,
    resources={r"/api/*": {"origins": origins}},
    supports_credentials=False,
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
)

# JWT chỉ nhận token từ header, không dùng cookie CSRF
app.config["JWT_TOKEN_LOCATION"] = ["headers"]
app.config["JWT_COOKIE_CSRF_PROTECT"] = False

# (tuỳ chọn) giới hạn kích thước file upload, ví dụ 20MB
app.config["MAX_CONTENT_LENGTH"] = int(getenv("MAX_CONTENT_MB", "20")) * 1024 * 1024

jwt = JWTManager(app)

# Blueprints
app.register_blueprint(bp_auth)
app.register_blueprint(bp_predict)
app.register_blueprint(bp_stats)

# Warm-up model để lần predict đầu không bị trễ (hạn chế timeout FE)
with app.app_context():
    try:
        m = get_model()
        dummy = np.zeros((1, 224, 224, 3), dtype=np.float32)
        m.predict(dummy, verbose=0)
        print("[WARMUP] model ready")
    except Exception as e:
        print("[WARMUP] failed:", e)

@app.get("/api/health")
def health():
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    # chạy dev server
    app.run(host="0.0.0.0", port=5000, debug=True)
