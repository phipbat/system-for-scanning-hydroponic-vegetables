// ไฟล์สำหรับหน้า CameraAlertsScreen (หน้าแสดงการแจ้งเตือนจากกล้องวงจรปิด)
import React, { useState, useEffect, useRef } from 'react';
import { View, FlatList, ActivityIndicator, Alert, StatusBar } from 'react-native';
import Text from '../components/CustomText';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchCameraAlerts, CameraAnalysisRecord } from '../services/api';
import ActionBar from '../components/ActionBar';
import { styles } from '../styles/cameraAlertsStyles';
import { theme } from '../styles/theme';
import { verticalScale } from '../utils/responsive';

const CameraAlertsScreen: React.FC = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const [alerts, setAlerts] = useState<CameraAnalysisRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const pollRef = useRef<NodeJS.Timeout | null>(null);

    const loadAlerts = async () => {
        try {
            const data = await fetchCameraAlerts();
            setAlerts(data);
        } catch (error) {
            console.error('Error fetching camera alerts: ', error);
            Alert.alert('ข้อผิดพลาด', 'ไม่สามารถดึงข้อมูลการแจ้งเตือนจากกล้องได้');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAlerts();
        // ดึงข้อมูลใหม่ทุก 10 วินาที
        pollRef.current = setInterval(loadAlerts, 10000);
        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, []);

    const getSeverityColor = (severity: string) => {
        switch (severity?.toLowerCase()) {
            case 'high':   return theme.colors.primaryDark;
            case 'medium': return theme.colors.primary;
            case 'low':    return '#81C784';
            default:       return theme.colors.primary;
        }
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity?.toLowerCase()) {
            case 'high':   return 'alert-circle';
            case 'medium': return 'warning';
            case 'low':    return 'checkmark-circle';
            default:       return 'information-circle';
        }
    };

    const formatDate = (isoString: string) => {
        if (!isoString) return '';
        return new Date(isoString).toLocaleString('th-TH', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    const renderItem = ({ item }: { item: CameraAnalysisRecord }) => {
        const severityColor = getSeverityColor(item.severity);
        const cameraName = item.camera?.name || item.camera_id || 'Unknown IP Camera';

        return (
            <View style={styles.card}>
                <View style={[styles.cardBorder, { backgroundColor: severityColor }]} />
                <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                        <View style={styles.cameraTag}>
                            <MaterialCommunityIcons name="cctv" size={14} color="#666" />
                            <Text style={styles.cameraTagText}>{cameraName}</Text>
                        </View>
                        <Text style={styles.timeText}>{formatDate(item.timestamp)}</Text>
                    </View>

                    <View style={styles.mainInfo}>
                        <Ionicons name={getSeverityIcon(item.severity) as any} size={28} color={severityColor} style={styles.statusIcon} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.plantName}>{item.plant_name || 'ไม่ระบุพืช'}</Text>
                            <Text style={[styles.healthStatus, { color: severityColor }]}>
                                {item.diagnosis_summary || item.health_status}
                            </Text>
                            {item.recommendation && (
                                <Text style={styles.recommendationText}>
                                    <Ionicons name="bulb-outline" size={14} color={theme.colors.primary} /> แนะนำ: {item.recommendation}
                                </Text>
                            )}
                        </View>
                    </View>

                    <View style={styles.footerRow}>
                        <Text style={styles.confidenceText}>
                            ความแม่นยำ: {item.confidence ? item.confidence.toFixed(1) + '%' : 'N/A'}
                        </Text>
                        <View style={[styles.severityBadge, { backgroundColor: severityColor + '20' }]}>
                            <Text style={[styles.severityText, { color: severityColor }]}>
                                ระดับ: {item.severity || 'Normal'}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
            <ActionBar
                title="การแจ้งเตือนจากกล้อง"
                subtitle="Camera Backend Analysis"
                showBack={true}
            />

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={styles.loadingText}>กำลังดึงข้อมูล...</Text>
                </View>
            ) : alerts.length === 0 ? (
                <View style={styles.centerContainer}>
                    <MaterialCommunityIcons name="shield-check-outline" size={80} color={theme.colors.textSecondary} />
                    <Text style={styles.emptyText}>ไม่มีการแจ้งเตือนความผิดปกติ</Text>
                    <Text style={styles.emptySubtext}>สวนของคุณปกติดีในขณะนี้</Text>
                </View>
            ) : (
                <FlatList
                    data={alerts}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + verticalScale(20) }]}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
};

export default CameraAlertsScreen;
