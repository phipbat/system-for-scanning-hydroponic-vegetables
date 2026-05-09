// ไฟล์สำหรับหน้า NotificationsSettingsScreen (หน้าจอกำหนดค่าการแจ้งเตือนของระบบ)
import React, { useState, useEffect } from 'react';
import {
    View, StyleSheet, ScrollView, TouchableOpacity,
    ActivityIndicator, FlatList, RefreshControl, StatusBar,
} from 'react-native';
import Text from '../../components/CustomText';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../styles/theme';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';
import { getUser, fetchNotifications, markNotificationRead, AuthUser, NotificationRecord } from '../../services/api';
import ActionBar from '../../components/ActionBar';

const NotificationsSettingsScreen: React.FC = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const [user, setUser] = useState<AuthUser | null>(null);
    const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [u, notifs] = await Promise.all([
                getUser(),
                fetchNotifications()
            ]);
            if (u) setUser(u);
            setNotifications(notifs);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleMarkAsRead = async (id: number) => {
        try {
            await markNotificationRead(id);
            setNotifications(prev => 
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            );
        } catch (e) {
            console.error(e);
        }
    };

    const renderItem = ({ item }: { item: NotificationRecord }) => (
        <TouchableOpacity
            style={[styles.notifCard, !item.is_read && styles.unreadCard]}
            onPress={() => handleMarkAsRead(item.id)}
            activeOpacity={0.7}
        >
            <View style={[styles.notifIconBox, { backgroundColor: item.is_read ? '#F5F7FA' : '#E8F5E9' }]}>
                <Ionicons 
                    name={item.type === 'alert' ? 'alert-circle' : 'notifications'} 
                    size={24} 
                    color={item.is_read ? '#B0B8C1' : theme.colors.primary} 
                />
            </View>
            <View style={styles.notifContent}>
                <View style={styles.notifHeader}>
                    <Text style={[styles.notifTitle, !item.is_read && styles.unreadText]}>{item.title}</Text>
                    {!item.is_read && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.notifMessage} numberOfLines={2}>{item.message}</Text>
                <Text style={styles.notifTime}>{new Date(item.created_at).toLocaleString('th-TH')}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <ActionBar
                title="การแจ้งเตือน"
                subtitle="ข่าวสารและแจ้งเตือนพืช"
                showBack={true}
                user={user}
            />

            <FlatList
                data={notifications}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 20 }]}
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="bell-off-outline" size={60} color="#B0B8C1" />
                            <Text style={styles.emptyTitle}>ไม่มีการแจ้งเตือน</Text>
                            <Text style={styles.emptySub}>คุณจะได้รับการแจ้งเตือนเมื่อระบบตรวจพบสิ่งผิดปกติ</Text>
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
    listContent: {
        padding: scale(16),
    },
    notifCard: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        borderRadius: scale(20),
        padding: scale(16),
        marginBottom: verticalScale(12),
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.03)',
        alignItems: 'center',
    },
    unreadCard: {
        backgroundColor: '#FCFFFC',
        borderColor: '#E8F5E9',
        elevation: 2,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    notifIconBox: {
        width: scale(50),
        height: scale(50),
        borderRadius: scale(15),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scale(15),
    },
    notifContent: {
        flex: 1,
    },
    notifHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    notifTitle: {
        fontSize: moderateScale(15),
        fontWeight: 'bold',
        color: '#1a1a2e',
        flex: 1,
    },
    unreadText: {
        color: '#000',
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: theme.colors.primary,
        marginLeft: 8,
    },
    notifMessage: {
        fontSize: moderateScale(13),
        color: '#6c757d',
        marginBottom: 6,
    },
    notifTime: {
        fontSize: moderateScale(11),
        color: '#B0B8C1',
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

export default NotificationsSettingsScreen;
