# backend/predict.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from database import db
from models import DuDoan
from PIL import Image
import numpy as np
import os
import tensorflow as tf
from datetime import datetime

bp_predict = Blueprint("predict", __name__, url_prefix="/api/predict")

MODEL = None
CLASS_NAMES = {
    0: "Bacterial leaf blight (Bạc lá)",
    1: "Brown spot (Đốm nâu)",
    2: "Leaf smut (Lá than đen)"
}

def get_model():
    """Lazy-load model; cho phép override qua biến môi trường MODEL_PATH."""
    global MODEL
    if MODEL is None:
        model_path = os.getenv("MODEL_PATH") or os.path.join(
            os.path.dirname(__file__), "models", "vgg16_model.keras"
        )
        MODEL = tf.keras.models.load_model(model_path)
    return MODEL


@bp_predict.post("")
@jwt_required()
def predict_image():
    f = request.files.get("file") or request.files.get("image")
    if not f:
        return jsonify({"msg": "Thiếu file ảnh"}), 400

    try:
        # --- Lấy kích thước input của model ---
        model = get_model()
        _, H, W, _ = model.input_shape
        if H is None or W is None:
            H, W = 256, 256  # fallback nếu model để None

        # --- Đọc ảnh và resize đúng kích thước ---
        img = Image.open(f.stream).convert("RGB").resize((W, H))
        arr = (np.array(img, dtype=np.float32) / 255.0)[None, ...]  # (1,H,W,3)

        # --- Dự đoán ---
        probs = model.predict(arr, verbose=0)[0]
        label_idx = int(np.argmax(probs))
        acc = float(probs[label_idx])

    except Exception as e:
        return jsonify({"msg": f"Lỗi xử lý ảnh: {str(e)}"}), 400

    # --- Lưu DB ---
    try:
        db.session.add(DuDoan(
            ma_tai_khoan=int(get_jwt()["sub"]),
            nhan_dan_benh=str(label_idx),
            do_chinh_xac=acc,
            thoi_gian_nhan_kq=datetime.utcnow()
        ))
        db.session.commit()
    except Exception:
        db.session.rollback()

    return jsonify({
        "label": label_idx,
        "label_name": CLASS_NAMES.get(label_idx, "Không xác định"),
        "accuracy": round(acc, 4)
    }), 200
