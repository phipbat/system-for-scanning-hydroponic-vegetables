// ไฟล์สำหรับหน้า HomeScreen (หน้าหลักของแอปพลิเคชัน)
import React from 'react';
import { View, StyleSheet, TouchableOpacity, StatusBar, ScrollView, Platform, RefreshControl } from 'react-native';
import Text from '../components/CustomText';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scale, verticalScale } from '../utils/responsive';
import ActionBar from '../components/ActionBar';
import { styles } from '../styles/homeStyles';
import { theme } from '../styles/theme';
import { fetchCameraAlerts, CameraAnalysisRecord, AuthUser, getUser } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';

const HomeScreen: React.FC = ({ navigation }: any) => {
    const [latestAnalysis, setLatestAnalysis] = React.useState<CameraAnalysisRecord | null>(null);
    const [user, setUser] = React.useState<AuthUser | null>(null);
    const [isRefreshing, setIsRefreshing] = React.useState(false);
    const insets = useSafeAreaInsets();

    useFocusEffect(
        React.useCallback(() => {
            loadLatestStats();
        }, [])
    );

    // ระบบ Auto-Refresh (Polling) ดึงข้อมูลสรุปทุกๆ 30 วินาที
    React.useEffect(() => {
        const interval = setInterval(() => {
            loadLatestStats(false); // เรียกแบบเงียบๆ พื้นหลัง
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadLatestStats = async (showLoading = true) => {
        try {
            if (showLoading) setIsRefreshing(true);
            const [alerts, userData] = await Promise.all([
                fetchCameraAlerts(),
                getUser()
            ]);

            setUser(userData);
            if (alerts && alerts.length > 0) {
                setLatestAnalysis(alerts[0]);
            }
        } catch (error: any) {
            console.error("เกิดข้อผิดพลาดในการโหลดข้อมูลหน้าหลัก:", error);
            // ถ้า Unauthenticated ให้กลับไปหน้า Login
            if (error.message?.includes('Unauthenticated')) {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                });
            }
        } finally {
            if (showLoading) setIsRefreshing(false);
        }
    };


    // เมนูแบบ Grid (4 ช่อง)
    const gridMenus = [
        {
            title: 'วิเคราะห์โรค',
            desc: 'AI วินิจฉัยโรคพืช',
            icon: <MaterialCommunityIcons name="leaf" size={32} color="#2E7D32" />,
            bgColor: '#E8F5E9',
            screen: 'Scanner',
        },
        {
            title: 'แชทบอท AI',
            desc: 'ผู้ช่วยเกษตรอัจฉริยะ',
            icon: <MaterialCommunityIcons name="robot-happy-outline" size={32} color="#2E7D32" />,
            bgColor: '#E8F5E9',
            screen: 'Chat',
        },
        {
            title: 'การเติบโต',
            desc: 'ไทม์ไลน์การเติบโต',
            icon: <MaterialCommunityIcons name="chart-bell-curve-cumulative" size={32} color="#2E7D32" />,
            bgColor: '#E8F5E9',
            screen: 'Growth',
        },
        {
            title: 'ดูกล้องสด',
            desc: 'กล้อง IP Camera',
            icon: <MaterialCommunityIcons name="cctv" size={32} color="#2E7D32" />,
            bgColor: '#E8F5E9',
            screen: 'Camera',
        },
    ];

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

            {/* ส่วนหัว / Action Bar */}
            <ActionBar user={user} />

            <ScrollView
                style={styles.scrollArea}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={() => loadLatestStats(true)}
                        tintColor={theme.colors.primary}
                        colors={[theme.colors.primary]}
                    />
                }
            >

                {/* ส่วน Hero Card แสดงภาพรวม */}
                <View style={styles.heroCard}>
                    <View style={styles.heroContent}>
                        <View style={styles.heroBadge}>
                            <MaterialCommunityIcons name="weather-partly-cloudy" size={16} color="#fff" />
                            <Text style={styles.heroBadgeText}> อากาศดี เหมาะแก่การดูแลพืช</Text>
                        </View>
                        <Text style={styles.heroTitle}>ระบบบริหารจัดการฟาร์ม</Text>
                        <Text style={styles.heroDesc}>ดูแลฟาร์มผักไฮโดรโปนิกส์ของคุณด้วย AI และเทคโนโลยีเกษตรอัจฉริยะ</Text>

                        {/* ส่วนแสดงค่าพารามิเตอร์ต่างๆ */}
                        <View style={styles.heroMonitorRow}>
                            <View style={styles.heroMonitorItem}>
                                <Text style={styles.heroMonitorLabel}>ค่า pH:</Text>
                                <Text style={styles.heroMonitorValue}>{latestAnalysis?.ph_value?.toFixed(1) || 'กำลังพัฒนา'}</Text>
                            </View>
                            <View style={styles.heroMonitorItem}>
                                <Text style={styles.heroMonitorLabel}>ค่า EC:</Text>
                                <Text style={styles.heroMonitorValue}>{(latestAnalysis?.ec_value?.toFixed(2) || 'กำลังพัฒนา')} <Text style={{ fontSize: 8 }}></Text></Text>
                            </View>
                        </View>
                    </View>
                    <MaterialCommunityIcons name="sprout" size={100} color="rgba(255,255,255,0.15)" style={styles.heroBgIcon} />
                </View>

                {/* ส่วนแสดงข้อมูลสถิติการเติบโตล่าสุด (ส่วนใหม่) */}
                <View style={styles.sectionHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.sectionTitle}>สแกนล่าสุด</Text>
                        <MaterialCommunityIcons name="leaf" size={18} color={theme.colors.primary} style={{ marginLeft: 6 }} />
                    </View>
                </View>
                <View style={styles.statsRow}>
                    <StatItem label="สูง" value={latestAnalysis?.plant_height} unit="ซม." icon="ruler" />
                    <StatItem label="พุ่ม" value={latestAnalysis?.canopy_width} unit="ซม." icon="arrow-expand-horizontal" />
                    <StatItem label="ใบ" value={latestAnalysis?.leaf_width} unit="ซม." icon="leaf" />
                    <StatItem label="นับใบ" value={latestAnalysis?.leaf_count} unit="ใบ" icon="format-list-bulleted-type" />
                    <StatItem label="น้ำหนัก" value={latestAnalysis?.fresh_weight_with_root} unit="กรัม" icon="scale-balance" />
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>ฟังก์ชันหลัก</Text>
                </View>

                {/* Grid Menu */}
                <View style={styles.gridContainer}>
                    {gridMenus.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.gridItem}
                            onPress={() => navigation.navigate(item.screen)}
                            activeOpacity={0.8}
                        >
                            <View style={[styles.iconBox, { backgroundColor: item.bgColor }]}>
                                {item.icon}
                            </View>
                            <Text style={styles.gridTitle}>{item.title}</Text>
                            <Text style={styles.gridDesc}>{item.desc}</Text>
                        </TouchableOpacity>
                    ))}
                </View>


            </ScrollView>
        </View>
    );
};

const StatItem = ({ label, value, unit, icon }: any) => (
    <View style={styles.statCard}>
        <View style={styles.statIconBox}>
            <MaterialCommunityIcons name={icon} size={16} color={theme.colors.primary} />
        </View>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value ?? '-'}</Text>
        <Text style={styles.statUnit}>{unit}</Text>
    </View>
);

export default HomeScreen;
