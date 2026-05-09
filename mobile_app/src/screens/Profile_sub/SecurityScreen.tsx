// ไฟล์สำหรับหน้า SecurityScreen (หน้าจอกำหนดค่าความปลอดภัยและการเปลี่ยนรหัสผ่าน)
import React, { useState, useEffect } from 'react';
import {
    View, StyleSheet, ScrollView, TouchableOpacity,
    ActivityIndicator, Alert, StatusBar,
} from 'react-native';
import TextInput from '../../components/CustomTextInput';
import Text from '../../components/CustomText';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../styles/theme';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';
import { getUser, apiChangePassword, AuthUser } from '../../services/api';
import ActionBar from '../../components/ActionBar';

const SecurityScreen: React.FC = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const [user, setUser] = useState<AuthUser | null>(null);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await getUser();
            if (data) setUser(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('แจ้งเตือน', 'กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('แจ้งเตือน', 'รหัสผ่านใหม่ไม่ตรงกัน');
            return;
        }

        if (newPassword.length < 8) {
            Alert.alert('แจ้งเตือน', 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร');
            return;
        }

        try {
            setSaving(true);
            await apiChangePassword({
                current_password: currentPassword,
                password: newPassword,
                password_confirmation: confirmPassword,
            });
            Alert.alert('สำเร็จ', 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (e: any) {
            Alert.alert('ข้อผิดพลาด', e.message || 'ไม่สามารถเปลี่ยนรหัสผ่านได้ (ตรวจสอบรหัสผ่านปัจจุบันอีกครั้ง)');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <ActionBar
                title="ความปลอดภัย"
                subtitle="จัดการรหัสผ่านของคุณ"
                showBack={true}
                user={user}
            />

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.form}>
                    <Text style={styles.sectionTitle}>เปลี่ยนรหัสผ่าน</Text>
                    <Text style={styles.sectionDesc}>โปรดรักษารหัสผ่านของคุณไว้เป็นความลับและเข้าสู่ระบบด้วยรหัสผ่านที่คุณจำได้เท่านั้น</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>รหัสผ่านปัจจุบัน</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="lock-closed-outline" size={20} color={theme.colors.primary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                                placeholder="Current Password"
                                secureTextEntry={!showCurrentPassword}
                            />
                            <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                                <Ionicons name={showCurrentPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#999" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>รหัสผ่านใหม่</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="key-outline" size={20} color={theme.colors.primary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={newPassword}
                                onChangeText={setNewPassword}
                                placeholder="New Password (8+ characters)"
                                secureTextEntry={!showNewPassword}
                            />
                            <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                                <Ionicons name={showNewPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#999" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>ยืนยันรหัสผ่านใหม่</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="shield-checkmark-outline" size={20} color={theme.colors.primary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                placeholder="Confirm New Password"
                                secureTextEntry={!showConfirmPassword}
                            />
                            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#999" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.saveBtn}
                        onPress={handleChangePassword}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="shield-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
                                <Text style={styles.saveBtnText}>อัปเดตรหัสผ่าน</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Account Security Info Card */}
                <View style={styles.infoCard}>
                    <View style={styles.infoIconBox}>
                        <Ionicons name="alert-circle-outline" size={24} color="#FF9800" />
                    </View>
                    <View style={styles.infoContent}>
                        <Text style={styles.infoTitle}>คำแนะนำด้านความปลอดภัย</Text>
                        <Text style={styles.infoText}>ควรใช้รหัสผ่านที่คาดเดาได้ยาก (ผสมตัวเลขและสัญลักษณ์) และไม่ควรใช้รหัสผ่านซ้ำกับแอปพลิเคชันอื่น</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    scroll: {
        flex: 1,
    },
    content: {
        paddingHorizontal: scale(20),
        paddingTop: verticalScale(20),
    },
    form: {
        marginTop: verticalScale(10),
    },
    sectionTitle: {
        fontSize: moderateScale(20),
        fontWeight: '800',
        color: '#1a1a2e',
        marginBottom: verticalScale(6),
    },
    sectionDesc: {
        fontSize: moderateScale(13),
        color: '#6c757d',
        marginBottom: verticalScale(25),
        lineHeight: 18,
    },
    inputGroup: {
        marginBottom: verticalScale(20),
    },
    label: {
        fontSize: moderateScale(14),
        fontWeight: '700',
        color: '#1a1a2e',
        marginBottom: verticalScale(8),
        marginLeft: scale(4),
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: scale(16),
        borderWidth: 1,
        borderColor: '#E0E0E0',
        paddingHorizontal: scale(15),
        height: verticalScale(56),
    },
    inputIcon: {
        marginRight: scale(10),
    },
    input: {
        flex: 1,
        fontSize: moderateScale(16),
        color: '#1a1a2e',
        height: '100%',
    },
    saveBtn: {
        height: verticalScale(56),
        backgroundColor: '#2E7D32',
        borderRadius: scale(16),
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        marginTop: verticalScale(10),
        shadowColor: '#2E7D32',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    saveBtnText: {
        color: '#ffffff',
        fontSize: moderateScale(16),
        fontWeight: 'bold',
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: '#FFF9C4',
        borderRadius: scale(16),
        padding: scale(16),
        marginTop: verticalScale(30),
        alignItems: 'flex-start',
    },
    infoIconBox: {
        marginRight: scale(12),
        marginTop: 2,
    },
    infoContent: {
        flex: 1,
    },
    infoTitle: {
        fontSize: moderateScale(14),
        fontWeight: 'bold',
        color: '#827717',
        marginBottom: 4,
    },
    infoText: {
        fontSize: moderateScale(12),
        color: '#9E9D24',
        lineHeight: 16,
    },
});

export default SecurityScreen;
