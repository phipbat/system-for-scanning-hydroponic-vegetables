// ไฟล์สำหรับหน้า HistoryScreen (หน้าแสดงประวัติการวิเคราะห์โรคพืช)
import React, { useState, useCallback } from 'react';
import {
    View, StyleSheet, TouchableOpacity,
    FlatList, Image, Alert, Platform, StatusBar
} from 'react-native';
import Text from '../components/CustomText';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ActionBar from '../components/ActionBar';
import { styles } from '../styles/historyStyles';
import { verticalScale } from '../utils/responsive';
import { apiDeleteAnalysis, apiCheckDeletedRecords } from '../services/api';

const STORAGE_KEY = '@analysis_history';

export interface AnalysisRecord {
    id: string;
    date: string;
    imageBase64: string;
    result: string;
    serverId?: number | null;
    measurements?: {
        ph?: number;
        ec?: number;
        height?: string | number;
        canopy?: string | number;
        leaf_width?: string | number;
        leaf_count?: string | number;
        weight?: string | number;
    };
}

// ฟังก์ชันสำหรับบันทึกผลวิเคราะห์ (เรียกจาก ScannerScreen)
export const saveAnalysisToHistory = async (
    imageBase64: string, 
    result: string, 
    serverId: number | null = null,
    measurements?: AnalysisRecord['measurements']
) => {
    try {
        const existing = await AsyncStorage.getItem(STORAGE_KEY);
        const history: AnalysisRecord[] = existing ? JSON.parse(existing) : [];

        const newRecord: AnalysisRecord = {
            id: Date.now().toString(),
            date: new Date().toLocaleString('th-TH', {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            }),
            imageBase64,
            result,
            serverId,
            measurements
        };

        history.unshift(newRecord); // เพิ่มล่าสุดไว้บนสุด

        // เก็บสูงสุด 50 รายการ
        if (history.length > 50) history.pop();

        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
        console.error('เกิดข้อผิดพลาดในการบันทึกประวัติ:', e);
    }
};

const HistoryScreen: React.FC = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const [history, setHistory] = useState<AnalysisRecord[]>([]);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // โหลดข้อมูลทุกครั้งที่เข้าหน้านี้
    useFocusEffect(
        useCallback(() => {
            loadHistory();
        }, [])
    );

    const loadHistory = async () => {
        try {
            const data = await AsyncStorage.getItem(STORAGE_KEY);
            if (data) {
                let localHistory: AnalysisRecord[] = JSON.parse(data);
                
                // ตรวจสอบและซิงค์ว่ามีข้อมูลไหนที่ถูกลบบน Web หรือไม่ (Two-way sync)
                const serverIds = localHistory
                    .map(h => h.serverId)
                    .filter(id => id !== null && id !== undefined) as number[];
                    
                if (serverIds.length > 0) {
                    const deletedWebIds = await apiCheckDeletedRecords(serverIds);
                    if (deletedWebIds && deletedWebIds.length > 0) {
                        // กรองประวัติที่ถูกลบไปแล้วบนเว็บออก
                        localHistory = localHistory.filter(h => 
                            h.serverId === null || 
                            h.serverId === undefined || 
                            !deletedWebIds.includes(h.serverId)
                        );
                        // บันทึกทับ Storage ให้ตรงกับระบบเว็บ
                        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(localHistory));
                    }
                }
                
                setHistory(localHistory);
            } else {
                setHistory([]);
            }
        } catch (e) {
            console.error('เกิดข้อผิดพลาดในการโหลดประวัติ:', e);
        }
    };

    const deleteRecord = (id: string, serverId?: number | null) => {
        Alert.alert('ยืนยันการลบ', 'ต้องการลบรายการนี้หรือไม่?', [
            { text: 'ยกเลิก', style: 'cancel' },
            {
                text: 'ลบ', style: 'destructive', onPress: async () => {
                    const updated = history.filter(r => r.id !== id);
                    setHistory(updated);
                    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
                    
                    // ปรึกษาและลบข้อมูลจากเว็บ Backend ด้วยถ้ามีข้อมูล serverId
                    if (serverId) {
                        try {
                            await apiDeleteAnalysis(serverId);
                        } catch (e) {
                            console.error('Failed to delete on server', e);
                        }
                    }
                }
            }
        ]);
    };

    const clearAll = () => {
        Alert.alert('ลบทั้งหมด', 'ต้องการลบประวัติทั้งหมดหรือไม่?', [
            { text: 'ยกเลิก', style: 'cancel' },
            {
                text: 'ลบทั้งหมด', style: 'destructive', onPress: async () => {
                    // หากกดลบทั้งหมด เราพยายามยิงลบบนเว็บของทุกอันที่มี serverId
                    Promise.all(
                        history.filter(h => h.serverId).map(h => apiDeleteAnalysis(h.serverId as number).catch(e => e))
                    ).then(async () => {
                        setHistory([]);
                        await AsyncStorage.removeItem(STORAGE_KEY);
                    });
                }
            }
        ]);
    };

    const renderItem = ({ item }: { item: AnalysisRecord }) => {
        const isExpanded = expandedId === item.id;
        // ตัดข้อความสั้นๆ สำหรับแสดงตัวอย่าง (Preview)
        const preview = item.result.substring(0, 100) + (item.result.length > 100 ? '...' : '');

        return (
            <View style={styles.card}>
                <TouchableOpacity
                    style={styles.cardHeader}
                    onPress={() => setExpandedId(isExpanded ? null : item.id)}
                    activeOpacity={0.7}
                >
                    <Image
                        source={{ uri: `data:image/jpeg;base64,${item.imageBase64}` }}
                        style={styles.thumbnail}
                    />
                    <View style={styles.cardInfo}>
                        <Text style={styles.cardDate}>
                            <Ionicons name="time-outline" size={13} color="#888" />  {item.date}
                        </Text>
                        <Text style={styles.cardPreview} numberOfLines={2}>{preview}</Text>
                    </View>
                    <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={20} color="#999"
                    />
                </TouchableOpacity>

                {isExpanded && (
                    <View style={styles.expandedContent}>
                        <Image
                            source={{ uri: `data:image/jpeg;base64,${item.imageBase64}` }}
                            style={styles.fullImage}
                            resizeMode="contain"
                        />
                        <Text style={styles.resultText}>{item.result}</Text>

                        <View style={styles.actionRow}>
                            <TouchableOpacity
                                style={styles.chatButton}
                                onPress={() => navigation.navigate('Chat', {
                                    analysisContext: item.result,
                                    imageBase64: item.imageBase64,
                                })}
                            >
                                <Ionicons name="chatbubble-outline" size={16} color="#fff" />
                                <Text style={styles.chatButtonText}>  ถามต่อในแชท</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={() => deleteRecord(item.id, item.serverId)}
                            >
                                <Ionicons name="trash-outline" size={16} color="#E53935" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" backgroundColor="#f4f6f9" />
            <ActionBar 
                title="ประวัติการวิเคราะห์" 
                subtitle="ผลวินิจฉัยพืชทั้งหมด" 
                showBack={true} 
                rightAction={
                    history.length > 0 ? (
                        <TouchableOpacity onPress={clearAll} style={styles.clearBtnDark}>
                            <Ionicons name="trash-outline" size={22} color="#E53935" />
                        </TouchableOpacity>
                    ) : <View style={{ width: 40 }} />
                }
            />

            {history.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="folder-open-outline" size={60} color="#ccc" />
                    <Text style={styles.emptyText}>ยังไม่มีประวัติการวิเคราะห์</Text>
                    <Text style={styles.emptySubtext}>ถ่ายรูปหรืออัพโหลดรูปเพื่อวิเคราะห์โรคผัก</Text>
                </View>
            ) : (
                <FlatList
                    data={history}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + verticalScale(20) }]}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
};

export default HistoryScreen;
