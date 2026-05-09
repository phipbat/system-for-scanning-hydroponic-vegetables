// ไฟล์สำหรับหน้า AccountSettingsScreen (หน้าจอกำหนดค่าบัญชีผู้ใช้ ข้อมูลส่วนตัว และความปลอดภัย)
import React, { useState, useEffect } from 'react';
import {
    View, StyleSheet, ScrollView, TouchableOpacity,
    ActivityIndicator, Alert, StatusBar,
} from 'react-native';
import TextInput from '../../components/CustomTextInput';
import Text from '../../components/CustomText';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../styles/theme';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';
import { getUser, apiUpdateUser, apiChangePassword, AuthUser } from '../../services/api';
import ActionBar from '../../components/ActionBar';

const AccountSettingsScreen: React.FC = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    
    // สถานะข้อมูลส่วนตัว (Personal Info State)
    const [name, setName] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [savingInfo, setSavingInfo] = useState(false);

    // สถานะความปลอดภัย (Security State)
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [savingPass, setSavingPass] = useState(false);
    const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await getUser();
            if (data) {
                setUser(data);
                setName(data.name || '');
                setDisplayName(data.display_name || '');
                setEmail(data.email || '');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveInfo = async () => {
        if (!name.trim()) {
            Alert.alert('แจ้งเตือน', 'กรุณากรอกชื่อจริง');
            return;
        }
        try {
            setSavingInfo(true);
            await apiUpdateUser({ name: name.trim(), display_name: displayName.trim() });
            Alert.alert('สำเร็จ', 'บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว');
        } catch (e: any) {
            Alert.alert('ข้อผิดพลาด', e.message || 'ไม่สามารถบันทึกข้อมูลได้');
        } finally {
            setSavingInfo(false);
        }
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('แจ้งเตือน', 'กรุณากรอกข้อมูลรหัสผ่านให้ครบถ้วน');
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert('แจ้งเตือน', 'รหัสผ่านใหม่ไม่ตรงกัน');
            return;
        }
        try {
            setSavingPass(true);
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
            Alert.alert('ข้อผิดพลาด', e.message || 'ไม่สามารถเปลี่ยนรหัสผ่านได้');
        } finally {
            setSavingPass(false);
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
                title="จัดการบัญชี"
                subtitle="ข้อมูลส่วนตัวและความปลอดภัย"
                showBack={true}
                user={user}
            />

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Avatar Header */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatarCircle}>
                        <Text style={styles.avatarInitial}>
                            {(displayName || name || 'U')[0].toUpperCase()}
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.changeAvatarBtn}>
                        <Text style={styles.changeAvatarText}>เปลี่ยนรูปโปรไฟล์</Text>
                    </TouchableOpacity>
                </View>

                {/* Section 1: Personal Info */}
                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="person" size={20} color={theme.colors.primary} />
                        <Text style={styles.sectionTitleText}>ข้อมูลส่วนตัว</Text>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>ชื่อจริง</Text>
                        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Full Name" />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>ชื่อที่แสดง (Display Name)</Text>
                        <TextInput style={styles.input} value={displayName} onChangeText={setDisplayName} placeholder="Display Name" />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>อีเมล (ไม่สามารถแก้ไขได้)</Text>
                        <TextInput style={[styles.input, styles.disabledInput]} value={email} editable={false} />
                    </View>

                    <TouchableOpacity style={styles.primaryBtn} onPress={handleSaveInfo} disabled={savingInfo}>
                        {savingInfo ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>อัปเดตข้อมูลส่วนตัว</Text>}
                    </TouchableOpacity>
                </View>

                {/* Section 2: Security */}
                <View style={[styles.sectionCard, { marginTop: verticalScale(20) }]}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="lock-closed" size={20} color={theme.colors.primary} />
                        <Text style={styles.sectionTitleText}>ความปลอดภัย</Text>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>รหัสผ่านปัจจุบัน</Text>
                        <View style={styles.passInputWrapper}>
                            <TextInput 
                                style={styles.passInput} 
                                value={currentPassword} 
                                onChangeText={setCurrentPassword} 
                                secureTextEntry={!showPass.current}
                                placeholder="Current Password"
                            />
                            <TouchableOpacity onPress={() => setShowPass({...showPass, current: !showPass.current})}>
                                <Ionicons name={showPass.current ? "eye-off" : "eye"} size={20} color="#999" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>รหัสผ่านใหม่</Text>
                        <View style={styles.passInputWrapper}>
                            <TextInput 
                                style={styles.passInput} 
                                value={newPassword} 
                                onChangeText={setNewPassword} 
                                secureTextEntry={!showPass.new}
                                placeholder="New Password"
                            />
                            <TouchableOpacity onPress={() => setShowPass({...showPass, new: !showPass.new})}>
                                <Ionicons name={showPass.new ? "eye-off" : "eye"} size={20} color="#999" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>ยืนยันรหัสผ่านใหม่</Text>
                        <View style={styles.passInputWrapper}>
                            <TextInput 
                                style={styles.passInput} 
                                value={confirmPassword} 
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showPass.confirm}
                                placeholder="Confirm New Password"
                            />
                            <TouchableOpacity onPress={() => setShowPass({...showPass, confirm: !showPass.confirm})}>
                                <Ionicons name={showPass.confirm ? "eye-off" : "eye"} size={20} color="#999" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.colors.primaryDark }]} onPress={handleChangePassword} disabled={savingPass}>
                        {savingPass ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>เปลี่ยนรหัสผ่าน</Text>}
                    </TouchableOpacity>
                </View>

                {/* Footer Info */}
                <View style={styles.infoCard}>
                    <Ionicons name="shield-checkmark" size={24} color="#2E7D32" style={{ marginRight: 12 }} />
                    <Text style={styles.infoText}>ข้อมูลของคุณจะถูกเก็บรักษาอย่างปลอดภัยตามนโยบายความเป็นส่วนตัวของระบบ</Text>
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
    },
    avatarSection: {
        alignItems: 'center',
        marginVertical: verticalScale(25),
    },
    avatarCircle: {
        width: scale(90),
        height: scale(90),
        borderRadius: scale(45),
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#ffffff',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    avatarInitial: {
        fontSize: moderateScale(36),
        fontWeight: 'bold',
        color: theme.colors.primary,
    },
    changeAvatarBtn: {
        marginTop: verticalScale(10),
    },
    changeAvatarText: {
        color: theme.colors.primary,
        fontWeight: 'bold',
        fontSize: moderateScale(14),
    },
    sectionCard: {
        backgroundColor: '#ffffff',
        borderRadius: scale(24),
        padding: scale(20),
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.03)',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(20),
    },
    sectionTitleText: {
        fontSize: moderateScale(16),
        fontWeight: '800',
        color: '#1a1a2e',
        marginLeft: 8,
    },
    inputGroup: {
        marginBottom: verticalScale(16),
    },
    label: {
        fontSize: moderateScale(13),
        fontWeight: '700',
        color: '#666',
        marginBottom: verticalScale(6),
        marginLeft: scale(4),
    },
    input: {
        backgroundColor: '#F5F7FA',
        borderRadius: scale(14),
        paddingHorizontal: scale(16),
        height: verticalScale(50),
        fontSize: moderateScale(15),
        color: '#1a1a2e',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.02)',
    },
    disabledInput: {
        color: '#999',
        backgroundColor: '#f0f0f0',
    },
    passInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F7FA',
        borderRadius: scale(14),
        paddingHorizontal: scale(16),
        height: verticalScale(50),
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.02)',
    },
    passInput: {
        flex: 1,
        fontSize: moderateScale(15),
        color: '#1a1a2e',
        height: '100%',
    },
    primaryBtn: {
        backgroundColor: '#ffffff',
        height: verticalScale(50),
        borderRadius: scale(14),
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: verticalScale(10),
        borderWidth: 1.5,
        borderColor: '#2E7D32',
    },
    btnText: {
        color: '#2E7D32',
        fontSize: moderateScale(15),
        fontWeight: 'bold',
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: '#E8F5E9',
        borderRadius: scale(18),
        padding: scale(16),
        marginTop: verticalScale(30),
        alignItems: 'center',
    },
    infoText: {
        flex: 1,
        fontSize: moderateScale(12),
        color: '#2E7D32',
        lineHeight: 18,
    },
});

export default AccountSettingsScreen;
