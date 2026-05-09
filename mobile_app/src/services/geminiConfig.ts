export const GEMINI_API_KEY = "AIzaSyCfF20t-Jqfrsye6TilHriC1Huc8ce5tYY";
export const GEMINI_MODEL = "gemini-2.5-flash";

// สร้าง URL สำหรับใช้งานกับ API อัตโนมัติ
export const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
