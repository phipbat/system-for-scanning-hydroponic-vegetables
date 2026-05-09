// ไฟล์สำหรับหน้า ManageFarmScreen (หน้าจอจัดการแปลงผักและข้อมูลพืชในระบบ)
import React, { useState, useEffect } from 'react';
import {
    View, StyleSheet, FlatList, TouchableOpacity,
    ActivityIndicator, Alert, RefreshControl, StatusBar,
} from 'react-native';
import Text from '../../components/CustomText';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../styles/theme';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';
import { getUser, fetchPlants, deletePlant, AuthUser, PlantRecord } from '../../services/api';
import ActionBar from '../../components/ActionBar';

const ManageFarmScreen: React.FC = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const [user, setUser] = useState<AuthUser | null>(null);
    const [plants, setPlants] = useState<PlantRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [u, pData] = await Promise.all([
                getUser(),
                fetchPlants()
            ]);
            if (u) setUser(u);
            setPlants(pData);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleDelete = (id: number, name: string) => {
        Alert.alert(
            'ยืนยันการลบ',
            `คุณต้องการลบข้อมูลพืช "${name}" ใช่หรือไม่? ประวัติทั้งหมดจะหายไป`,
            [
                { text: 'ยกเลิก', style: 'cancel' },
                {
                    text: 'ลบข้อมูล',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deletePlant(id);
                            setPlants(prev => prev.filter(p => p.id !== id));
                        } catch (e: any) {
                            Alert.alert('ผิดพลาด', e.message || 'ไม่สามารถลบข้อมูลได้');
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: PlantRecord }) => (
        <View style={styles.plantCard}>
            <View style={styles.plantIconBox}>
                <MaterialCommunityIcons name="leaf" size={28} color={theme.colors.primary} />
            </View>
            <View style={styles.plantInfo}>
                <Text style={styles.plantName}>{item.name}</Text>
                <Text style={styles.plantDetails}>{item.species || 'ไม่ระบุสายพันธุ์'} • {item.system_type}</Text>
                <View style={[
                    styles.statusBadge,
                    { backgroundColor: item.status === 'growing' ? '#E8F5E9' : '#F5F5F5' }
                ]}>
                    <Text style={[
                        styles.statusText,
                        { color: item.status === 'growing' ? theme.colors.primary : '#888' }
                    ]}>
                        {item.status === 'growing' ? 'กำลังเติบโต' : 'บรรลุนิติภาวะ'}
                    </Text>
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
                title="จัดการแปลงผัก"
                subtitle="ข้อมูลพืชทึ่ปลูกในระบบ"
                showBack={true}
                user={user}
            />

            <View style={styles.headerRow}>
                <Text style={styles.countText}>รายการทั้งหมด ({plants.length})</Text>
                <TouchableOpacity 
                    style={styles.addBtn}
                    onPress={() => Alert.alert('Coming Soon', 'ฟีเจอร์การเพิ่มพืชกำลังอยู่ระหว่างการพัฒนา')}
                >
                    <Ionicons name="add" size={20} color="#2E7D32" />
                    <Text style={styles.addBtnText}>เพิ่มพืชใหม่</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={plants}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 20 }]}
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="sprout-outline" size={60} color="#B0B8C1" />
                            <Text style={styles.emptyTitle}>ไม่มีข้อมูลต้นพืช</Text>
                            <Text style={styles.emptySub}>เริ่มบันทึกข้อมูลพืชของคุณเพื่อติดตามการเติบโต</Text>
                        </View>
                    ) : null
                }
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />
                }
            />
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
    plantCard: {
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
    plantIconBox: {
        width: scale(54),
        height: scale(54),
        backgroundColor: '#E8F5E9',
        borderRadius: scale(18),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scale(15),
    },
    plantInfo: {
        flex: 1,
    },
    plantName: {
        fontSize: moderateScale(16),
        fontWeight: 'bold',
        color: '#1a1a2e',
        marginBottom: 2,
    },
    plantDetails: {
        fontSize: moderateScale(12),
        color: '#6c757d',
        marginBottom: 6,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    statusText: {
        fontSize: moderateScale(10),
        fontWeight: 'bold',
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
});

export default ManageFarmScreen;
