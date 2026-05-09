// ไฟล์สำหรับหน้า PersonalInfoScreen (หน้าจอจัดการข้อมูลส่วนตัวของผู้ใช้)
import React, { useState, useEffect } from 'react';
import {
    View, StyleSheet, ScrollView, TouchableOpacity,
    ActivityIndicator, Alert, Platform, StatusBar,
} from 'react-native';
import TextInput from '../../components/CustomTextInput';
import Text from '../../components/CustomText';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../styles/theme';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';
import { getUser, apiUpdateUser, AuthUser } from '../../services/api';
import ActionBar from '../../components/ActionBar';

const PersonalInfoScreen: React.FC = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const [user, setUser] = useState<AuthUser | null>(null);
    const [name, setName] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

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

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('แจ้งเตือน', 'กรุณากรอกชื่อจริง');
            return;
        }

        try {
            setSaving(true);
            await apiUpdateUser({
                name: name.trim(),
                display_name: displayName.trim(),
            });
            Alert.alert('สำเร็จ', 'บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว');
        } catch (e: any) {
            Alert.alert('ข้อผิดพลาด', e.message || 'ไม่สามารถบันทึกข้อมูลได้');
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
                title="ข้อมูลส่วนตัว"
                subtitle="จัดการข้อมูลของคุณ"
                showBack={true}
                user={user}
            />

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Image Summary */}
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

                {/* Form */}
                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>ชื่อจริง</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="person-outline" size={20} color={theme.colors.primary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="FullName"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>ชื่อที่แสดง (Display Name)</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="id-card-outline" size={20} color={theme.colors.primary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={displayName}
                                onChangeText={setDisplayName}
                                placeholder="Nickname or Display name"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>อีเมล (ไม่สามารถแก้ไขได้)</Text>
                        <View style={[styles.inputWrapper, styles.disabledInput]}>
                            <Ionicons name="mail-outline" size={20} color="#999" style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: '#999' }]}
                                value={email}
                                editable={false}
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.saveBtn}
                        onPress={handleSave}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
                                <Text style={styles.saveBtnText}>บันทึกข้อมูล</Text>
                            </>
                        )}
                    </TouchableOpacity>
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
        paddingTop: verticalScale(10),
    },
    avatarSection: {
        alignItems: 'center',
        marginVertical: verticalScale(30),
    },
    avatarCircle: {
        width: scale(100),
        height: scale(100),
        borderRadius: scale(50),
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#C8E6C9',
        marginBottom: verticalScale(12),
    },
    avatarInitial: {
        fontSize: moderateScale(40),
        fontWeight: 'bold',
        color: theme.colors.primary,
    },
    changeAvatarText: {
        color: theme.colors.primary,
        fontWeight: 'bold',
        fontSize: moderateScale(14),
    },
    changeAvatarBtn: {
        paddingVertical: 8,
    },
    form: {
        marginTop: verticalScale(10),
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
    disabledInput: {
        backgroundColor: '#F5F5F5',
        borderColor: '#EEEEEE',
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
        marginTop: verticalScale(20),
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
});

export default PersonalInfoScreen;
