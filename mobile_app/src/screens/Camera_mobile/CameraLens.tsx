// ไฟล์สำหรับหน้า CameraLens (หน้าเลือกโหมดถ่ายภาพ 1 ภาพ หรือ 4 มุมมอง เพื่อส่งวิเคราะห์ AI)
import React, { useState } from 'react';
import { View, TouchableOpacity, StatusBar, ActivityIndicator, ScrollView, Image, Alert } from 'react-native';
import Text from '../../components/CustomText';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import ActionBar from '../../components/ActionBar';
import { styles } from '../../styles/cameraLensStyles';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../../styles/theme';
import { scale, verticalScale } from '../../utils/responsive';

const CameraLens: React.FC = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const [status, requestPermission] = ImagePicker.useCameraPermissions();
    const [isProcessing, setIsProcessing] = useState(false);
    const [mode, setMode] = useState<'single' | 'multi'>('single');
    const [multiImages, setMultiImages] = useState<any[]>([null, null, null, null]);
    const labels = ['ด้านบน', 'ด้านซ้าย', 'ด้านขวา', 'ด้านหน้า'];

    const takePicture = async () => {
        try {
            if (!status?.granted) {
                const result = await requestPermission();
                if (!result.granted) {
                    Alert.alert('ขออนุญาต', 'กรุณาอนุญาตให้เข้าถึงกล้องถ่ายรูป');
                    return;
                }
            }
            setIsProcessing(true);
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                quality: 0.8,
                base64: true,
            });
            if (!result.canceled && result.assets?.[0]?.base64) {
                const photo = result.assets[0];
                navigation.replace('CameraAnalyze', {
                    initialImage: { uri: photo.uri, base64: photo.base64 }
                });
            }
        } catch (error: any) {
            console.error('Camera Error: ', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePickImage = async () => {
        try {
            setIsProcessing(true);
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                quality: 0.8,
                base64: true,
            });
            if (!result.canceled && result.assets?.[0]?.base64) {
                const photo = result.assets[0];
                navigation.replace('CameraAnalyze', {
                    initialImage: { uri: photo.uri, base64: photo.base64 }
                });
            }
        } catch (error: any) {
            console.error('Pick Image Error: ', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const captureForSlot = async (index: number) => {
        if (isProcessing) return;
        try {
            if (!status?.granted) {
                const result = await requestPermission();
                if (!result.granted) {
                    Alert.alert('ขออนุญาต', 'กรุณาอนุญาตให้เข้าถึงกล้องถ่ายรูป');
                    return;
                }
            }
            setIsProcessing(true);
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                quality: 0.8,
                base64: true,
            });
            if (!result.canceled && result.assets?.[0]?.base64) {
                const asset = result.assets[0];
                const newImages = [...multiImages];
                newImages[index] = { uri: asset.uri, base64: asset.base64 };
                setMultiImages(newImages);
            }
        } catch (error: any) {
            Alert.alert('ผิดพลาด', 'ไม่สามารถเปิดกล้องได้');
        } finally {
            setIsProcessing(false);
        }
    };

    const removeSlot = (index: number) => {
        const newImages = [...multiImages];
        newImages[index] = null;
        setMultiImages(newImages);
    };

    const analyzeMulti = () => {
        const validImages = multiImages.filter(img => img !== null);
        if (validImages.length === 0) {
            Alert.alert('แจ้งเตือน', 'กรุณาถ่ายภาพอย่างน้อย 1 มุมก่อนวิเคราะห์');
            return;
        }
        navigation.replace('CameraAnalyze', { initialImages: validImages });
    };

    return (
        <View style={[styles.portalContainer, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
            <ActionBar
                title="AI Scanner"
                subtitle="เลือกโหมดการวิเคราะห์"
                showBack={true}
                onBack={() => navigation.goBack()}
            />

            <ScrollView
                style={{ flex: 1, width: '100%' }}
                contentContainerStyle={{
                    flexGrow: 1,
                    paddingHorizontal: scale(25),
                    paddingTop: verticalScale(16),
                    paddingBottom: insets.bottom + scale(20),
                }}
                showsVerticalScrollIndicator={false}
            >
                {/* Mode Segmented Control */}
                <View style={styles.modeToggleRow}>
                    <TouchableOpacity
                        style={[styles.modeTab, mode === 'single' && styles.activeModeTab]}
                        onPress={() => setMode('single')}
                    >
                        <Ionicons name="flash" size={18} color={mode === 'single' ? '#fff' : '#888'} />
                        <Text style={[styles.modeTabText, mode === 'single' && styles.activeModeTabText]}>แบบ 1 ภาพ</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.modeTab, mode === 'multi' && styles.activeModeTab]}
                        onPress={() => setMode('multi')}
                    >
                        <Ionicons name="grid" size={18} color={mode === 'multi' ? '#fff' : '#888'} />
                        <Text style={[styles.modeTabText, mode === 'multi' && styles.activeModeTabText]}>แบบ 4 หน้า</Text>
                    </TouchableOpacity>
                </View>

                {mode === 'single' ? (
                    <View>
                        {/* Welcome Section */}
                        <View style={styles.welcomeBox}>
                            <View style={styles.aiIconBox}>
                                <LinearGradient
                                    colors={[theme.colors.primaryLight, theme.colors.white]}
                                    style={{ ...StyleSheet_absoluteFillObject }}
                                />
                                <MaterialCommunityIcons name="robot-outline" size={44} color={theme.colors.primary} />
                            </View>
                            <Text style={styles.welcomeTitle}>เริ่มต้นวิเคราะห์พืช</Text>
                            <Text style={styles.welcomeDesc}>ถ่ายภาพหรืออัปโหลดเพื่อรับบทสรุปการวินิจฉัยพืชและแนวทางการรักษาแบบรวดเร็ว</Text>
                        </View>

                        {/* Action Cards */}
                        <TouchableOpacity
                            style={styles.portalCard}
                            onPress={takePicture}
                            disabled={isProcessing}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={[theme.colors.primary, theme.colors.primaryDark]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.cardIconBox}
                            >
                                <Ionicons name="camera" size={28} color="#fff" />
                            </LinearGradient>
                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle}>ถ่ายภาพด้วยกล้อง</Text>
                                <Text style={styles.cardDesc}>จับภาพสดจากแปลงผักของคุณ</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#E0E0E0" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.portalCard, { marginTop: verticalScale(15) }]}
                            onPress={handlePickImage}
                            disabled={isProcessing}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.cardIconBox, { backgroundColor: theme.colors.primaryLight }]}>
                                <Ionicons name="image" size={28} color={theme.colors.primary} />
                            </View>
                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle}>อัปโหลดรูปภาพ</Text>
                                <Text style={styles.cardDesc}>เลือกรูปจากคลังภาพในเครื่อง</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#E0E0E0" />
                        </TouchableOpacity>

                        <View style={styles.tipBox}>
                            <Ionicons name="bulb-outline" size={16} color={theme.colors.primary} />
                            <Text style={styles.tipText}>Tip: เพื่อความแม่นยำสูงสุด ควรครอปภาพให้เห็นเฉพาะใบหรือลำต้นที่ต้องการวิเคราะห์</Text>
                        </View>
                    </View>
                ) : (
                    <View style={{ width: '100%', alignItems: 'center' }}>
                        <Text style={[styles.welcomeTitle, { marginBottom: verticalScale(5) }]}>เพิ่มภาพรวมพืช 4 มุมมอง</Text>
                        <Text style={[styles.welcomeDesc, { marginBottom: verticalScale(20) }]}>
                            เพื่อให้ AI สามารถคำนวณขนาด โครงสร้าง และประเมินสุขภาพโดยรวมได้อย่างแม่นยำที่สุด
                        </Text>

                        <View style={styles.gridContainer}>
                            {multiImages.map((img, idx) => (
                                <TouchableOpacity
                                    key={idx}
                                    style={[styles.gridItem, img && styles.gridItemFilled]}
                                    onPress={() => img ? undefined : captureForSlot(idx)}
                                    activeOpacity={img ? 1 : 0.8}
                                >
                                    {img ? (
                                        <>
                                            <Image source={{ uri: img.uri }} style={styles.gridImage} />
                                            <TouchableOpacity style={styles.gridDeleteBtn} onPress={() => removeSlot(idx)}>
                                                <Ionicons name="close" size={16} color="#fff" />
                                            </TouchableOpacity>
                                        </>
                                    ) : (
                                        <Ionicons name="camera-outline" size={32} color={theme.colors.primary} />
                                    )}
                                    <View style={styles.gridLabelContainer}>
                                        <Text style={styles.gridLabel}>{labels[idx]}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={{ width: '100%', marginTop: verticalScale(15) }}>
                            <TouchableOpacity
                                style={[
                                    styles.introPrimaryButton,
                                    multiImages.filter(i => i !== null).length === 0 && { opacity: 0.5 }
                                ]}
                                onPress={analyzeMulti}
                                disabled={multiImages.filter(i => i !== null).length === 0}
                            >
                                <MaterialCommunityIcons name="robot-outline" size={24} color="#fff" style={{ marginRight: scale(8) }} />
                                <Text style={styles.introPrimaryButtonText}>ให้ AI เริ่มวิเคราะห์ภาพกลุ่ม</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </ScrollView>

            {isProcessing && (
                <View style={styles.processingOverlay}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={styles.processingText}>กำลังเรียกใช้งานระบบ...</Text>
                </View>
            )}
        </View>
    );
};

// ใช้สำหรับ LinearGradient absoluteFill
const StyleSheet_absoluteFillObject = {
    position: 'absolute' as const,
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: scale(40),
};

export default CameraLens;
