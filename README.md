# Hướng Dẫn Deploy Lên Cloud Chạy Tự Động 24/7

Dự án này đã được cấu hình trọn gói: **Frontend + Backend + Auto-Setup Admin** sẵn sàng để chạy trên các nền tảng Cloud hoàn toàn tự động.

---

## BƯỚC 1: Chuẩn Bị MongoDB Online (MongoDB Atlas Miễn Phí)
1. Truy cập [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) và đăng ký/đăng nhập.
2. Tạo một **Cluster M0 Free (Miễn phí vĩnh viễn)**.
3. Vào mục **Security -> Network Access**: Bấm **Add IP Address** -> Chọn **Allow Access from Anywhere (0.0.0.0/0)**.
4. Vào mục **Security -> Database Access**: Tạo 1 User & Password (ví dụ: `admin` / `matkhau123`).
5. Quay lại **Database -> Cluster0 -> Connect** -> Chọn **Drivers (Node.js)**:
   - Bạn sẽ nhận được đường dẫn dạng:
     ```
     mongodb+srv://admin:admin123@cluster0.zacqhwb.mongodb.net/?appName=Cluster0
     ```
   *(Lưu lại đường dẫn này để dùng ở Bước 3)*

---

## BƯỚC 2: Đẩy Code Lên GitHub
1. Mở terminal tại thư mục `d:\VSCode\LMS\lms-web-app`:
   ```bash
   git init
   git add .
   git commit -m "Init LMS Fullstack Cloud Project"
   ```
2. Tạo 1 repository mới trên [github.com](https://github.com) (chế độ Public hoặc Private đều được).
3. Push mã nguồn lên GitHub theo lệnh của GitHub cung cấp:
   ```bash
   git remote add origin https://github.com/<tai-khoan-cua-ban>/<ten-repo>.git
   git branch -M main
   git push -u origin main
   ```

---

## BƯỚC 3: Deploy Lên Render.com (Miễn phí, Tự động chạy)
1. Đăng ký tài khoản tại [render.com](https://render.com) (Đăng nhập bằng GitHub).
2. Bấm **New +** -> Chọn **Web Service**.
3. Chọn Repository vừa tạo ở Bước 2 -> Bấm **Connect**.
4. Điền các thông tin:
   - **Name**: `lms-quiz-app` (hoặc tên tuỳ thích).
   - **Runtime**: `Node`.
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
5. Kéo xuống phần **Environment Variables** (Biến môi trường) -> Bấm **Add Environment Variable**:
   - `MONGO_URI`: `(Dán đường dẫn MongoDB Atlas lấy ở Bước 1 vào đây)`
   - `JWT_SECRET`: `khoabimat_lms_2026`
6. Bấm **Create Web Service**.

> ⚡ **Kết quả:** Sau khoảng 1-2 phút, Render sẽ tự động cài đặt, build giao diện và cấp cho bạn một đường link dạng `https://lms-quiz-app.onrender.com`. Link này mở được trên điện thoại, máy tính từ bất cứ đâu.

---

## BƯỚC 4: Sử Dụng Website Đã Deploy
1. Truy cập link trang web được cấp từ Cloud.
2. Đăng nhập ngay với tài khoản Quản trị mặc định (Hệ thống tự tạo khi khởi động):
   - **Username**: `admin`
   - **Password**: `admin123`
3. Trong giao diện Admin:
   - Upload file câu hỏi Excel `Ngan_Hang_Cau_Hoi_KĐTTM_Sales.xlsx`.
   - Tạo danh sách tài khoản học viên (Client) và bấm "Giao test".
   - Gửi link và tài khoản cho học viên làm bài trực tiếp trên mạng.
