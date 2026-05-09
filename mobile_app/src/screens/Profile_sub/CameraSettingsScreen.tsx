// ไฟล์สำหรับหน้า CameraSettingsScreen (หน้าจอตั้งค่ากล้องวงจรปิด จัดการรายการกล้อง)
import React, { useState, useEffect } from 'react';
import {
    View, StyleSheet, FlatList, TouchableOpacity,
    ActivityIndicator, Alert, RefreshControl, Modal, StatusBar,
} from 'react-native';
import TextInput from '../../components/CustomTextInput';
import Text from '../../components/CustomText';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../styles/theme';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';
import { getUser, fetchCameras, addCamera, deleteCamera, AuthUser, CameraRecord } from '../../services/api';
import ActionBar from '../../components/ActionBar';

const CameraSettingsScreen: React.FC = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const [user, setUser] = useState<AuthUser | null>(null);
    const [cameras, setCameras] = useState<CameraRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    // สถานะของ Modal (Modal state)
    const [modalVisible, setModalVisible] = useState(false);
    const [newName, setNewName] = useState('');
    const [newUrl, setNewUrl] = useState('');
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [u, cData] = await Promise.all([
                getUser(),
                fetchCameras()
            ]);
            if (u) setUser(u);
            setCameras(cData);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleAddCamera = async () => {
        if (!newName.trim() || !newUrl.trim()) {
            Alert.alert('แจ้งเตือน', 'กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        try {
            setAdding(true);
            await addCamera({ name: newName, stream_url: newUrl });
            setModalVisible(false);
            setNewName('');
            setNewUrl('');
            loadData();
            Alert.alert('สำเร็จ', 'เพิ่มกล้องเรียบร้อยแล้ว');
        } catch (e: any) {
            Alert.alert('ผิดพลาด', e.message || 'ไม่สามารถเพิ่มกล้องได้');
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = (id: number, name: string) => {
        Alert.alert(
            'ยืนยันการลบ',
            `คุณต้องการลบกล้อง "${name}" ใช่หรือไม่?`,
            [
                { text: 'ยกเลิก', style: 'cancel' },
                {
                    text: 'ลบกล้อง',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteCamera(id);
                            setCameras(prev => prev.filter(c => c.id !== id));
                        } catch (e: any) {
                            Alert.alert('ผิดพลาด', e.message || 'ไม่สามารถลบกล้องได้');
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: CameraRecord }) => (
        <View style={styles.cameraCard}>
            <View style={styles.cameraIconBox}>
                <Ionicons name="videocam" size={28} color={theme.colors.primary} />
            </View>
            <View style={styles.cameraInfo}>
                <Text style={styles.cameraName}>{item.name}</Text>
                <Text style={styles.cameraUrl} numberOfLines={1}>{item.stream_url}</Text>
                <View style={styles.statusRow}>
                    <View style={[
                        styles.statusDot, 
                        { backgroundColor: item.status === 'online' ? '#4CAF50' : '#F44336' }
                    ]} />
                    <Text style={styles.statusText}>{item.status === 'online' ? 'Online' : 'Offline'}</Text>
                </View>
            </View>
            <TouchableOpacity 
                style={styles.deleteBtn}
                onPress={() => handleDelete(item.id, item.name)}
            >
                <Ionicons name="trash-outline" size={22} color="#D32F2F" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <ActionBar
                title="ตั้งค่ากล้อง"
                subtitle="จัดการ IP Camera ของคุณ"
                showBack={true}
                user={user}
            />

            <View style={styles.headerRow}>
                <Text style={styles.countText}>กล้องที่เชื่อมต่อ ({cameras.length})</Text>
                <TouchableOpacity 
                    style={styles.addBtn}
                    onPress={() => setModalVisible(true)}
                >
                    <Ionicons name="add" size={20} color="#2E7D32" />
                    <Text style={styles.addBtnText}>เพิ่มกล้องใหม่</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={cameras}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 20 }]}
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="video-off-outline" size={60} color="#B0B8C1" />
                            <Text style={styles.emptyTitle}>ไม่มีกล้องที่เชื่อมต่อ</Text>
                            <Text style={styles.emptySub}>เพิ่ม IP Camera เพื่อเริ่มต้นการเฝ้าระวังพืชอัตโนมัติ</Text>
                        </View>
                    ) : null
                }
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />
                }
            />

            {/* Add Camera Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>เพิ่มกล้องใหม่</Text>
                        
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>ชื่อกล้อง</Text>
                            <TextInput
                                style={styles.input}
                                value={newName}
                                onChangeText={setNewName}
                                placeholder="เช่น กล้องโซน A"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Stream URL (RTSP/HTTP)</Text>
                            <TextInput
                                style={styles.input}
                                value={newUrl}
                                onChangeText={setNewUrl}
                                placeholder="http://192.168.1.x/stream"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity 
                                style={styles.cancelBtn} 
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.cancelBtnText}>ยกเลิก</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.confirmBtn} 
                                onPress={handleAddCamera}
                                disabled={adding}
                            >
                                {adding ? (
                                    <ActivityIndicator color={theme.colors.primary} />
                                ) : (
                                    <Text style={styles.confirmBtnText}>เพิ่มกล้อง</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {loading && <ActivityIndicator size="large" color={theme.colors.primary} style={styles.centeredLoading} />}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: scale(20),
        paddingVertical: verticalScale(15),
    },
    countText: {
        fontSize: moderateScale(14),
        fontWeight: '700',
        color: '#6c757d',
    },
    addBtn: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(8),
        borderRadius: scale(12),
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#2E7D32',
    },
    addBtnText: {
        color: '#2E7D32',
        fontWeight: 'bold',
        fontSize: moderateScale(12),
        marginLeft: 4,
    },
    listContent: {
        paddingHorizontal: scale(20),
    },
    cameraCard: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        borderRadius: scale(20),
        padding: scale(16),
        marginBottom: verticalScale(12),
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.03)',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    cameraIconBox: {
        width: scale(54),
        height: scale(54),
        backgroundColor: '#E8F5E9',
        borderRadius: scale(18),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scale(15),
    },
    cameraInfo: {
        flex: 1,
    },
    cameraName: {
        fontSize: moderateScale(16),
        fontWeight: 'bold',
        color: '#1a1a2e',
        marginBottom: 2,
    },
    cameraUrl: {
        fontSize: moderateScale(12),
        color: '#6c757d',
        marginBottom: 6,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        fontSize: moderateScale(12),
        color: '#6c757d',
    },
    deleteBtn: {
        padding: scale(8),
    },
    centeredLoading: {
        position: 'absolute',
        top: '50%',
        alignSelf: 'center',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: verticalScale(100),
        paddingHorizontal: scale(40),
    },
    emptyTitle: {
        fontSize: moderateScale(18),
        fontWeight: 'bold',
        color: '#1a1a2e',
        marginTop: verticalScale(20),
    },
    emptySub: {
        fontSize: moderateScale(14),
        color: '#6c757d',
        textAlign: 'center',
        marginTop: verticalScale(8),
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: scale(20),
    },
    modalContent: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: scale(24),
        padding: scale(24),
    },
    modalTitle: {
        fontSize: moderateScale(20),
        fontWeight: 'bold',
        color: '#1a1a2e',
        marginBottom: verticalScale(20),
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: verticalScale(15),
    },
    label: {
        fontSize: moderateScale(14),
        fontWeight: '700',
        color: '#1a1a2e',
        marginBottom: verticalScale(8),
    },
    input: {
        backgroundColor: '#F5F7FA',
        borderRadius: scale(12),
        padding: scale(15),
        fontSize: moderateScale(16),
        color: '#1a1a2e',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: verticalScale(10),
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: verticalScale(14),
        alignItems: 'center',
    },
    cancelBtnText: {
        fontSize: moderateScale(16),
        color: '#6c757d',
        fontWeight: 'bold',
    },
    confirmBtn: {
        flex: 1,
        backgroundColor: '#ffffff',
        paddingVertical: verticalScale(14),
        borderRadius: scale(12),
        alignItems: 'center',
        marginLeft: 10,
        borderWidth: 1.5,
        borderColor: '#2E7D32',
    },
    confirmBtnText: {
        fontSize: moderateScale(16),
        color: '#2E7D32',
        fontWeight: 'bold',
    },
});

export default CameraSettingsScreen;
