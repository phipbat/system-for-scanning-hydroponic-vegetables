# Mobile Application for Scanning Hydroponic Vegetables

แอปพลิเคชันมือถือสำหรับระบบตรวจสอบและวิเคราะห์ผักไฮโดรโปนิกส์ พัฒนาด้วย React Native และ Expo

## ความต้องการขั้นต้น
- Node.js (LTS)
- npm หรือ yarn
- แอปพลิเคชัน Expo Go บนมือถือ

## การติดตั้ง
1. เข้ามายังโฟลเดอร์โปรเจกต์:
   ```bash
   cd mobile_app
   ```
2. ติดตั้ง dependencies:
   ```bash
   npm install
   ```

## การใช้งาน
- เริ่มทำงาน Metro Bundler: `npx expo start`
- รันบน Android: `npx expo run:android`
- รันบน iOS: `npx expo run:ios`
- รันบน Web: `npx expo start --web`

## โครงสร้างโปรเจกต์
- `src/` - โค้ดหลักของแอปพลิเคชัน
- `src/components/` - ส่วนประกอบ UI ที่ใช้ซ้ำได้
- `src/screens/` - หน้าจอต่างๆ ของแอป
- `src/styles/` - การตั้งค่าสไตล์ สี และฟอนต์
- `src/services/` - ส่วนเชื่อมต่อ API และบริการภายนอก
- `assets/` - ไฟล์รูปภาพและฟอนต์

## ฟีเจอร์หลัก
- การเชื่อมต่อกับระบบหลังบ้านผ่าน API
- ระบบจัดการ Token และการพิสูจน์ตัวตน
- การวิเคราะห์ภาพถ่ายผักผ่านกล้อง
- ระบบแจ้งเตือนและประวัติการทำงาน
- รองรับการทำงานแบบ Real-time

## ใบอนุญาต
MIT
