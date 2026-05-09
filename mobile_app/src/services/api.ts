import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ตั้งค่า API - ค้นหา Backend อัตโนมัติ (อ้างอิงจาก CameraScreen)
const getApiBaseUrl = () => {
    const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
    if (envUrl) return envUrl;

    const extraUrl: any = (Constants.expoConfig as any)?.extra?.apiBaseUrl;
    if (extraUrl) return extraUrl as string;

    // กรณีใช้งานนอกเครือข่ายแลน (ให้ระบุ URL ของ Ngrok ที่นี่)
    // return 'https://your-ngrok-url.app';

    // กรณีใช้งานภายในเครือข่ายเดียวกับเครื่องเซิร์ฟเวอร์ หรือรันผ่าน Expo Go
    const hostUri = Constants.expoConfig?.hostUri || (Constants as any).expoGoConfig?.debuggerHost;
    if (hostUri) {
        const ip = hostUri.split(':')[0];
        return `http://${ip}:8000`;
    }

    // กรณีรันบน Android Emulator พื้นฐาน
    return 'http://10.0.2.2:8000';
};

export const API_BASE_URL = getApiBaseUrl();

const TOKEN_KEY = '@auth_token';
const USER_KEY = '@auth_user';

// การจัดการ Token
export const saveToken = async (token: string) => {
    await AsyncStorage.setItem(TOKEN_KEY, token);
};

export const getToken = async (): Promise<string | null> => {
    return AsyncStorage.getItem(TOKEN_KEY);
};

export const removeToken = async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
};

export type AuthUser = {
    id: number;
    name: string;
    display_name?: string | null;
    email: string;
    role?: string | null;
    profile_image?: string | null;
    profile_image_url?: string | null;
};

export const saveUser = async (user: AuthUser) => {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getUser = async (): Promise<AuthUser | null> => {
    const raw = await AsyncStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
};

// Helper สำหรับการเรียก API พร้อมจัดการ Token
const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const token = await getToken();
    const url = `${API_BASE_URL}/api${endpoint}`;
    
    const headers: any = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(options.headers || {}),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const res = await fetch(url, {
            ...options,
            headers,
        });

        const text = await res.text();
        let data: any;
        try {
            data = JSON.parse(text);
        } catch {
            // ข้อมูลเก่าในฐานข้อมูลอาจมี \0 หรือ control chars → clean แล้ว parse ใหม่
            const cleaned = text
                .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // actual control chars
                .replace(/\\[0-9]/g, '');                            // \0-\9 ไม่ valid ใน JSON
            try {
                data = JSON.parse(cleaned);
            } catch {
                data = {};
            }
        }

        if (!res.ok) {
            if (res.status === 401) {
                await removeToken(); // Token หมดอายุ หรือไม่ถูกต้อง
            }
            throw new Error(data.message || `API Error (${res.status})`);
        }
        return data;
    } catch (error: any) {
        if (error.message.includes('Network request failed')) {
            console.error(`Network Error calling: ${url}`);
            throw new Error(`ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ที่:\n${API_BASE_URL}\n\nกรุณาตรวจสอบว่า:\n1. เซิร์ฟเวอร์รันอยู่ (0.0.0.0)\n2. มือถือและคอมฯ อยู่ WiFi วงเดียวกัน\n3. ปิด Firewall ที่คอมพิวเตอร์พอร์ท 8000`);
        }
        throw error;
    }
};

// ระบบพิสูจน์ตัวตน (Auth API)
export const apiLogin = async (email: string, password: string) => {
    const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
    await saveToken(data.token);
    if (data.user) {
        await saveUser(data.user);
    }
    return data;
};

export const apiChangePassword = async (passwordData: any) => {
    return apiFetch('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify(passwordData),
    });
};

export const apiRegister = async (name: string, email: string, password: string) => {
    const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, password_confirmation: password }),
    });
    await saveToken(data.token);
    if (data.user) {
        await saveUser(data.user);
    }
    return data;
};

export const apiForgotPassword = async (email: string) => {
    return apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
    });
};

export const apiMe = async (): Promise<AuthUser> => {
    const user = await apiFetch('/user', { method: 'GET' });
    await saveUser(user);
    return user;
};

export const apiUpdateUser = async (userData: Partial<AuthUser>): Promise<AuthUser> => {
    const user = await apiFetch('/user', {
        method: 'PUT',
        body: JSON.stringify(userData),
    });
    await saveUser(user);
    return user;
};

// ระบบจัดการพืช (Plants API)
export interface PlantRecord {
    id: number;
    name: string;
    species?: string;
    variety?: string;
    location?: string;
    system_type: string;
    ph_target?: number;
    ec_target?: number;
    planted_at?: string;
    status: 'growing' | 'harvested' | 'dead';
    analyses_count?: number;
    analyses?: CameraAnalysisRecord[];
    latestAnalysis?: CameraAnalysisRecord;
    latest_analysis?: CameraAnalysisRecord;
}

export const fetchPlants = async (): Promise<PlantRecord[]> => {
    const res = await apiFetch('/plants');
    return res.data || [];
};

export const fetchPlantDetail = async (id: number): Promise<PlantRecord> => {
    const res = await apiFetch(`/plants/${id}`);
    return res.data;
};

export const createPlant = async (plantData: Partial<PlantRecord>) => {
    return apiFetch('/plants', {
        method: 'POST',
        body: JSON.stringify(plantData),
    });
};

export const deletePlant = async (id: number) => {
    return apiFetch(`/plants/${id}`, {
        method: 'DELETE',
    });
};

export interface CameraAnalysisRecord {
    id: number;
    camera_id?: number;
    plant_id?: number;
    plant_name: string;
    identified_species?: string;
    health_status: string;
    plant_height?: number;
    canopy_width?: number;
    leaf_width?: number;
    leaf_count?: number;
    fresh_weight_with_root?: number;
    diagnosis_summary?: string;
    diagnosis_details?: string;
    recommendation?: string;
    confidence: number;
    severity: string;
    image_path?: string;
    image_base64?: string;
    ph_value?: number;
    ec_value?: number;
    source?: string;
    timestamp: string;
    camera?: { name: string };
    plant?: { name: string };
}

export const fetchCameraAlerts = async (): Promise<CameraAnalysisRecord[]> => {
    const res = await apiFetch('/camera-alerts');
    return res.data || [];
};

export const fetchCameraHistory = async (cameraId: number): Promise<CameraAnalysisRecord[]> => {
    const res = await apiFetch(`/camera-alerts?camera_id=${cameraId}`);
    return res.data || [];
};

export const apiSyncAnalysis = async (analysisData: Partial<CameraAnalysisRecord>) => {
    return apiFetch('/camera/sync-analysis', {
        method: 'POST',
        body: JSON.stringify(analysisData),
    });
};

export const apiDeleteAnalysis = async (id: number) => {
    return apiFetch(`/camera/sync-analysis/${id}`, {
        method: 'DELETE',
    });
};

export const apiCheckDeletedRecords = async (ids: number[]): Promise<number[]> => {
    if (ids.length === 0) return [];
    try {
        const res = await apiFetch('/camera/check-deleted-analysis', {
            method: 'POST',
            body: JSON.stringify({ ids }),
        });
        return res.data || [];
    } catch (e) {
        console.error("Failed to check deleted records:", e);
        return [];
    }
};

// ระบบแจ้งเตือนผู้ใช้ (Notifications API)
export interface NotificationRecord {
    id: number;
    title: string;
    message: string;
    is_read: boolean;
    type: string;
    created_at: string;
    analysis?: CameraAnalysisRecord;
}

export const fetchNotifications = async (): Promise<NotificationRecord[]> => {
    const res = await apiFetch('/notifications');
    return res.data || [];
};

export const markNotificationRead = async (id: number) => {
    return apiFetch(`/notifications/${id}/read`, { method: 'POST' });
};

// ระบบจัดการกล้อง (Camera Management API)
export interface CameraRecord {
    id: number;
    user_id?: number;
    name: string;
    location?: string;
    stream_url: string;
    connection_type: string;
    status: string;
    last_heartbeat?: string;
    created_at?: string;
}

export const fetchCameras = async (farmId?: number): Promise<CameraRecord[]> => {
    const endpoint = farmId ? `/cameras?farm_id=${farmId}` : '/cameras';
    const res = await apiFetch(endpoint);
    return res.data || [];
};

export const addCamera = async (cameraData: { name: string; stream_url: string }) => {
    return apiFetch('/cameras', {
        method: 'POST',
        body: JSON.stringify(cameraData),
    });
};

export const deleteCamera = async (id: number) => {
    return apiFetch(`/cameras/${id}`, {
        method: 'DELETE',
    });
};

// --- ระบบ AI Chat Sync ---
export interface ChatMessage {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    imageUri?: string;
    imageBase64?: string; // added to push to server
    timestamp?: number;
}

export interface ChatSession {
    id: string;
    title: string;
    lastMessage: string;
    timestamp: number;
    messages: ChatMessage[];
}

export const fetchRemoteChatSessions = async () => {
    try {
        const res = await apiFetch('/chats');
        return res.sessions || [];
    } catch (e) {
        console.warn('Failed to fetch remote chat sessions', e);
        return [];
    }
};

export const syncRemoteChatSession = async (session: ChatSession) => {
    try {
        return await apiFetch('/chats/sync', {
            method: 'POST',
            body: JSON.stringify({
                id: session.id,
                title: session.title,
                lastMessage: session.lastMessage,
                timestamp: session.timestamp,
                messages: session.messages
            }),
        });
    } catch (e) {
        console.warn(`Failed to sync chat session ${session.id}`, e);
        throw e;
    }
};

export const deleteRemoteChatSession = async (id: string) => {
    try {
        return await apiFetch(`/chats/${id}`, {
            method: 'DELETE',
        });
    } catch (e) {
        console.warn(`Failed to delete remote chat session ${id}`, e);
        throw e;
    }
};
