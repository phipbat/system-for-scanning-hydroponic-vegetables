// ไฟล์สำหรับหน้า LoginScreen (หน้าจอเข้าสู่ระบบของแอปพลิเคชัน)
import React, { useState } from 'react';
import {
    View, TouchableOpacity, SafeAreaView, Image,
    ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import TextInput from '../../components/CustomTextInput';
import Text from '../../components/CustomText';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiLogin } from '../../services/api';
import { loginStyles as styles } from '../../styles/loginStyles';
import { theme } from '../../styles/theme';

const LoginScreen: React.FC = ({ navigation }: any) => {
    const [email, setEmail] = useState('phipbat@gmail.com');
    const [password, setPassword] = useState('zxcnmklop101');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isEmailFocused, setIsEmailFocused] = useState(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const insets = useSafeAreaInsets();

    const handleLogin = async () => {
        if (!email || !password) return;
        setLoading(true);
        try {
            await apiLogin(email, password);
            console.log('Login Success!');
            navigation.navigate('Main'); // ไปยังหน้า App หลัก
        } catch (error: any) {
            alert(error.message || 'Login Failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: '#ffffff' }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <ScrollView
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingTop: Math.max(insets.top + 20, 60), paddingBottom: Math.max(insets.bottom + 20, 50) }
                ]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >

                    {/* Logo & Header */}
                    <View style={styles.logoContainer}>
                        <View style={styles.iconCircle}>
                            <MaterialCommunityIcons name="sprout" size={64} color="#2E7D32" />
                        </View>
                        <Text style={styles.title}>PlantoEye</Text>
                        <Text style={styles.subtitle}>เข้าสู่ระบบเพื่อใช้งานระบบติดตามพืช</Text>
                    </View>

                    {/* ฟอร์มล็อคอิน */}
                    <View style={styles.formContainer}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>อีเมล</Text>
                            <View style={[styles.inputWrapper, isEmailFocused && styles.inputWrapperActive]}>
                                <Ionicons name="mail-outline" size={20} color={isEmailFocused ? "#2E7D32" : "#999"} style={styles.inputIcon} />
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

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>รหัสผ่าน</Text>
                            <View style={[styles.inputWrapper, isPasswordFocused && styles.inputWrapperActive]}>
                                <Ionicons name="lock-closed-outline" size={20} color={isPasswordFocused ? "#2E7D32" : "#999"} style={styles.inputIcon} />
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
                                    <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={22} color="#999" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* รีเซ็ตรหัสผ่าน */}
                        <TouchableOpacity
                            style={styles.forgotPassword}
                            onPress={() => navigation.navigate('ForgotPassword')}
                        >
                            <Text style={styles.forgotPasswordText}>ลืมรหัสผ่าน?</Text>
                        </TouchableOpacity>

                        {/* ปุ่ม Login */}
                        <TouchableOpacity
                            style={[styles.loginButton, (!email || !password || loading) && { opacity: 0.6 }]}
                            activeOpacity={0.8}
                            onPress={handleLogin}
                            disabled={!email || !password || loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Text style={styles.loginButtonText}>เข้าสู่ระบบ</Text>
                                    <Ionicons name="arrow-forward" size={22} color="#fff" style={{ marginLeft: 10 }} />
                                </>
                            )}
                        </TouchableOpacity>

                        {/* ลงทะเบียน */}
                        <View style={styles.registerContainer}>
                            <Text style={styles.noAccountText}>ยังไม่มีบัญชี?</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                <Text style={styles.registerText}>ลงทะเบียนที่นี่</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default LoginScreen;
