// ไฟล์สำหรับหน้า HistoryDetail (กู้คืน UI ตาราง 3 คอลัมน์ และตัดค่า pH ออก)
import React from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, StatusBar, Share, Alert } from 'react-native';
import Text from '../../components/CustomText';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../styles/theme';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';
import ActionBar from '../../components/ActionBar';
import { LinearGradient } from 'expo-linear-gradient';

const HistoryDetail: React.FC = ({ route, navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { record } = route.params;

    if (!record) return null;

    const onShare = async () => {
        try {
            await Share.share({
                message: `ผลวิเคราะห์โรคพืช: ${record.result}\nสแกนเมื่อ: ${record.date}`,
            });
        } catch (error) {
            Alert.alert('ผิดพลาด', 'ไม่สามารถแชร์ได้');
        }
    };

    const renderContentSections = () => {
        const lines = record.result.split('\n');
        return lines.map((line: string, index: number) => {
            const isHeading = line.includes(':');
            if (isHeading) {
                const [title, content] = line.split(':');
                return (
                    <View key={index} style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionIconCircle}>
                                <Ionicons 
                                    name={title.includes('แก้ไข') ? "construct" : (title.includes('อาการ') ? "search" : "warning")} 
                                    size={16} 
                                    color={theme.colors.primary} 
                                />
                            </View>
                            <Text style={styles.sectionTitle}>{title.trim()}</Text>
                        </View>
                        <Text style={styles.sectionContent}>{content.trim()}</Text>
                    </View>
                );
            }
            if (line.trim().length === 0) return null;
            return <Text key={index} style={styles.pureText}>{line.trim()}</Text>;
        });
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            
            <ActionBar 
                title="รายละเอียดประวัติ" 
                subtitle={record.date}
                showBack={true} 
                onBack={() => navigation.goBack()} 
            />

            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollPadding}
            >
                {/* ── Main Image Card ── */}
                <View style={styles.imageCard}>
                    <Image 
                        source={{ uri: `data:image/jpeg;base64,${record.imageBase64}` }} 
                        style={styles.mainImage}
                        resizeMode="cover"
                    />
                    <LinearGradient 
                        colors={['transparent', 'rgba(0,0,0,0.6)']} 
                        style={styles.imageOverlay} 
                    />
                    <View style={styles.imageTag}>
                        <Ionicons name="calendar" size={12} color="#fff" />
                        <Text style={styles.imageTagText}>{record.date}</Text>
                    </View>
                </View>

                {/* ── Measurements Grid (3 Columns Dashboard Style) ── */}
                <View style={styles.measureContainer}>
                    <View style={styles.measureHeader}>
                        <Ionicons name="stats-chart" size={18} color={theme.colors.primary} />
                        <Text style={styles.measureTitle}>ค่าวิเคราะห์การเติบโต</Text>
                    </View>
                    <View style={styles.measureGrid}>
                        <StatBox label="สูง" value={record.measurements?.height} unit="ซม." icon="ruler" />
                        <StatBox label="พุ่ม" value={record.measurements?.canopy} unit="ซม." icon="arrow-expand-horizontal" />
                        <StatBox label="ใบ" value={record.measurements?.leaf_width} unit="ซม." icon="leaf" />
                        <StatBox label="นับใบ" value={record.measurements?.leaf_count} unit="ใบ" icon="format-list-bulleted-type" />
                        <StatBox label="น้ำหนัก" value={record.measurements?.weight} unit="กรัม" icon="scale-balance" />
                    </View>
                </View>

                {/* ── Analysis Results ── */}
                <View style={styles.resultsHeader}>
                    <Ionicons name="analytics" size={20} color={theme.colors.primary} />
                    <Text style={styles.resultsMainTitle}>บทสรุปการวิเคราะห์โดย AI</Text>
                </View>

                {renderContentSections()}

                {/* ── Action Buttons ── */}
                <View style={styles.actionContainer}>
                    <TouchableOpacity style={styles.shareBtn} onPress={onShare}>
                        <Ionicons name="share-social-outline" size={20} color={theme.colors.primary} />
                        <Text style={styles.shareBtnText}>แชร์ผลวิเคราะห์</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.chatBtn} 
                        onPress={() => navigation.navigate('Chat', { message: `ขอปรึกษาเรื่อง${record.result.split('\n')[0]} หน่อยครับ` })}
                    >
                        <LinearGradient colors={[theme.colors.primary, theme.colors.primaryDark]} style={styles.chatBtnInner}>
                            <MaterialCommunityIcons name="chat-processing-outline" size={20} color="#fff" />
                            <Text style={styles.chatBtnText}>ถาม AI เพิ่มเติม</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                <View style={{ height: verticalScale(40) }} />
            </ScrollView>
        </View>
    );
};

const StatBox = ({ label, value, unit, icon }: any) => (
    <View style={styles.statBox}>
        <View style={styles.statIconCircle}>
            <MaterialCommunityIcons name={icon} size={15} color={theme.colors.primary} />
        </View>
        <Text style={styles.statLabel}>{label}</Text>
        <View style={styles.statValueBox}>
            <Text style={styles.statValue}>{value || '-'}</Text>
            <Text style={styles.statUnit}>{unit}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    scrollPadding: {
        paddingHorizontal: scale(20),
        paddingTop: verticalScale(16),
    },
    imageCard: {
        width: '100%',
        height: verticalScale(260),
        borderRadius: scale(24),
        backgroundColor: '#fff',
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        marginBottom: verticalScale(20),
    },
    mainImage: {
        width: '100%',
        height: '100%',
    },
    imageOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '40%',
    },
    imageTag: {
        position: 'absolute',
        bottom: scale(16),
        left: scale(16),
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: scale(10),
        paddingVertical: scale(4),
        borderRadius: scale(12),
        gap: scale(4),
    },
    imageTagText: {
        color: '#fff',
        fontSize: moderateScale(11),
        fontWeight: 'bold',
    },
    measureContainer: {
        backgroundColor: '#fff',
        borderRadius: scale(20),
        padding: scale(16),
        marginBottom: verticalScale(20),
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    measureHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(6),
        marginBottom: verticalScale(16),
    },
    measureTitle: {
        fontSize: moderateScale(15),
        fontWeight: 'bold',
        color: '#1A1A2E',
    },
    measureGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: scale(8),
    },
    statBox: {
        width: (scale(375) - scale(40) - scale(32) - scale(16)) / 3,
        alignItems: 'center',
        paddingVertical: verticalScale(8),
        backgroundColor: '#F8FAFC',
        borderRadius: scale(14),
        marginBottom: 8,
    },
    statIconCircle: {
        width: scale(26),
        height: scale(26),
        borderRadius: scale(13),
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(4),
    },
    statLabel: {
        fontSize: moderateScale(10),
        color: '#64748B',
        fontWeight: '700',
        marginBottom: 2,
    },
    statValueBox: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 2,
    },
    statValue: {
        fontSize: moderateScale(16),
        fontWeight: 'bold',
        color: '#1A1A2E',
    },
    statUnit: {
        fontSize: moderateScale(8),
        color: '#94A3B8',
        fontWeight: 'bold',
    },
    resultsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(10),
        marginBottom: verticalScale(16),
        marginTop: verticalScale(4),
    },
    resultsMainTitle: {
        fontSize: moderateScale(18),
        fontWeight: 'bold',
        color: '#1A1A2E',
    },
    sectionCard: {
        backgroundColor: '#fff',
        borderRadius: scale(18),
        padding: scale(16),
        marginBottom: verticalScale(12),
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(8),
        marginBottom: verticalScale(8),
    },
    sectionIconCircle: {
        width: scale(28),
        height: scale(28),
        borderRadius: scale(14),
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: moderateScale(15),
        fontWeight: 'bold',
        color: '#2E7D32',
    },
    sectionContent: {
        fontSize: moderateScale(14),
        color: '#475569',
        lineHeight: verticalScale(22),
    },
    pureText: {
        fontSize: moderateScale(16),
        fontWeight: 'bold',
        color: '#1A1A2E',
        marginBottom: verticalScale(12),
        paddingHorizontal: scale(4),
    },
    actionContainer: {
        flexDirection: 'row',
        gap: scale(12),
        marginTop: verticalScale(24),
    },
    shareBtn: {
        flex: 1,
        height: verticalScale(50),
        borderRadius: scale(16),
        backgroundColor: '#fff',
        borderWidth: 1.5,
        borderColor: '#E8F5E9',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: scale(8),
    },
    shareBtnText: {
        color: '#2E7D32',
        fontSize: moderateScale(14),
        fontWeight: 'bold',
    },
    chatBtn: {
        flex: 1.5,
        height: verticalScale(50),
        borderRadius: scale(16),
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#2E7D32',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    chatBtnInner: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: scale(8),
    },
    chatBtnText: {
        color: '#fff',
        fontSize: moderateScale(14),
        fontWeight: 'bold',
    },
});

export default HistoryDetail;
