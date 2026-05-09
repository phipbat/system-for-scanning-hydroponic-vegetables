import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ค่าอ้างอิงจาก iPhone 14 Pro (393 x 852 logical points)
const BASE_WIDTH  = 393;
const BASE_HEIGHT = 852;

/**
 * ปรับขนาดตามความกว้างของหน้าจอ (แนวนอน)
 * ใช้กับ: padding, margin, width, ขนาดฟอนต์ที่คำนวณจากความกว้าง
 */
export const scale = (size: number): number => {
    return Math.round(PixelRatio.roundToNearestPixel(size * (SCREEN_WIDTH / BASE_WIDTH)));
};

/**
 * ปรับขนาดตามความสูงของหน้าจอ (แนวตั้ง)
 * ใช้กับ: ความสูง, margin/padding แนวตั้ง
 */
export const verticalScale = (size: number): number => {
    return Math.round(PixelRatio.roundToNearestPixel(size * (SCREEN_HEIGHT / BASE_HEIGHT)));
};

/**
 * ปรับขนาดแบบผสม — ใช้ค่า scale แนวนอนร่วมกับตัวหน่วงความเปลี่ยนแปลง
 * ใช้กับ: ขนาดฟอนต์, ขนาดไอคอน (ป้องกันขยายใหญ่เกินบน tablet)
 * factor: 0 = ไม่ scale เลย, 1 = scale เต็มที่ (ค่าเริ่มต้น 0.5)
 */
export const moderateScale = (size: number, factor = 0.5): number => {
    return Math.round(PixelRatio.roundToNearestPixel(size + (scale(size) - size) * factor));
};

// ขนาดหน้าจอสำหรับใช้งานทั่วไป
export const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// ตรวจสอบระบบปฏิบัติการ
export const isAndroid = Platform.OS === 'android';
export const isIOS = Platform.OS === 'ios';

// ตรวจสอบว่าเป็น tablet หรือไม่ (ความกว้าง >= 768px)
export const isTablet = SCREEN_WIDTH >= 768;
