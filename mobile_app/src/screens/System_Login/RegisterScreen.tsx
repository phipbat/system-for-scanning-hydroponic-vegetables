// ไฟล์สำหรับหน้า RegisterScreen (หน้าจอระบบลงทะเบียนผู้ใช้ใหม่)
import React, { useState } from 'react';
import {
    View, TouchableOpacity, SafeAreaView,
    ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert
} from 'react-native';
import TextInput from '../../components/CustomTextInput';
import Text from '../../components/CustomText';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { apiRegister } from '../../services/api';
import { loginStyles as styles } from '../../styles/loginStyles';

const RegisterScreen: React.FC = ({ navigation }: any) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    
    // สถานะการโชว์-ซ่อนรหัสผ่าน (Show-hide password state)
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // States for Focus
    const [isNameFocused, setIsNameFocused] = useState(false);
    const [isEmailFocused, setIsEmailFocused] = useState(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);

    const handleRegister = async () => {
        if (!name || !email || !password || !confirmPassword) {
            Alert.alert('แจ้งเตือน', 'กรุณากรอกข้อมูลให้ครบทุกช่อง');
            return;
        }

        if (password.length < 6) {
            Alert.alert('แจ้งเตือน', 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('แจ้งเตือน', 'รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
            return;
        }

        setLoading(true);
        try {
            // สร้าง User ผ่าน Backend API (MySQL)
            await apiRegister(name, email, password);

            Alert.alert(
                'สำเร็จ',
                'สมัครสมาชิกเรียบร้อยแล้ว ยินดีต้อนรับเข้าสู่แอป Smart Farm AI!',
                [{ text: 'เข้าสู่แอป', onPress: () => navigation.navigate('Main') }]
            );

        } catch (error: any) {
            let errorMessage = "ไม่สามารถสมัครสมาชิกได้ กรุณาลองใหม่ในภายหลัง";
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = "อีเมลนี้ถูกใช้งานไปแล้ว ลองรีเซ็ตรหัสผ่านหรือใช้อีเมลอื่น";
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = "รูปแบบอีเมลไม่ถูกต้อง";
            }
            Alert.alert('การลงทะเบียนล้มเหลว', errorMessage);
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
                            <Ionicons name="person-add" size={48} color={theme.colors.primary} />
                        </View>
                        <Text style={styles.title}>สร้างบัญชี</Text>
                        <Text style={styles.subtitle}>เข้าร่วมดูแลแปลงผักอัจฉริยะไปกับเรา</Text>
                    </View>

                    {/* ฟอร์มสมัครสมาชิก */}
                    <View style={styles.formContainer}>
                        
                        {/* ชื่อ-นามสกุล */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>ชื่อ - นามสกุล</Text>
                            <View style={[styles.inputWrapper, isNameFocused && styles.inputWrapperActive]}>
                                <Ionicons name="person-outline" size={20} color={isNameFocused ? theme.colors.primary : "#999"} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="สมชาย ใจดี"
                                    placeholderTextColor="#bbb"
                                    value={name}
                                    onChangeText={setName}
                                    editable={!loading}
                                    onFocus={() => setIsNameFocused(true)}
                                    onBlur={() => setIsNameFocused(false)}
                                />
                            </View>
                        </View>

                        {/* อีเมล */}
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

                        {/* รหัสผ่าน */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)</Text>
                            <View style={[styles.inputWrapper, isPasswordFocused && styles.inputWrapperActive]}>
                                <Ionicons name="lock-closed-outline" size={20} color={isPasswordFocused ? theme.colors.primary : "#999"} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="••••••••"
                                    placeholderTextColor="#bbb"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    editable={!loading}
                                    onFocus={() => setIsPasswordFocused(true)}
                                    onBlur={() => setIsPasswordFocused(false)}
                                />
                                <TouchableOpacity
                                    style={styles.eyeIcon}
                                    onPress={() => setShowPassword(!showPassword)}
                                >
                                    <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={22} color={theme.colors.textSecondary} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* ยืนยันรหัสผ่าน */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>ยืนยันรหัสผ่าน</Text>
                            <View style={[styles.inputWrapper, isConfirmPasswordFocused && styles.inputWrapperActive]}>
                                <Ionicons name="shield-checkmark-outline" size={20} color={isConfirmPasswordFocused ? theme.colors.primary : "#999"} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="••••••••"
                                    placeholderTextColor="#bbb"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showConfirmPassword}
                                    editable={!loading}
                                    onFocus={() => setIsConfirmPasswordFocused(true)}
                                    onBlur={() => setIsConfirmPasswordFocused(false)}
                                />
                                <TouchableOpacity
                                    style={styles.eyeIcon}
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    <Ionicons name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} size={22} color={theme.colors.textSecondary} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* ปุ่ม Register */}
                        <TouchableOpacity
                            style={[
                                styles.loginButton, 
                                (!name || !email || !password || !confirmPassword || loading) && { opacity: 0.6 },
                                { marginTop: 15 }
                            ]}
                            activeOpacity={0.8}
                            onPress={handleRegister}
                            disabled={!name || !email || !password || !confirmPassword || loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={theme.colors.white} />
                            ) : (
                                <>
                                    <Text style={styles.loginButtonText}>ลงทะเบียน</Text>
                                    <Ionicons name="checkmark-circle-outline" size={22} color={theme.colors.white} style={{ marginLeft: 10 }} />
                                </>
                            )}
                        </TouchableOpacity>

                        {/* มีบัญชีอยู่แล้ว */}
                        <View style={[styles.registerContainer]}>
                            <Text style={styles.noAccountText}>มีบัญชีอยู่แล้ว?</Text>
                            <TouchableOpacity onPress={() => navigation.goBack()}>
                                <Text style={styles.registerText}>เข้าสู่ระบบที่นี่</Text>
                            </TouchableOpacity>
                        </View>

                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default RegisterScreen;
