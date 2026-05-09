import React, { useState, useEffect } from 'react';
import {
    View, TouchableOpacity, Alert, Image, ActivityIndicator,
    ScrollView, StatusBar, StyleSheet
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Text from '../../components/CustomText';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from '../../styles/cameraAnalyzeStyles';
import { saveAnalysisToHistory } from '../HistoryScreen';
import { GEMINI_API_URL } from '../../services/geminiConfig';
import { apiSyncAnalysis } from '../../services/api';
import * as ImagePicker from 'expo-image-picker';
import { scale, verticalScale } from '../../utils/responsive';
import { theme } from '../../styles/theme';

const HEALTH: Record<string, { label: string; color: string; bg: string; icon: any }> = {
    Healthy:   { label: 'สุขภาพดี',   color: '#2E7D32', bg: '#E8F5E9', icon: 'checkmark-circle' },
    Warning:   { label: 'ต้องระวัง',  color: '#ED6C02', bg: '#FFF3E0', icon: 'warning'          },
    Danger:    { label: 'อันตราย',    color: '#D32F2F', bg: '#FDEDED', icon: 'alert-circle'     },
    Unhealthy: { label: 'ไม่แข็งแรง', color: '#ED6C02', bg: '#FFF3E0', icon: 'warning'          },
};

// ==============================
const CameraAnalyze: React.FC = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const initialImage  = route?.params?.initialImage  || null;
    const initialImages = route?.params?.initialImages || null;

    const [images, setImages] = useState<any[]>(
        initialImages ? initialImages : (initialImage ? [initialImage] : [])
    );
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [hasStarted,  setHasStarted]  = useState(false);
    const [stats,       setStats]       = useState<any>(null);

    useEffect(() => {
        if (images.length === 0) {
            Alert.alert('ผิดพลาด', 'ไม่พบรูปภาพ', [{ text: 'ตกลง', onPress: () => navigation.goBack() }]);
        }
    }, []);

    const addPhoto = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') return;
            const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.8, base64: true });
            if (!result.canceled && result.assets[0].base64) {
                setImages(prev => [...prev, { uri: result.assets[0].uri, base64: result.assets[0].base64 }]);
            }
        } catch (e) { console.error(e); }
    };

    const removeImage = (index: number) => {
        const next = images.filter((_, i) => i !== index);
        setImages(next);
        if (next.length === 0) navigation.goBack();
    };

    const analyzeImage = async () => {
        if (images.length === 0) return;
        setHasStarted(true);
        setIsAnalyzing(true);
        setStats(null);

        const isMulti = images.length > 1;
        const prompt = `${isMulti ? 'ภาพพืชหลายมุม' : 'ภาพพืช'} — ตอบกลับด้วย JSON เท่านั้น ไม่มีข้อความอื่น:
{
  "plant_name": "ชื่อพืชภาษาไทย",
  "plant_height": 0,
  "canopy_width": 0,
  "leaf_size": 0,
  "leaf_count": 0,
  "fresh_weight": 0,
  "health_status": "Healthy",
  "confidence": 85,
  "problem": "ชื่อโรค/ปัญหาหลัก (กระชับ 1 บรรทัด หรือ Normal ถ้าปกติ)",
  "symptoms": ["อาการที่พบ 1", "อาการที่พบ 2", "อาการที่พบ 3"],
  "treatments": ["วิธีแก้ 1", "วิธีแก้ 2", "วิธีแก้ 3"]
}
health_status ใช้ได้แค่: Healthy / Warning / Danger
confidence = 0-100, plant_height/canopy_width/leaf_size หน่วยซม., fresh_weight หน่วยกรัม`;

        try {
            const response = await fetch(GEMINI_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }, ...images.map(img => ({ inlineData: { mimeType: 'image/jpeg', data: img.base64 } }))] }]
                })
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error.message);

            const raw: string = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            // หา JSON block ที่ใหญ่ที่สุด (รองรับ multi-line)
            const jsonMatch = raw.match(/\{[\s\S]*\}/);
            let parsed: any = {};
            if (jsonMatch) {
                try { parsed = JSON.parse(jsonMatch[0]); } catch (_) {
                    // fallback: clean แล้วลองอีกรอบ
                    try {
                        const cleaned = jsonMatch[0].replace(/[\x00-\x08\x0E-\x1F\x7F]/g, '').replace(/\\[0-9]/g, '');
                        parsed = JSON.parse(cleaned);
                    } catch (_) {}
                }
            }
            if (parsed.confidence !== undefined && parsed.confidence <= 1) {
                parsed.confidence = Math.round(parsed.confidence * 100);
            }
            // ปรับ health_status ให้ตรงกับ HEALTH map
            const healthRaw: string = (parsed.health_status || 'Healthy');
            const healthNorm: Record<string, string> = {
                'healthy': 'Healthy', 'warning': 'Warning', 'danger': 'Danger',
                'unhealthy': 'Unhealthy', 'mildly unhealthy': 'Warning',
            };
            parsed.health_status = healthNorm[healthRaw.toLowerCase()] ?? 'Warning';

            setStats(parsed);

            // บันทึก server + local history
            if (images[0]?.base64) {
                const summary = [parsed.problem, ...(parsed.symptoms || [])].filter(Boolean).join(' | ');
                const details = `${parsed.problem || ''}\nอาการ: ${(parsed.symptoms || []).join(', ')}\nแก้ไข: ${(parsed.treatments || []).join(', ')}`.replace(/[\x00-\x08\x0E-\x1F\x7F]/g, '');
                let serverId = null;
                try {
                    const res = await apiSyncAnalysis({
                        plant_name: parsed.plant_name || 'ผักสลัดไฮโดรโปนิกส์',
                        health_status: parsed.health_status,
                        plant_height: parsed.plant_height,
                        canopy_width: parsed.canopy_width,
                        leaf_width: parsed.leaf_size,
                        leaf_count: parsed.leaf_count,
                        fresh_weight_with_root: parsed.fresh_weight,
                        diagnosis_summary: summary.substring(0, 500),
                        diagnosis_details: details,
                        confidence: parsed.confidence || 80,
                        severity: parsed.health_status === 'Healthy' ? 'Normal' : 'Warning',
                        source: 'Mobile App',
                        image_base64: images[0].base64,
                    });
                    if (res?.data?.id) serverId = res.data.id;
                } catch (_) {}

                // เตรียมข้อมูลการวัดเพื่อบันทึกลงประวัติ
                const measurements = {
                    ph: parsed.ph_value, // ถ้ามีจาก AI หรือเซนเซอร์
                    ec: parsed.ec_value,
                    height: parsed.plant_height,
                    canopy: parsed.canopy_width,
                    leaf_width: parsed.leaf_size,
                    leaf_count: parsed.leaf_count,
                    weight: parsed.fresh_weight,
                };

                saveAnalysisToHistory(images[0].base64, details, serverId, measurements);
            }
        } catch (err: any) {
            setHasStarted(false);
            Alert.alert('วิเคราะห์ผิดพลาด', err.message || 'ลองใหม่อีกครั้ง');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const healthKey  = stats?.health_status || 'Healthy';
    const healthInfo = HEALTH[healthKey] || HEALTH['Warning'];
    const confidence = stats?.confidence ?? 85;
    const sv         = (v: any) => (v && Number(v) !== 0) ? String(v) : '-';

    const STAT_ITEMS = [
        { label: 'สูง',     value: sv(stats?.plant_height), unit: 'ซม.' },
        { label: 'พุ่ม',    value: sv(stats?.canopy_width),  unit: 'ซม.' },
        { label: 'ใบ',      value: sv(stats?.leaf_size),     unit: 'ซม.' },
        { label: 'นับใบ',   value: sv(stats?.leaf_count),    unit: 'ใบ'  },
        { label: 'น้ำหนัก', value: sv(stats?.fresh_weight),  unit: 'ก.'  },
    ];

    const symptoms   = stats?.symptoms   || [];
    const treatments = stats?.treatments || [];

    return (
        <View style={[styles.screen, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerBack} onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={scale(26)} color="#333" />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>AI Scanner</Text>
                    {isAnalyzing && <Text style={styles.headerSub}>กำลังวิเคราะห์...</Text>}
                    {stats && <Text style={styles.headerSub}>วิเคราะห์สำเร็จ</Text>}
                </View>
                <View style={{ width: scale(44) }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + verticalScale(24) }]}
            >
                {/* รูปภาพ */}
                <View style={styles.imageCard}>
                    {images.length > 0 && (
                        <Image source={{ uri: images[images.length - 1].uri }} style={styles.imageCardImg} resizeMode="cover" />
                    )}
                    <LinearGradient
                        colors={['rgba(0,0,0,0.0)', 'rgba(0,0,0,0.35)']}
                        style={StyleSheet.absoluteFillObject}
                    />
                    {isAnalyzing && (
                        <View style={styles.imageAnalyzingOverlay}>
                            <View style={styles.scanPulse} />
                            <Ionicons name="scan-outline" size={scale(48)} color="rgba(255,255,255,0.9)" />
                            <Text style={styles.scanText}>กำลังสแกน...</Text>
                        </View>
                    )}
                    {!hasStarted && (
                        <View style={styles.imageBadge}>
                            <Ionicons name="images-outline" size={13} color="#fff" />
                            <Text style={styles.imageBadgeText}>{images.length} รูป</Text>
                        </View>
                    )}
                    {stats && (
                        <View style={[styles.imageBadge, { backgroundColor: healthInfo.bg }]}>
                            <Ionicons name={healthInfo.icon} size={12} color={healthInfo.color} />
                            <Text style={[styles.imageBadgeText, { color: healthInfo.color }]}>{healthInfo.label}</Text>
                        </View>
                    )}
                </View>

                {/* ก่อนวิเคราะห์ */}
                {!hasStarted && (
                    <View style={styles.prePanel}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbRow}>
                            {images.map((img, i) => (
                                <View key={i} style={styles.thumb}>
                                    <Image source={{ uri: img.uri }} style={styles.thumbImg} />
                                    <TouchableOpacity style={styles.thumbRemove} onPress={() => removeImage(i)}>
                                        <Ionicons name="close" size={11} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                            <TouchableOpacity style={styles.thumbAdd} onPress={addPhoto}>
                                <Ionicons name="add" size={24} color={theme.colors.primary} />
                                <Text style={styles.thumbAddText}>เพิ่ม</Text>
                            </TouchableOpacity>
                        </ScrollView>
                        <TouchableOpacity style={styles.analyzeBtn} onPress={analyzeImage}>
                            <LinearGradient
                                colors={[theme.colors.primary, theme.colors.primaryDark]}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                style={styles.analyzeBtnGradient}
                            >
                                <Ionicons name="sparkles" size={scale(20)} color="#fff" />
                                <Text style={styles.analyzeBtnText}>
                                    {images.length > 1 ? `วิเคราะห์ ${images.length} รูป` : 'เริ่มวิเคราะห์'}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Loading */}
                {isAnalyzing && (
                    <View style={styles.loadingBox}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                        <Text style={styles.loadingTitle}>AI กำลังประมวลผล</Text>
                        <Text style={styles.loadingSub}>วิเคราะห์สุขภาพ โรค และการเจริญเติบโต</Text>
                    </View>
                )}

                {/* ผลลัพธ์ */}
                {stats && (
                    <View style={styles.resultBox}>

                        {/* Summary row: plant name + health */}
                        <View style={styles.summaryCard}>
                            <View style={styles.summaryIconBox}>
                                <Ionicons name="leaf" size={scale(20)} color="#fff" />
                            </View>
                            <View style={styles.summaryInfo}>
                                <Text style={styles.plantName} numberOfLines={1}>
                                    {stats.plant_name || 'วิเคราะห์สำเร็จ'}
                                </Text>
                                <Text style={styles.confidenceText}>ความแม่นยำ {confidence}%</Text>
                            </View>
                            <View style={[styles.healthBadge, { backgroundColor: healthInfo.bg }]}>
                                <Ionicons name={healthInfo.icon} size={12} color={healthInfo.color} />
                                <Text style={[styles.healthBadgeText, { color: healthInfo.color }]}>
                                    {healthInfo.label}
                                </Text>
                            </View>
                        </View>

                        {/* Stats 5 ช่อง */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsScroll}>
                            {STAT_ITEMS.map((item, i) => (
                                <View key={i} style={styles.statCard}>
                                    <Text style={styles.statValue}>{item.value}</Text>
                                    <Text style={styles.statUnit}>{item.unit}</Text>
                                    <Text style={styles.statLabel}>{item.label}</Text>
                                </View>
                            ))}
                        </ScrollView>

                        {/* Info cards: ปัญหา + วิธีแก้ */}
                        <View style={styles.infoRow}>
                            {/* ปัญหาที่พบ */}
                            <View style={[styles.infoCard, styles.infoCardWarn]}>
                                <View style={styles.infoCardHeader}>
                                    <Ionicons name="warning-outline" size={scale(14)} color="#92400e" />
                                    <Text style={[styles.infoCardTitle, { color: '#92400e' }]}>ปัญหาที่พบ</Text>
                                </View>
                                {stats.problem && stats.problem !== 'Normal' ? (
                                    <Text style={styles.infoProblemText} numberOfLines={2}>{stats.problem}</Text>
                                ) : (
                                    <Text style={styles.infoProblemText}>ไม่พบปัญหา</Text>
                                )}
                                {symptoms.slice(0, 3).map((s: string, i: number) => (
                                    <View key={i} style={styles.infoBulletRow}>
                                        <View style={[styles.infoDot, { backgroundColor: '#f97316' }]} />
                                        <Text style={styles.infoBulletText} numberOfLines={2}>{s}</Text>
                                    </View>
                                ))}
                            </View>

                            {/* วิธีแก้ไข */}
                            <View style={[styles.infoCard, styles.infoCardGreen]}>
                                <View style={styles.infoCardHeader}>
                                    <Ionicons name="medkit-outline" size={scale(14)} color={theme.colors.primaryDark} />
                                    <Text style={[styles.infoCardTitle, { color: theme.colors.primaryDark }]}>วิธีแก้ไข</Text>
                                </View>
                                {treatments.length === 0 && (
                                    <Text style={styles.infoBulletText}>ดูแลตามปกติ</Text>
                                )}
                                {treatments.slice(0, 3).map((t: string, i: number) => (
                                    <View key={i} style={styles.infoBulletRow}>
                                        <View style={[styles.infoDot, { backgroundColor: theme.colors.primary }]} />
                                        <Text style={styles.infoBulletText} numberOfLines={2}>{t}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* ปุ่ม */}
                        <TouchableOpacity
                            style={styles.chatBtn}
                            onPress={() => navigation.navigate('Chat', {
                                analysisContext: `${stats.problem || ''} อาการ: ${symptoms.join(', ')} แก้ไข: ${treatments.join(', ')}`,
                                imageUri: initialImage?.uri,
                                imageBase64: initialImage?.base64,
                            })}
                        >
                            <Ionicons name="chatbubble-outline" size={scale(18)} color="#fff" />
                            <Text style={styles.chatBtnText}>ถามต่อใน AI</Text>
                        </TouchableOpacity>

awd                        <View style={styles.bottomActions}>
                            <TouchableOpacity style={styles.resetBtn} onPress={() => navigation.goBack()}>
                                <Ionicons name="camera-outline" size={scale(17)} color="#555" />
                                <Text style={styles.resetBtnText}>ถ่ายใหม่</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.homeBtn} onPress={() => navigation.navigate('Main')}>
                                <Ionicons name="home-outline" size={scale(16)} color="#555" />
                                <Text style={styles.homeBtnText}>หน้าหลัก</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

export default CameraAnalyze;
