// ไฟล์สำหรับหน้า ProfileScreen (หน้าข้อมูลส่วนตัวและการตั้งค่า)
import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Image, Alert, StatusBar, ActivityIndicator } from 'react-native';
import Text from '../components/CustomText';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../styles/theme';
import { profileStyles as styles } from '../styles/profileStyles';
import { getUser, removeToken, AuthUser, fetchPlants, fetchCameraAlerts } from '../services/api';

const ProfileScreen: React.FC = ({ navigation }: any) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ plants: 0, analyses: 0 });
    const insets = useSafeAreaInsets();

    useEffect(() => {
        loadProfileData();
    }, []);

    const loadProfileData = async () => {
        try {
            setLoading(true);
            const userData = await getUser();
            setUser(userData);

            const [plants, analyses] = await Promise.all([
                fetchPlants(),
                fetchCameraAlerts()
            ]);

            setStats({
                plants: plants.length,
                analyses: analyses.length
            });
        } catch (error) {
            console.error("เกิดข้อผิดพลาดในการโหลดข้อมูลโปรไฟล์:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            "ออกจากระบบ",
            "คุณต้องการออกจากระบบใช่หรือไม่?",
            [
                { text: "ยกเลิก", style: "cancel" },
                {
                    text: "ยืนยัน",
                    style: "destructive",
                    onPress: async () => {
                        await removeToken();
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Login' }],
                        });
                    }
                }
            ]
        );
    };

    if (loading && !user) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={{ marginTop: 15, color: theme.colors.primary, fontWeight: 'bold' }}>กำลังเตรียมข้อมูล...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            <ScrollView showsVerticalScrollIndicator={false}>

                {/* ส่วนหัวแสดงโปรไฟล์ */}
                <View style={[styles.headerWrapper, { paddingTop: insets.top + 20 }]}>
                    <View style={styles.headerDecorativeCircle} />
                    <View style={styles.headerDecorativeCircleSmall} />

                    <TouchableOpacity
                        style={styles.profileAvatarWrapper}
                        activeOpacity={0.9}
                        onPress={() => navigation.navigate('AccountSettings')}
                    >
                        <Image
                            source={user?.profile_image_url ? { uri: user.profile_image_url } : require('../../assets/images/AppIcons/playstore.png')}
                            style={styles.avatarImage}
                        />
                        <View style={styles.editBadge}>
                            <Ionicons name="camera" size={18} color="#fff" />
                        </View>
                    </TouchableOpacity>

                    <View style={styles.userInfoSection}>
                        <Text style={styles.userName}>{user?.display_name || user?.name || 'Smart Farmer'}</Text>
                        <Text style={styles.userRole}>{user?.email || 'กรุณาเข้าสู่ระบบ'}</Text>
                    </View>
                </View>

                {/* การ์ดสถิติแบบ Glassmorphism */}
                <View style={styles.statsGlassContainer}>
                    <View style={styles.statItem}>
                        <View style={styles.statIconWrapper}>
                            <Ionicons name="leaf" size={20} color="#2E7D32" />
                        </View>
                        <Text style={stats.plants > 0 ? styles.statValue : [styles.statValue, { color: '#B0B8C1' }]}>
                            {stats.plants}
                        </Text>
                        <Text style={styles.statLabel}>พืชในแปลง</Text>
                    </View>

                    <View style={styles.statDivider} />

                    <View style={styles.statItem}>
                        <View style={styles.statIconWrapper}>
                            <Ionicons name="scan" size={20} color="#2E7D32" />
                        </View>
                        <Text style={stats.analyses > 0 ? styles.statValue : [styles.statValue, { color: '#B0B8C1' }]}>
                            {stats.analyses}
                        </Text>
                        <Text style={styles.statLabel}>วิเคราะห์สะสม</Text>
                    </View>

                    <View style={styles.statDivider} />

                    <View style={styles.statItem}>
                        <View style={styles.statIconWrapper}>
                            <Ionicons name="trophy" size={20} color="#2E7D32" />
                        </View>
                        <Text style={styles.statValue}>LV. 1</Text>
                        <Text style={styles.statLabel}>ระดับดูแล</Text>
                    </View>
                </View>

                {/* เมนูการตั้งค่าบัญชี */}
                <View style={styles.menuSection}>
                    <Text style={styles.sectionTitle}>การตั้งค่าบัญชี</Text>
                    <View style={styles.menuGroup}>
                        <MenuItem
                            icon="settings-outline"
                            title="จัดการข้อมูลบัญชี"
                            onPress={() => navigation.navigate('AccountSettings')}
                        />
                        <View style={styles.menuDivider} />
                        <MenuItem
                            icon="notifications-outline"
                            title="การแจ้งเตือน"
                            onPress={() => navigation.navigate('NotificationsSettings')}
                        />
                    </View>

                    <Text style={styles.sectionTitle}>แปลงผักและอุปกรณ์</Text>
                    <View style={styles.menuGroup}>
                        <MenuItem
                            icon="grid-outline"
                            title="จัดการแปลงผัก"
                            onPress={() => navigation.navigate('ManageFarm')}
                        />
                        <View style={styles.menuDivider} />
                        <MenuItem
                            icon="videocam-outline"
                            title="ตั้งค่ากล้องวงจรปิด"
                            onPress={() => navigation.navigate('CameraSettings')}
                        />
                    </View>
                </View>

                {/* Logout Button */}
                <View style={styles.logoutContainer}>
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
                        <Ionicons name="power-outline" size={24} color="#D32F2F" />
                        <Text style={styles.logoutText}>ออกจากระบบ</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 110 }} />
            </ScrollView>
        </View>
    );
};

const MenuItem = ({ icon, title, onPress }: any) => (
    <TouchableOpacity style={styles.menuItem} activeOpacity={0.6} onPress={onPress}>
        <View style={[styles.menuIconBox, { backgroundColor: '#E8F5E9' }]}>
            <Ionicons name={icon} size={22} color="#2E7D32" />
        </View>
        <Text style={styles.menuLabel}>{title}</Text>
        <Ionicons name="chevron-forward" size={18} color="#D1D1D6" />
    </TouchableOpacity>
);

export default ProfileScreen;
