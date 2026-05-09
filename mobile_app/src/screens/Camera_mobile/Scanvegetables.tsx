import React, { useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Image, Modal, Pressable, RefreshControl, StyleSheet } from 'react-native';
import Text from '../../components/CustomText';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';
import ActionBar from '../../components/ActionBar';
import { theme } from '../../styles/theme';
import * as ImagePicker from 'expo-image-picker';
import { fetchCameraAlerts, CameraAnalysisRecord, AuthUser, getUser, apiDeleteAnalysis, API_BASE_URL } from '../../services/api';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Alert } from 'react-native';

const Scanvegetables: React.FC = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const [history, setHistory] = useState<CameraAnalysisRecord[]>([]);
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [pickerVisible, setPickerVisible] = useState(false);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async () => {
        try {
            setIsLoading(true);
            const [alerts, userData] = await Promise.all([
                fetchCameraAlerts(),
                getUser()
            ]);
            setHistory(alerts || []);
            setUser(userData);
        } catch (error) {
            console.error("Error load data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteHistory = (id: number) => {
        Alert.alert('ลบประวัติ', 'คุณต้องการลบข้อมูลการสแกนนี้ใช่หรือไม่?', [
            { text: 'ยกเลิก', style: 'cancel' },
            { 
                text: 'ลบข้อมูล', style: 'destructive',
                onPress: async () => {
                    try {
                        setIsLoading(true);
                        await apiDeleteAnalysis(id);
                        loadData();
                    } catch (error: any) {
                        Alert.alert('ผิดพลาด', error.message);
                        setIsLoading(false);
                    }
                }
            }
        ]);
    };

    const takePhoto = async () => {
        setPickerVisible(false);
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') return;

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.8,
            base64: true,
        });

        if (!result.canceled && result.assets[0]) {
            navigation.navigate('CameraAnalyze', { 
                initialImage: { uri: result.assets[0].uri, base64: result.assets[0].base64 } 
            });
        }
    };

    const pickImage = async () => {
        setPickerVisible(false);
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') return;

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.8,
            base64: true,
        });

        if (!result.canceled && result.assets[0]) {
            navigation.navigate('CameraAnalyze', { 
                initialImage: { uri: result.assets[0].uri, base64: result.assets[0].base64 } 
            });
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <ActionBar 
                title="วิเคราะห์โรค" 
                subtitle="วินิจฉัยพืชด้วย AI" 
                user={user}
                showBack={true}
                rightAction={
                    <TouchableOpacity style={styles.addBtnHeader} onPress={() => setPickerVisible(true)}>
                        <Ionicons name="add" size={moderateScale(24)} color={theme.colors.primary} />
                    </TouchableOpacity>
                }
            />

            <ScrollView 
                style={{ flex: 1 }} 
                contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadData} tintColor={theme.colors.primary} />}
            >
                {history.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconCircle}>
                            <MaterialCommunityIcons name="camera-plus-outline" size={moderateScale(70)} color={theme.colors.primary} />
                        </View>
                        <Text style={styles.emptyTitle}>ฟาร์มของคุณยังว่างอยู่</Text>
                        <Text style={styles.emptySubtitle}>เริ่มต้นวินิจฉัยสุขภาพพืชด้วย AI วันนี้{"\n"}เพื่อให้พืชของคุณเติบโตได้อย่างสมบูรณ์แบบ</Text>
                        
                        <TouchableOpacity 
                            style={styles.primaryActionBtn} 
                            onPress={() => setPickerVisible(true)}
                            activeOpacity={0.8}
                        >
                            <LinearGradient 
                                colors={[theme.colors.primary, '#1B5E20']} 
                                start={{ x: 0, y: 0 }} 
                                end={{ x: 1, y: 0 }}
                                style={styles.primaryBtnGradient}
                            >
                                <Ionicons name="scan-outline" size={24} color="#fff" />
                                <Text style={styles.primaryBtnText}>เริ่มสแกนตอนนี้</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={{ padding: scale(20) }}>
                        <View style={styles.historyHeader}>
                            <Text style={styles.historyTitle}>ประวัติสแกนล่าสุด</Text>
                            <View style={styles.countBadge}>
                                <Text style={styles.countText}>{history.length} รายการ</Text>
                            </View>
                        </View>
                        <View style={styles.gridContainer}>
                            {history.map((item) => (
                                <TouchableOpacity 
                                    key={item.id} 
                                    style={styles.gridCard}
                                    onPress={() => navigation.navigate('HistoryDetail', { analysisId: item.id })}
                                    onLongPress={() => handleDeleteHistory(item.id)}
                                >
                                    <View style={styles.imageBox}>
                                        <Image
                                            source={{ uri: item.image_path
                                                ? `${API_BASE_URL}/storage/${item.image_path}`
                                                : `data:image/jpeg;base64,${item.image_base64}`
                                            }}
                                            style={styles.img}
                                        />
                                        <View style={[styles.statusDot, { backgroundColor: item.health_status === 'Danger' ? '#EF4444' : '#22C55E' }]} />
                                    </View>
                                    <View style={styles.metaBox}>
                                        <Text style={styles.dateText}>{new Date(item.timestamp).toLocaleDateString('th-TH')}</Text>
                                        <Text style={[styles.statusText, { color: item.health_status === 'Danger' ? '#EF4444' : '#22C55E' }]}>
                                            {item.health_status === 'Danger' ? 'พบโรค' : 'ปกติ'}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Modal Picker for Header Button */}
            <Modal visible={pickerVisible} transparent animationType="fade" onRequestClose={() => setPickerVisible(false)}>
                <Pressable style={styles.modalOverlay} onPress={() => setPickerVisible(false)}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>เลือกวิธีแสกน</Text>
                        <View style={styles.modalGrid}>
                           <TouchableOpacity style={styles.modalItem} onPress={takePhoto}>
                               <Ionicons name="camera" size={32} color={theme.colors.primary} />
                               <Text style={styles.modalLabel}>กล้องถ่ายรูป</Text>
                           </TouchableOpacity>
                           <TouchableOpacity style={styles.modalItem} onPress={pickImage}>
                               <Ionicons name="images" size={32} color="#64748B" />
                               <Text style={styles.modalLabel}>อัลบั้มรูป</Text>
                           </TouchableOpacity>
                        </View>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    addBtnHeader: { 
        width: scale(38), 
        height: scale(38), 
        borderRadius: scale(19), 
        backgroundColor: '#F0FDF4', 
        justifyContent: 'center', 
        alignItems: 'center', 
        elevation: 4,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        borderWidth: 1,
        borderColor: '#DCFCE7'
    },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: verticalScale(100), paddingHorizontal: scale(40) },
    emptyIconCircle: { width: scale(140), height: scale(140), borderRadius: scale(70), backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center', marginBottom: verticalScale(30) },
    emptyTitle: { fontSize: moderateScale(22), fontWeight: 'bold', color: '#1E293B', marginBottom: verticalScale(12), textAlign: 'center' },
    emptySubtitle: { fontSize: moderateScale(14), color: '#64748B', textAlign: 'center', lineHeight: 22, marginBottom: verticalScale(40) },
    primaryActionBtn: { width: '100%', height: verticalScale(56), borderRadius: scale(28), overflow: 'hidden', elevation: 8, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
    primaryBtnGradient: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    primaryBtnText: { color: '#fff', fontSize: moderateScale(16), fontWeight: 'bold', marginLeft: scale(10) },
    historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: verticalScale(20) },
    historyTitle: { fontSize: moderateScale(18), fontWeight: 'bold', color: '#1E293B' },
    countBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: scale(10), paddingVertical: scale(4), borderRadius: scale(20) },
    countText: { fontSize: moderateScale(12), color: '#64748B', fontWeight: 'bold' },
    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    gridCard: { width: '23%', marginBottom: verticalScale(15), alignItems: 'center' },
    imageBox: { width: '100%', aspectRatio: 1, borderRadius: scale(12), overflow: 'hidden', backgroundColor: '#E2E8F0', position: 'relative' },
    img: { width: '100%', height: '100%' },
    statusDot: { position: 'absolute', top: scale(4), right: scale(4), width: scale(10), height: scale(10), borderRadius: scale(5), borderWidth: 2, borderColor: '#fff' },
    metaBox: { marginTop: verticalScale(6), alignItems: 'center' },
    dateText: { fontSize: moderateScale(9), color: '#94A3B8', fontWeight: 'bold' },
    statusText: { fontSize: moderateScale(10), fontWeight: 'bold' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: scale(32), borderTopRightRadius: scale(32), padding: scale(24), paddingBottom: verticalScale(40) },
    modalTitle: { fontSize: moderateScale(18), fontWeight: 'bold', color: '#1E293B', textAlign: 'center', marginBottom: verticalScale(24) },
    modalGrid: { flexDirection: 'row', justifyContent: 'space-around' },
    modalItem: { alignItems: 'center', padding: scale(15) },
    modalLabel: { marginTop: scale(10), fontSize: moderateScale(14), fontWeight: 'bold', color: '#475569' }
});

export default Scanvegetables;
