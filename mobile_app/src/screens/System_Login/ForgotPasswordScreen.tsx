// ไฟล์สำหรับหน้า ForgotPasswordScreen (หน้าจอขอรีเซ็ตรหัสผ่านในกรณีที่ลืม)
import React, { useState } from 'react';
import {
    View, TouchableOpacity, SafeAreaView,
    ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert
} from 'react-native';
import TextInput from '../../components/CustomTextInput';
import Text from '../../components/CustomText';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { apiForgotPassword } from '../../services/api';
import { loginStyles as styles } from '../../styles/loginStyles';

const ForgotPasswordScreen: React.FC = ({ navigation }: any) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [isEmailFocused, setIsEmailFocused] = useState(false);

    const handleResetPassword = async () => {
        if (!email) {
            Alert.alert('แจ้งเตือน', 'กรุณากรอกอีเมลที่ใช้ลงทะเบียน');
            return;
        }
        setLoading(true);
        try {
            await apiForgotPassword(email);
            Alert.alert(
                'ส่งอีเมลสำเร็จ', 
                'ระบบได้ทำการส่งลิงก์สำหรับเปลี่ยนรหัสผ่านไปที่อีเมลของคุณแล้ว กรุณาตรวจสอบกล่องข้อความ',
                [
                    { text: 'ตกลง', onPress: () => navigation.navigate('Login') }
                ]
            );
        } catch (error: any) {
            Alert.alert('เกิดข้อผิดพลาด', error.message || 'ไม่สามารถส่งอีเมลรีเซ็ตรหัสผ่านได้ กรุณาลองอีกครั้ง');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* ปุ่มย้อนกลับ */}
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={24} color={theme.colors.text} style={{ marginLeft: -2 }} />
                    </TouchableOpacity>

                    {/* Logo & Header */}
                    <View style={styles.logoContainer}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="lock-closed" size={48} color={theme.colors.primary} />
                        </View>
                        <Text style={styles.title}>ลืมรหัสผ่าน</Text>
                        <Text style={styles.subtitle}>กรุณากรอกอีเมลของคุณเพื่อรีเซ็ตรหัสผ่าน</Text>
                    </View>

                    {/* ฟอร์มลืมรหัสผ่าน */}
                    <View style={styles.formContainer}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>อีเมล</Text>
                            <View style={[styles.inputWrapper, isEmailFocused && styles.inputWrapperActive]}>
                                <Ionicons name="mail-outline" size={20} color={isEmailFocused ? theme.colors.primary : "#999"} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="your-email@example.com"
                                    placeholderTextColor="#bbb"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    editable={!loading}
                                    onFocus={() => setIsEmailFocused(true)}
                                    onBlur={() => setIsEmailFocused(false)}
                                />
                            </View>
                        </View>

                        {/* ปุ่ม ส่งอีเมล */}
                        <TouchableOpacity
                            style={[styles.loginButton, (!email || loading) && { opacity: 0.6 }, { marginTop: 10 }]}
                            activeOpacity={0.8}
                            onPress={handleResetPassword}
                            disabled={!email || loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={theme.colors.white} />
                            ) : (
                                <>
                                    <Text style={styles.loginButtonText}>ส่งลิงก์รีเซ็ตรหัสผ่าน</Text>
                                    <Ionicons name="paper-plane-outline" size={22} color={theme.colors.white} style={{ marginLeft: 10 }} />
                                </>
                            )}
                        </TouchableOpacity>

                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ForgotPasswordScreen;
