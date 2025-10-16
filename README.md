# 🌿 CK_PPPTPMHDT – Dự án Huấn luyện Mô hình & Website

## 📂 Cấu trúc thư mục
```
CK_PPPTPMHDT/
├── backend/          # Code backend (Flask/FastAPI)
├── env/              # Môi trường ảo Python (virtual environment)
├── frontend/         # Giao diện người dùng (React)
├── working/          # Lưu dữ liệu huấn luyện, hình ảnh, mô hình
│   ├── dataset/
│   ├── figures/
│   ├── model/
│   │   └── vgg/
├── .gitignore        # Danh sách file/thư mục bị bỏ qua khi push
├── archive.zip       # File nén dữ liệu gốc
├── huanluyenmohinh.py # Script huấn luyện mô hình
├── requirements.txt  # Danh sách thư viện Python cần cài đặt
```

---

## 📦 1. Chuẩn bị dữ liệu
Tải và giải nén file dữ liệu tại liên kết sau:

🔗 [Tải dataset tại đây](https://drive.google.com/file/d/1B_83Lsqv8ekEZ-nGIK2fcFkx4qFI7bnF/view?usp=drive_link)

Giải nén file **archive.zip** và đặt dữ liệu vào thư mục:
```
working/dataset/
```

---

## 🧱 2. Tạo môi trường ảo và cài đặt thư viện

Mở Terminal tại thư mục gốc của dự án, sau đó chạy:

```bash
python -m venv env
.\env\Scripts\activate
pip install -r requirements.txt
```

---

## 🧠 3. Huấn luyện mô hình

Trước khi huấn luyện, hãy đảm bảo tạo sẵn các thư mục sau:

```bash
mkdir working
mkdir working/dataset
mkdir working/figures
mkdir working/model
mkdir working/model/vgg
```

Sau đó chạy lệnh huấn luyện:

```bash
python huanluyenmohinh.py
```

Kết quả huấn luyện (mô hình, biểu đồ accuracy/loss, v.v.) sẽ được lưu trong thư mục `working/`.

---

## ⚙️ 4. Khởi chạy Backend

Đi tới thư mục `backend` và chạy server backend:

```bash
cd backend
python app.py
```

Backend sẽ chạy mặc định tại:
```
http://localhost:5000/
```

---

## 💻 5. Khởi chạy Frontend

Mở **terminal mới**, đi tới thư mục `frontend` và cài đặt thư viện:

```bash
cd ../frontend
npm install
npm run dev
```

---

## 🌐 6. Truy cập Website

Sau khi backend và frontend đều đang chạy, mở trình duyệt và truy cập địa chỉ:

👉 [http://localhost:5173/](http://127.0.0.1:5173)

---



✳️ **Tác giả:** _Tran Nguyen Minh Khoi, Tran Minh Nhat_  
📘 **Dự án môn học:** Phát triển phần mềm hướng đối tượng  
📅 **Năm học:** 2025
