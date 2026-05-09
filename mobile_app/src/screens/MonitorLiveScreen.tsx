import React, { useState, useCallback } from 'react';
import {
    View, Image, TouchableOpacity, StatusBar, ActivityIndicator,
    Modal, Alert, RefreshControl, FlatList, StyleSheet
} from 'react-native';
import TextInput from '../components/CustomTextInput';
import Text from '../components/CustomText';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cacheDirectory, downloadAsync, readAsStringAsync } from 'expo-file-system/legacy';
import ActionBar from '../components/ActionBar';
import { scale, verticalScale, moderateScale } from '../utils/responsive';
import { GEMINI_API_URL } from '../services/geminiConfig';
import { theme } from '../styles/theme';
import {
    API_BASE_URL, fetchCameras, addCamera, deleteCamera,
    fetchCameraHistory, apiSyncAnalysis, apiDeleteAnalysis,
    CameraRecord, CameraAnalysisRecord
} from '../services/api';

const MonitorLiveScreen: React.FC = ({ navigation: _navigation }: any) => {
    const insets = useSafeAreaInsets();

    const [cameras, setCameras] = useState<CameraRecord[]>([]);
    const [selectedCamera, setSelectedCamera] = useState<CameraRecord | null>(null);
    const [history, setHistory] = useState<CameraAnalysisRecord[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [newCameraName, setNewCameraName] = useState('');
    const [newCameraUrl, setNewCameraUrl] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [webViewKey, setWebViewKey] = useState(Date.now());

    useFocusEffect(
        useCallback(() => {
            loadCameras();
        }, [])
    );

    const loadCameras = async () => {
        try {
            setIsRefreshing(true);
            const data = await fetchCameras(6);
            setCameras(data);
        } catch (e) {
            console.error('loadCameras:', e);
        } finally {
            setIsRefreshing(false);
        }
    };

    const loadHistory = async (id: number) => {
        try {
            setIsLoadingHistory(true);
            const data = await fetchCameraHistory(id);
            setHistory(data);
        } catch (e) {
            console.error('loadHistory:', e);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const handleSelectCamera = (cam: CameraRecord) => {
        setSelectedCamera(cam);
        setHistory([]);
        setWebViewKey(Date.now());
        loadHistory(cam.id);
    };

    const handleBack = () => {
        setSelectedCamera(null);
        setHistory([]);
    };

    const handleRefreshLive = () => {
        setWebViewKey(Date.now());
    };

    const getLiveViewerUrl = () => {
        const id = selectedCamera?.id;
        return `${API_BASE_URL}/api/camera/live-viewer${id ? `/${id}` : ''}?_t=${webViewKey}`;
    };

    const getSnapshotUrl = (id: number) =>
        `${API_BASE_URL}/api/camera/snapshot/${id}?t=${Date.now()}`;

    const analyzeWithAi = async () => {
        if (isAnalyzing || !selectedCamera) return;
        try {
            setIsAnalyzing(true);
            const fileUri = cacheDirectory + `snap_${Date.now()}.jpg`;
            const dl = await downloadAsync(
                `${API_BASE_URL}/api/camera/snapshot/${selectedCamera.id}?t=${Date.now()}`,
                fileUri
            );
            if (dl.status !== 200) throw new Error('ดึงภาพไม่สำเร็จ');
            const base64 = await readAsStringAsync(dl.uri, { encoding: 'base64' });

            const res = await fetch(GEMINI_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: 'วิเคราะห์ภาพผักจากกล้องวงจรปิด เช็คโรค สุขภาพ และให้คำแนะนำภาษาไทย' },
                            { inlineData: { mimeType: 'image/jpeg', data: base64 } }
                        ]
                    }]
                })
            });
            const json = await res.json();
            const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) throw new Error('AI ไม่ตอบกลับ');

            await apiSyncAnalysis({
                camera_id: selectedCamera.id,
                plant_name: 'จากกล้อง ' + selectedCamera.name,
                image_base64: base64,
                diagnosis_summary: text,
                source: 'Camera Analysis',
            });
            Alert.alert('ผลวิเคราะห์ AI', text.slice(0, 300) + (text.length > 300 ? '...' : ''));
            loadHistory(selectedCamera.id);
        } catch (e: any) {
            Alert.alert('ผิดพลาด', e.message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleAddCamera = async () => {
        if (!newCameraName || !newCameraUrl) {
            Alert.alert('กรุณากรอกข้อมูล', 'โปรดระบุชื่อกล้องและลิงก์สตรีม');
            return;
        }
        try {
            setIsAdding(true);
            await addCamera({ name: newCameraName, stream_url: newCameraUrl });
            setNewCameraName('');
            setNewCameraUrl('');
            setIsAddModalVisible(false);
            loadCameras();
        } catch (e: any) {
            Alert.alert('ผิดพลาด', e.message);
        } finally {
            setIsAdding(false);
        }
    };

    const handleDeleteCamera = (id: number) => {
        Alert.alert('ลบกล้อง', 'ยืนยันการลบกล้องนี้?', [
            { text: 'ยกเลิก', style: 'cancel' },
            {
                text: 'ลบ', style: 'destructive',
                onPress: async () => {
                    try {
                        await deleteCamera(id);
                        if (selectedCamera?.id === id) setSelectedCamera(null);
                        loadCameras();
                    } catch (e: any) {
                        Alert.alert('ผิดพลาด', e.message);
                    }
                }
            }
        ]);
    };

    const handleDeleteHistory = (id: number) => {
        Alert.alert('ลบประวัติ', 'ยืนยันการลบรายการนี้?', [
            { text: 'ยกเลิก', style: 'cancel' },
            {
                text: 'ลบ', style: 'destructive',
                onPress: async () => {
                    try {
                        await apiDeleteAnalysis(id);
                        if (selectedCamera) loadHistory(selectedCamera.id);
                    } catch (e: any) {
                        Alert.alert('ผิดพลาด', e.message);
                    }
                }
            }
        ]);
    };

    const formatDate = (ts?: string) => {
        if (!ts) return '-';
        const d = new Date(ts.replace(' ', 'T'));
        return isNaN(d.getTime()) ? '-' : d.toLocaleString('th-TH');
    };

    // ─── VIEW 1: รายการกล้อง ───────────────────────────────────
    if (!selectedCamera) {
        return (
            <View style={[s.container, { paddingTop: insets.top }]}>
                <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
                <ActionBar
                    title="กล้องสด"
                    subtitle="ภาพรวมกล้องของคุณ"
                    showBack={true}
                    rightAction={
                        <TouchableOpacity
                            style={s.addBtn}
                            onPress={() => setIsAddModalVisible(true)}
                        >
                            <Ionicons name="add" size={24} color={theme.colors.primary} />
                        </TouchableOpacity>
                    }
                />

                {cameras.length === 0 ? (
                    <View style={s.emptyBox}>
                        <MaterialCommunityIcons name="camera-off" size={60} color="#ccc" />
                        <Text style={s.emptyTitle}>ยังไม่มีรายการกล้อง</Text>
                        <Text style={s.emptySubtitle}>กดปุ่ม + เพื่อเพิ่มกล้องใหม่</Text>
                    </View>
                ) : (
                    <FlatList
                        data={cameras}
                        keyExtractor={item => item.id.toString()}
                        contentContainerStyle={{ padding: scale(16), paddingBottom: insets.bottom + scale(80) }}
                        refreshControl={
                            <RefreshControl refreshing={isRefreshing} onRefresh={loadCameras} tintColor={theme.colors.primary} />
                        }
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={s.cameraCard}
                                onPress={() => handleSelectCamera(item)}
                                activeOpacity={0.8}
                            >
                                <View style={s.thumbBox}>
                                    <Image
                                        source={{ uri: getSnapshotUrl(item.id) }}
                                        style={s.thumb}
                                        resizeMode="cover"
                                    />
                                    <View style={[s.statusDot, { backgroundColor: item.status === 'active' ? '#4CAF50' : '#bbb' }]} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={s.cardName}>{item.name}</Text>
                                    <Text style={[s.cardStatus, { color: item.status === 'active' ? '#4CAF50' : '#bbb' }]}>
                                        {item.status === 'active' ? 'Online' : 'Offline'}
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={() => handleDeleteCamera(item.id)} style={s.trashBtn}>
                                    <Ionicons name="trash-outline" size={18} color="#E53935" />
                                </TouchableOpacity>
                                <Ionicons name="chevron-forward" size={20} color="#ddd" />
                            </TouchableOpacity>
                        )}
                    />
                )}

                {/* Modal เพิ่มกล้อง */}
                <Modal visible={isAddModalVisible} animationType="slide" transparent>
                    <View style={s.modalOverlay}>
                        <View style={s.modalBox}>
                            <View style={s.modalHeader}>
                                <Text style={s.modalTitle}>เพิ่มกล้องใหม่</Text>
                                <TouchableOpacity onPress={() => setIsAddModalVisible(false)}>
                                    <Ionicons name="close" size={24} color="#666" />
                                </TouchableOpacity>
                            </View>
                            <TextInput
                                style={s.input}
                                placeholder="ชื่อกล้อง (เช่น สวนผัก A)"
                                value={newCameraName}
                                onChangeText={setNewCameraName}
                            />
                            <TextInput
                                style={s.input}
                                placeholder="Stream URL (http://...)"
                                value={newCameraUrl}
                                onChangeText={setNewCameraUrl}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            <View style={s.modalBtns}>
                                <TouchableOpacity
                                    style={s.cancelBtn}
                                    onPress={() => setIsAddModalVisible(false)}
                                >
                                    <Text style={{ color: '#666', fontWeight: 'bold' }}>ยกเลิก</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={s.saveBtn}
                                    onPress={handleAddCamera}
                                    disabled={isAdding}
                                >
                                    {isAdding
                                        ? <ActivityIndicator size="small" color="#fff" />
                                        : <Text style={{ color: '#fff', fontWeight: 'bold' }}>บันทึก</Text>
                                    }
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        );
    }

    // ─── VIEW 2: ดูกล้องสด + ประวัติ ─────────────────────────
    return (
        <View style={[s.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
            <ActionBar
                title={selectedCamera.name}
                subtitle="Live Monitoring"
                showBack={true}
                onBack={handleBack}
                rightAction={
                    <View style={{ flexDirection: 'row', gap: scale(8) }}>
                        <TouchableOpacity style={s.iconBtn} onPress={handleRefreshLive}>
                            <Ionicons name="refresh" size={20} color={theme.colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[s.iconBtn, isAnalyzing && { opacity: 0.6 }]}
                            onPress={analyzeWithAi}
                            disabled={isAnalyzing}
                        >
                            {isAnalyzing
                                ? <ActivityIndicator size="small" color={theme.colors.primary} />
                                : <MaterialCommunityIcons name="robot-outline" size={20} color={theme.colors.primary} />
                            }
                        </TouchableOpacity>
                    </View>
                }
            />

            <FlatList
                contentContainerStyle={{ paddingBottom: insets.bottom + scale(80) }}
                ListHeaderComponent={
                    <View>
                        {/* Video Player */}
                        <View style={s.videoBox}>
                            <WebView
                                key={webViewKey}
                                style={{ flex: 1 }}
                                source={{ uri: getLiveViewerUrl() }}
                                originWhitelist={['*']}
                                mixedContentMode="always"
                                javaScriptEnabled={true}
                                cacheEnabled={false}
                                domStorageEnabled={true}
                                startInLoadingState={true}
                                renderLoading={() => (
                                    <View style={s.videoLoading}>
                                        <ActivityIndicator size="large" color={theme.colors.primary} />
                                        <Text style={s.loadingText}>กำลังเชื่อมต่อกล้อง...</Text>
                                    </View>
                                )}
                            />
                        </View>

                        {/* Status Bar */}
                        <View style={s.statusBar}>
                            <View style={s.liveIndicator}>
                                <View style={s.liveDot} />
                                <Text style={s.liveText}>LIVE</Text>
                            </View>
                            <Text style={s.cameraNameText}>{selectedCamera.name}</Text>
                        </View>

                        {/* History Header */}
                        <View style={s.historyHeader}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: scale(6) }}>
                                <Ionicons name="time-outline" size={18} color="#1a1a2e" />
                                <Text style={s.historyTitle}>ประวัติย้อนหลัง</Text>
                            </View>
                            {isLoadingHistory && <ActivityIndicator size="small" color={theme.colors.primary} />}
                        </View>
                    </View>
                }
                data={history}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={s.historyCard}>
                        <View style={s.historyRow}>
                            <Text style={s.historyDate}>{formatDate(item.timestamp)}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: scale(8) }}>
                                <View style={[s.statusBadge, { backgroundColor: item.health_status === 'Danger' ? '#FEE2E2' : '#DCFCE7' }]}>
                                    <Text style={{ fontSize: moderateScale(11), fontWeight: 'bold', color: item.health_status === 'Danger' ? '#EF4444' : '#16A34A' }}>
                                        {item.health_status === 'Danger' ? 'พบโรค' : 'ปกติ'}
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={() => handleDeleteHistory(item.id)}>
                                    <Ionicons name="trash-outline" size={14} color="#E53935" />
                                </TouchableOpacity>
                            </View>
                        </View>
                        {item.image_path && (
                            <Image
                                source={{ uri: `${API_BASE_URL}/storage/${item.image_path}` }}
                                style={s.historyImg}
                                resizeMode="cover"
                            />
                        )}
                        {!!item.diagnosis_summary && (
                            <Text style={s.historyDesc} numberOfLines={2}>
                                {item.diagnosis_summary}
                            </Text>
                        )}
                    </View>
                )}
                ListEmptyComponent={
                    !isLoadingHistory ? (
                        <View style={s.emptyHistory}>
                            <MaterialCommunityIcons name="clipboard-text-off-outline" size={40} color="#ddd" />
                            <Text style={{ color: '#ccc', marginTop: 8 }}>ยังไม่มีประวัติการวิเคราะห์</Text>
                        </View>
                    ) : null
                }
            />
        </View>
    );
};

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },

    // Camera List
    addBtn: { width: scale(38), height: scale(38), borderRadius: scale(19), backgroundColor: '#F0FDF4', justifyContent: 'center', alignItems: 'center', elevation: 2, borderWidth: 1, borderColor: '#DCFCE7' },
    emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: scale(10) },
    emptyTitle: { fontSize: moderateScale(18), color: '#999', fontWeight: 'bold' },
    emptySubtitle: { fontSize: moderateScale(14), color: '#bbb' },
    cameraCard: { backgroundColor: '#fff', borderRadius: scale(14), padding: scale(14), flexDirection: 'row', alignItems: 'center', marginBottom: scale(12), elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4 },
    thumbBox: { width: scale(60), height: scale(60), borderRadius: scale(12), backgroundColor: '#f0f0f0', marginRight: scale(14), overflow: 'hidden', position: 'relative' },
    thumb: { width: '100%', height: '100%' },
    statusDot: { position: 'absolute', bottom: scale(4), right: scale(4), width: scale(10), height: scale(10), borderRadius: scale(5), borderWidth: 2, borderColor: '#fff' },
    cardName: { fontSize: moderateScale(16), fontWeight: 'bold', color: '#1a1a2e', marginBottom: scale(3) },
    cardStatus: { fontSize: moderateScale(12), fontWeight: '600' },
    trashBtn: { padding: scale(8) },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    modalBox: { backgroundColor: '#fff', borderTopLeftRadius: scale(24), borderTopRightRadius: scale(24), padding: scale(24), paddingBottom: scale(40) },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: scale(20) },
    modalTitle: { fontSize: moderateScale(18), fontWeight: 'bold', color: '#1a1a2e' },
    input: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: scale(12), padding: scale(13), fontSize: moderateScale(14), marginBottom: scale(14), backgroundColor: '#F8FAFC' },
    modalBtns: { flexDirection: 'row', gap: scale(10), marginTop: scale(4) },
    cancelBtn: { flex: 1, padding: scale(13), borderRadius: scale(12), borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
    saveBtn: { flex: 1, padding: scale(13), borderRadius: scale(12), backgroundColor: theme.colors.primary, alignItems: 'center' },

    // Live View
    iconBtn: { width: scale(36), height: scale(36), borderRadius: scale(18), backgroundColor: '#F0FDF4', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#DCFCE7' },
    videoBox: { width: '100%', aspectRatio: 16 / 9, backgroundColor: '#000', overflow: 'hidden' },
    videoLoading: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
    loadingText: { color: '#fff', marginTop: scale(10), fontSize: moderateScale(13), opacity: 0.7 },
    statusBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: scale(16), paddingVertical: scale(10), backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    liveIndicator: { flexDirection: 'row', alignItems: 'center', gap: scale(6), backgroundColor: '#FEE2E2', paddingHorizontal: scale(10), paddingVertical: scale(4), borderRadius: scale(20) },
    liveDot: { width: scale(7), height: scale(7), borderRadius: scale(4), backgroundColor: '#EF4444' },
    liveText: { fontSize: moderateScale(11), fontWeight: 'bold', color: '#EF4444' },
    cameraNameText: { fontSize: moderateScale(13), fontWeight: 'bold', color: '#64748B' },

    // History
    historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: scale(16), paddingVertical: scale(14) },
    historyTitle: { fontSize: moderateScale(16), fontWeight: 'bold', color: '#1a1a2e' },
    historyCard: { marginHorizontal: scale(16), backgroundColor: '#fff', borderRadius: scale(14), padding: scale(13), marginBottom: scale(10), elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
    historyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: scale(8) },
    historyDate: { fontSize: moderateScale(11), color: '#94A3B8' },
    statusBadge: { paddingHorizontal: scale(8), paddingVertical: scale(3), borderRadius: scale(20) },
    historyImg: { width: '100%', height: verticalScale(110), borderRadius: scale(10), marginBottom: scale(8) },
    historyDesc: { fontSize: moderateScale(12), color: '#475569', lineHeight: 18 },
    emptyHistory: { alignItems: 'center', paddingVertical: scale(30) },
});

export default MonitorLiveScreen;
