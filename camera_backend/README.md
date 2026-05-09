# Backend API for Scanning Hydroponic Vegetables

ระบบหลังบ้านสำหรับจัดการข้อมูลและให้บริการ API แก่แอปพลิเคชันตรวจสอบผักไฮโดรโปนิกส์ พัฒนาด้วย Laravel Framework

## ความต้องการขั้นต้น
- PHP >= 7.3 หรือ 8.0
- Composer
- ฐานข้อมูล MySQL

## การติดตั้ง
1. เข้ามายังโฟลเดอร์โปรเจกต์:
   ```bash
   cd camera_backend
   ```
2. ติดตั้ง PHP dependencies:
   ```bash
   composer install
   ```
3. คัดลอกไฟล์ตั้งค่า Environment:
   ```bash
   cp .env.example .env
   ```
4. สร้าง Application Key:
   ```bash
   php artisan key:generate
   ```
5. ตั้งค่าฐานข้อมูลในไฟล์ `.env`
6. รันการ Migration ฐานข้อมูล:
   ```bash
   php artisan migrate
   ```

## การใช้งาน
- เริ่มทำงาน Server: `php artisan serve`
- เริ่มทำงาน Server สำหรับมือถือ: `php artisan serve --host=0.0.0.0 --port=8000`

## โครงสร้างโปรเจกต์
- `app/` - โค้ดหลักของระบบ (Models, Controllers, Providers)
- `routes/api.php` - กำหนดเส้นทาง API Endpoints
- `database/` - ไฟล์ Migration และ Seeder
- `config/` - ไฟล์ตั้งค่าระบบ

## ฟีเจอร์หลัก
- ระบบพิสูจน์ตัวตนด้วย Laravel Sanctum
- API สำหรับจัดการข้อมูลพืชและผลการวิเคราะห์
- ระบบจัดการกล้องและประวัติการแจ้งเตือน
- การจัดเก็บรูปภาพและข้อมูลการวิเคราะห์ AI

## ใบอนุญาต
MIT
