# System for Scanning Hydroponic Vegetables

ระบบตรวจสอบและวิเคราะห์ผักไฮโดรโปนิกส์ผ่านมือถือ พร้อมระบบหลังบ้านสำหรับจัดการข้อมูลและ API

## 📂 โครงสร้างโปรเจกต์
- `camera_backend`: ระบบหลังบ้านพัฒนาด้วย **Laravel 8** (PHP)
- `mobile_app`: แอปพลิเคชันมือถือพัฒนาด้วย **React Native / Expo** (TypeScript)

---

## 🛠 การติดตั้งและใช้งานระบบหลังบ้าน (Backend API)

### ความต้องการขั้นต้น
- PHP >= 7.3 หรือ 8.0
- Composer
- MySQL หรือฐานข้อมูลอื่นๆ

### ขั้นตอนการติดตั้ง
1. เข้าไปยังโฟลเดอร์ backend:
   ```bash
   cd camera_backend
   ```
2. ติดตั้ง Dependencies:
   ```bash
   composer install
   npm install && npm run dev
   ```
3. คัดลอกไฟล์ตั้งค่า Environment:
   ```bash
   cp .env.example .env
   ```
4. สร้าง Key สำหรับ Laravel:
   ```bash
   php artisan key:generate
   ```
5. ตั้งค่าฐานข้อมูลในไฟล์ `.env` (DB_DATABASE, DB_USERNAME, DB_PASSWORD)
6. รันการ Migration ฐานข้อมูล:
   ```bash
   php artisan migrate
   ```
7. เริ่มทำงาน Server:
   ```bash
   php artisan serve
   ```
   *Server จะรันอยู่ที่ http://127.0.0.1:8000*

---

## 📱 การติดตั้งและใช้งานแอปพลิเคชันมือถือ (Mobile App)

### ความต้องการขั้นต้น
- Node.js (แนะนำเวอร์ชัน LTS)
- Expo Go บนมือถือ (สำหรับทดสอบ)

### ขั้นตอนการติดตั้ง
1. เข้าไปยังโฟลเดอร์ mobile app:
   ```bash
   cd mobile_app
   ```
2. ติดตั้ง Dependencies:
   ```bash
   npm install
   ```
3. ตั้งค่า API URL ในไฟล์ `.env` (ถ้ามี) ให้ตรงกับ IP ของเครื่อง Server
4. เริ่มทำงานแอปพลิเคชัน:
   ```bash
   npx expo start
   ```

### การรันบนอุปกรณ์
- **Android/iOS (Real Device)**: สแกน QR Code ผ่านแอป Expo Go
- **Android Emulator**: กด `a` ใน Terminal
- **iOS Simulator**: กด `i` ใน Terminal

---

## 🚀 คำสั่งที่สำคัญ (Cheat Sheet)

### Backend (Laravel)
- `php artisan serve` - รัน API Server
- `php artisan migrate:fresh --seed` - ล้างฐานข้อมูลและลงข้อมูลตัวอย่างใหม่
- `php artisan route:list` - ดูรายการ API Endpoints ทั้งหมด
- `php artisan make:controller NameController` - สร้าง Controller ใหม่

### Mobile (Expo)
- `npx expo start` - รันโปรเจกต์
- `npx expo start -c` - รันโปรเจกต์แบบ Clear Cache
- `npx expo run:android` - บิลด์และรันบน Android (Development Build)
- `npx expo run:ios` - บิลด์และรันบน iOS (Development Build)

---

## ✨ ฟีเจอร์เด่น
- 📷 สแกนผักผ่านกล้องมือถือ
- 📊 วิเคราะห์การเจริญเติบโต
- 💬 ระบบแชทและแจ้งเตือน
- 📂 ประวัติการสแกนและการจัดการฟาร์ม
- 🔐 ระบบสมาชิกและความปลอดภัยแบบ Sanctum
