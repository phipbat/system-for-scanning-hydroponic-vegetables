import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Text from '../components/CustomText';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../styles/theme';
import { AuthUser } from '../services/api';
import { scale, verticalScale, moderateScale } from '../utils/responsive';

interface ActionBarProps {
    title?: string;
    subtitle?: string;
    showBack?: boolean;
    onBack?: () => void;
    leftIcon?: React.ReactNode;
    rightAction?: React.ReactNode;
    user?: AuthUser | null;
}

export default function ActionBar({
    title = 'Smart Farm',
    subtitle = 'สวัสดีตอนเช้า',
    showBack = false,
    onBack,
    leftIcon,
    rightAction,
    user,
}: ActionBarProps) {
    const navigation = useNavigation();

    // ดึงตัวอักษรแรกของชื่อสำหรับ Avatar fallback
    const initial = (user?.display_name || user?.name || 'S')[0].toUpperCase();

    return (
        <View style={styles.header}>
            {/* ── ฝั่งซ้าย: Avatar หรือปุ่มกลับ ── */}
            <View style={styles.left}>
                {showBack ? (
                    <TouchableOpacity
                        style={styles.roundBtn}
                        onPress={onBack ?? (() => navigation.goBack())}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="chevron-back" size={moderateScale(22)} color={theme.colors.text} />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Profile' as never)}
                        activeOpacity={0.85}
                    >
                        {leftIcon ? leftIcon : (
                            <View style={styles.avatarOuter}>
                                {user?.profile_image_url ? (
                                    <Image
                                        source={{ uri: user.profile_image_url }}
                                        style={styles.avatarImg}
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <View style={styles.avatarFallback}>
                                        <Text style={styles.avatarInitial}>{initial}</Text>
                                    </View>
                                )}
                                {/* จุดสีเขียว (online) */}
                                <View style={styles.onlineDot} />
                            </View>
                        )}
                    </TouchableOpacity>
                )}
            </View>

            {/* ── กลาง: ข้อความทักทาย หรือ ชื่อหน้า ── */}
            <View style={styles.center}>
                {(title && title !== 'Smart Farm') ? (
                    <>
                        <Text style={styles.nameText} numberOfLines={1}>{title}</Text>
                        {subtitle && <Text style={styles.greetText} numberOfLines={1}>{subtitle}</Text>}
                    </>
                ) : (
                    <>
                        <View style={styles.greetRow}>
                            <Ionicons name="sunny-outline" size={moderateScale(11)} color={theme.colors.textSecondary} style={{ marginRight: 3 }} />
                            <Text style={styles.greetText}>สวัสดียามเช้า</Text>
                        </View>
                        <Text style={styles.nameText} numberOfLines={1}>
                            {user?.display_name || user?.name || 'Smart Farmer'}
                        </Text>
                    </>
                )}
            </View>

            {/* ── ฝั่งขวา: ปุ่มไอคอน ── */}
            <View style={styles.right}>
                {rightAction ?? (
                    <>
                        {/* ปุ่มแชทบอท */}
                        <TouchableOpacity
                            style={styles.roundBtn}
                            onPress={() => navigation.navigate('Chat' as never)}
                            activeOpacity={0.7}
                        >
                            <MaterialCommunityIcons name="robot-outline" size={moderateScale(20)} color={theme.colors.text} />
                        </TouchableOpacity>

                        {/* ปุ่มแจ้งเตือน */}
                        <TouchableOpacity 
                            style={styles.roundBtn} 
                            onPress={() => navigation.navigate('CameraAlerts' as never)}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="notifications-outline" size={moderateScale(20)} color={theme.colors.text} />
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    // ── แถบ Header หลัก — ลอย มีเงา ──
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(12),
        backgroundColor: '#ffffff',
        marginHorizontal: scale(16),
        marginTop: scale(16),
        marginBottom: scale(8),
        borderRadius: scale(28),
        // เงานุ่มๆ แบบ premium
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.07,
        shadowRadius: 16,
        elevation: 8,
        // ขอบบางๆ เพิ่ม definition
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.04)',
    },

    left: {
        marginRight: scale(10),
    },

    center: {
        flex: 1,
    },

    right: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(6),
    },

    // ── Avatar ──
    avatarOuter: {
        width: scale(44),
        height: scale(44),
        borderRadius: scale(22),
    },
    avatarImg: {
        width: scale(44),
        height: scale(44),
        borderRadius: scale(22),
    },
    avatarFallback: {
        width: scale(44),
        height: scale(44),
        borderRadius: scale(22),
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#C8E6C9',
    },
    avatarInitial: {
        fontSize: moderateScale(15),
        fontWeight: '800',
        color: theme.colors.primary,
    },
    onlineDot: {
        position: 'absolute',
        bottom: 1,
        right: 1,
        width: scale(10),
        height: scale(10),
        borderRadius: scale(5),
        backgroundColor: '#4CAF50',
        borderWidth: 1.5,
        borderColor: '#ffffff',
    },

    // ── ข้อความ ──
    greetRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(1),
    },
    greetText: {
        fontSize: moderateScale(11),
        color: theme.colors.textSecondary,
        fontWeight: '600',
    },
    nameText: {
        fontSize: moderateScale(18),
        fontWeight: '800',
        color: theme.colors.text,
        letterSpacing: -0.3,
    },

    // ── ปุ่มกลม ──
    roundBtn: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(20),
        backgroundColor: '#F5F7FA',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },

    // ── Badge แจ้งเตือน ──
    badge: {
        position: 'absolute',
        top: scale(5),
        right: scale(5),
        backgroundColor: theme.colors.danger,
        width: scale(14),
        height: scale(14),
        borderRadius: scale(7),
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#ffffff',
    },
    badgeText: {
        color: '#ffffff',
        fontSize: moderateScale(8),
        fontWeight: 'bold',
    },
});
