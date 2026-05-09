// ไฟล์สำหรับหน้า GrowthScreen (หน้าติดตามการเจริญเติบโตของพืช)
import React, { useState, useCallback } from 'react';
import {
    View, TouchableOpacity,
    FlatList, Image, Alert, Modal, StatusBar,
    ScrollView, ActivityIndicator, RefreshControl, Dimensions
} from 'react-native';
import TextInput from '../components/CustomTextInput';
import Text from '../components/CustomText';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import ActionBar from '../components/ActionBar';
import { styles } from '../styles/growthStyles';
import { scale, verticalScale, moderateScale } from '../utils/responsive';
import { GEMINI_API_URL } from '../services/geminiConfig';
import { theme } from '../styles/theme';
import { 
    API_BASE_URL,
    fetchPlants, fetchPlantDetail, createPlant, deletePlant, 
    apiSyncAnalysis, apiDeleteAnalysis, PlantRecord, CameraAnalysisRecord 
} from '../services/api';

const SCREEN_W = Dimensions.get('window').width;

// ---- ส่วนประกอบกราฟเส้นขนาดเล็ก (Mini Line Chart) ----
const GrowthChart = ({ label, data, color }: { label: string; data: number[]; color: string }) => {
    // กรอง null/undefined/NaN ออกก่อน (เลียนแบบออริจินัล)
    const clean = (data || []).filter(v => v != null && !isNaN(Number(v))).map(Number);
    if (clean.length < 1) return null;
    
    const chartData = clean;
    const labels = new Array(chartData.length).fill('');

    return (
        <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: moderateScale(12), fontWeight: '700', color: '#374151', marginBottom: 8, marginLeft: 4 }}>
                {label}
            </Text>
            <LineChart
                data={{ 
                    labels: labels, 
                    datasets: [{ 
                        data: chartData, 
                        color: (opacity = 1) => color, 
                        strokeWidth: chartData.length > 1 ? 2.5 : 0 
                    }] 
                }}
                width={SCREEN_W - 48}
                height={130}
                withDots={true}
                withInnerLines={false}
                withOuterLines={false}
                withHorizontalLabels={true}
                withVerticalLabels={false}
                fromZero={false}
                chartConfig={{
                    backgroundGradientFrom: '#f9fafb',
                    backgroundGradientTo: '#f9fafb',
                    decimalPlaces: 1,
                    color: (opacity = 1) => color,
                    labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
                    fillShadowGradient: color,
                    fillShadowGradientOpacity: chartData.length > 1 ? 0.12 : 0, 
                    propsForDots: { r: '5', strokeWidth: '3', stroke: '#fff' },
                }}
                bezier={chartData.length > 1}
                style={{ borderRadius: 16, marginHorizontal: 0 }}
            />
        </View>
    );
};

const GrowthScreen: React.FC = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    // สถานะข้อมูล (Data States)
    const [plants, setPlants] = useState<PlantRecord[]>([]);
    const [selectedPlant, setSelectedPlant] = useState<PlantRecord | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    // สถานะ UI (UI States)
    const [showAddPlant, setShowAddPlant] = useState(false);
    const [newPlantName, setNewPlantName] = useState('');
    const [showAddEntry, setShowAddEntry] = useState(false);
    
    // สถานะการบันทึกข้อมูล (Entry States)
    const [entryNote, setEntryNote] = useState('');
    const [entryImage, setEntryImage] = useState<{ uri: string; base64: string } | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<{
        summary: string;
        plant_height: number | null;
        canopy_width: number | null;
        leaf_width: number | null;
        leaf_count: number | null;
        fresh_weight_with_root: number | null;
        health_status: string;
        confidence: number;
    } | null>(null);

    // โหลดไฟล์เริ่มต้นและการรีเฟรชข้อมูลหน้า (Initial Load & Focus Refetch)
    useFocusEffect(
        useCallback(() => {
            loadPlants();
        }, [])
    );

    // ระบบ Polling สำหรับรายละเอียดพืช (อัปเดตทุกๆ 60 วินาที)
    // ใช้ id เป็น dep แทน object เต็ม — กัน interval reset ทุกครั้งที่ poll อัปเดตข้อมูล
    React.useEffect(() => {
        if (!selectedPlant) return;
        const snapshot = selectedPlant; // id คงที่ตลอด interval นี้
        const interval = setInterval(() => {
            handleSelectPlant(snapshot, false);
        }, 60000);
        return () => clearInterval(interval);
    }, [selectedPlant?.id]);

    const loadPlants = async () => {
        try {
            setIsRefreshing(true);
            const data = await fetchPlants();
            setPlants(data);
        } catch (e) {
            console.error('โหลดข้อมูลพืชไม่สำเร็จ:', e);
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleSelectPlant = async (plant: PlantRecord, showLoading = true) => {
        try {
            if (showLoading) setIsRefreshing(true);
            const detail = await fetchPlantDetail(plant.id);
            setSelectedPlant(detail);
        } catch (e) {
            console.error('ดึงรายละเอียดพืชไม่สำเร็จ:', e);
        } finally {
            if (showLoading) setIsRefreshing(false);
        }
    };

    const handleAddPlant = async () => {
        if (!newPlantName.trim()) return;
        try {
            setIsRefreshing(true);
            await createPlant({ name: newPlantName.trim() });
            setNewPlantName('');
            setShowAddPlant(false);
            loadPlants();
        } catch (e: any) {
            Alert.alert('ผิดพลาด', e.message);
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleDeletePlant = (id: number) => {
        Alert.alert('ยืนยัน', 'ต้องการลบแปลงนี้และข้อมูลทั้งหมดหรือไม่?', [
            { text: 'ยกเลิก', style: 'cancel' },
            {
                text: 'ลบ', style: 'destructive', onPress: async () => {
                    try {
                        await deletePlant(id);
                        if (selectedPlant?.id === id) setSelectedPlant(null);
                        loadPlants();
                    } catch (e: any) {
                        Alert.alert('ผิดพลาด', e.message);
                    }
                }
            }
        ]);
    };

    // ฟังก์ชันถ่ายรูป / เลือกรูป — วิเคราะห์อัตโนมัติหลังจากเลือกแล้ว
    const takePhoto = async () => {
        const result = await ImagePicker.launchCameraAsync({ quality: 0.5, base64: true });
        if (!result.canceled && result.assets[0]?.base64) {
            const img = { uri: result.assets[0].uri, base64: result.assets[0].base64 };
            setEntryImage(img);
            setAnalysisResult(null);
            runAnalysis(img.base64);
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.5, base64: true });
        if (!result.canceled && result.assets[0]?.base64) {
            const img = { uri: result.assets[0].uri, base64: result.assets[0].base64 };
            setEntryImage(img);
            setAnalysisResult(null);
            runAnalysis(img.base64);
        }
    };

    // รันการวิเคราะห์ด้วย AI และดึงค่าการวัดผลต่างๆออกมา
    const runAnalysis = async (base64: string) => {
        setIsAnalyzing(true);
        try {
            const prompt = `วิเคราะห์ภาพผักไฮโดรโปนิกส์ ประเมินค่าเติบโตจากภาพ ตอบกลับในรูปแบบ JSON เดียว:
{
  "summary": "(สรุปสุขภาพและคำแนะนำ 2-3 ประโยค ภาษาไทย)",
  "plant_height": (ความสูง ซม. เลขทศนิยม หรือ null),
  "canopy_width": (ความกว้างพุ่ม ซม. หรือ null),
  "leaf_width": (ความกว้างใบ ซม. หรือ null),
  "leaf_count": (จำนวนใบ เลขเต็ม หรือ null),
  "fresh_weight": (น้ำหนักสด กรัม หรือ null),
  "health_status": "Healthy"|"Warning"|"Danger",
  "confidence": (0-100)
}
ตอบเป็น JSON สะอาดเท่านั้น`;

            const response = await fetch(GEMINI_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [
                        { text: prompt },
                        { inlineData: { mimeType: 'image/jpeg', data: base64 } }
                    ]}]
                })
            });
            const raw = await response.json();
            const text = raw.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            let parsed: any = {};
            if (jsonMatch) {
                try { parsed = JSON.parse(jsonMatch[0]); } catch {}
            }
            // ดึงค่าเดิมมาเตรียมไว้ (Fallback Values)
            const prev = selectedPlant?.latest_analysis || selectedPlant?.latestAnalysis;

            setAnalysisResult({
                summary: parsed.summary || 'วิเคราะห์เสร็จแล้ว',
                plant_height: (parsed.plant_height ?? prev?.plant_height) ?? null,
                canopy_width: (parsed.canopy_width ?? prev?.canopy_width) ?? null,
                leaf_width: (parsed.leaf_width ?? prev?.leaf_width) ?? null,
                leaf_count: (parsed.leaf_count ?? prev?.leaf_count) ?? null,
                fresh_weight_with_root: (parsed.fresh_weight ?? prev?.fresh_weight_with_root) ?? null,
                health_status: parsed.health_status || 'Healthy',
                confidence: parsed.confidence || 80,
            });
        } catch (e) {
            Alert.alert('ผิดพลาด', 'ไม่สามารถวิเคราะห์ได้');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const addEntry = async () => {
        if (!entryImage || !selectedPlant || !analysisResult) return;
        setIsAnalyzing(true);
        try {
            await apiSyncAnalysis({
                plant_id: selectedPlant.id,
                plant_name: selectedPlant.name,
                image_base64: entryImage.base64,
                diagnosis_summary: analysisResult.summary,
                plant_height: analysisResult.plant_height as any,
                canopy_width: analysisResult.canopy_width as any,
                leaf_width: analysisResult.leaf_width as any,
                leaf_count: analysisResult.leaf_count as any,
                fresh_weight_with_root: analysisResult.fresh_weight_with_root as any,
                health_status: analysisResult.health_status,
                confidence: analysisResult.confidence,
                source: 'Manual Tracking'
            });
            handleSelectPlant(selectedPlant);
            setEntryImage(null);
            setEntryNote('');
            setAnalysisResult(null);
            setShowAddEntry(false);
            Alert.alert('สำเร็จ', 'บันทึกข้อมูลเรียบร้อยแล้ว');
        } catch (e: any) {
            Alert.alert('ผิดพลาด', e.message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleDeleteEntry = (id: number) => {
        Alert.alert('ลบบันทึก', 'คุณต้องการลบบันทึกการเติบโตนี้ใช่หรือไม่?', [
            { text: 'ยกเลิก', style: 'cancel' },
            { 
                text: 'ลบ', style: 'destructive',
                onPress: async () => {
                    try {
                        await apiDeleteAnalysis(id);
                        if (selectedPlant) handleSelectPlant(selectedPlant);
                    } catch (error: any) {
                        Alert.alert('ผิดพลาด', error.message);
                    }
                }
            }
        ]);
    };

    if (!selectedPlant) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
                <ActionBar 
                    title="ติดตามการเติบโต" 
                    subtitle="ภาพรวมการปลูก" 
                    showBack={true} 
                    rightAction={
                        <TouchableOpacity onPress={() => setShowAddPlant(true)} style={styles.addBtnDark}>
                            <Ionicons name="add" size={24} color={theme.colors.primary} />
                        </TouchableOpacity>
                    }
                />

                {plants.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="sprout-outline" size={60} color={theme.colors.textSecondary} />
                        <Text style={styles.emptyText}>ยังไม่มีรายการแปลงผัก</Text>
                        <Text style={styles.emptySubtext}>กดปุ่ม + เพื่อเพิ่มแปลงใหม่</Text>
                    </View>
                ) : (
                    <FlatList
                        data={plants}
                        keyExtractor={item => item.id.toString()}
                        contentContainerStyle={{ padding: scale(16), paddingBottom: insets.bottom + scale(20) }}
                        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={loadPlants} />}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.plantCard}
                                onPress={() => handleSelectPlant(item)}
                                activeOpacity={0.8}
                            >
                                <View style={styles.plantIcon}>
                                    {item.latest_analysis?.image_path ? (
                                        <Image
                                            source={{ uri: `${API_BASE_URL}/storage/${item.latest_analysis.image_path}` }}
                                            style={styles.plantThumb}
                                        />
                                    ) : (
                                        <MaterialCommunityIcons name="sprout" size={28} color="#2E7D32" />
                                    )}
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.plantName}>{item.name}</Text>
                                    <Text style={styles.plantMeta}>
                                        {item.analyses_count || 0} บันทึกการเติบโต
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={() => handleDeletePlant(item.id)} style={{ padding: 8 }}>
                                    <Ionicons name="trash-outline" size={18} color="#E53935" />
                                </TouchableOpacity>
                                <Ionicons name="chevron-forward" size={20} color="#bbb" />
                            </TouchableOpacity>
                        )}
                    />
                )}

                {/* Modal เพิ่มแปลงใหม่ */}
                <Modal visible={showAddPlant} transparent animationType="fade">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalBox}>
                            <Text style={styles.modalTitle}>เพิ่มแปลงผัก / ต้นไม้</Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="เช่น แปลงคะน้า, ต้นพริก #1..."
                                value={newPlantName}
                                onChangeText={setNewPlantName}
                                autoFocus
                            />
                            <View style={styles.modalActions}>
                                <TouchableOpacity style={styles.modalCancel} onPress={() => { setShowAddPlant(false); setNewPlantName(''); }}>
                                    <Text style={{ color: '#666', fontWeight: '600' }}>ยกเลิก</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.modalConfirm} onPress={handleAddPlant}>
                                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>สร้าง</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        );
    }

    // --- VIEW 2: Plant Detail / Timeline View ---
    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" backgroundColor="#f4f6f9" />
            <ActionBar 
                title={selectedPlant.name} 
                subtitle="รายละเอียดแปลงผัก" 
                showBack={true} 
                onBack={() => setSelectedPlant(null)}
                rightAction={
                    <TouchableOpacity onPress={() => setShowAddEntry(true)} style={styles.addBtnDark}>
                        <Ionicons name="camera-outline" size={22} color="#1a1a2e" />
                    </TouchableOpacity>
                }
            />

            {selectedPlant.analyses?.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="camera-outline" size={60} color={theme.colors.textSecondary} />
                    <Text style={styles.emptyText}>ยังไม่มีบันทึกการเจริญเติบโต</Text>
                    <Text style={styles.emptySubtext}>กดปุ่มกล้องเพื่อบันทึกครั้งแรก</Text>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={{ padding: scale(16), paddingBottom: insets.bottom + scale(20) }}
                    refreshControl={
                        <RefreshControl 
                            refreshing={isRefreshing} 
                            onRefresh={() => handleSelectPlant(selectedPlant, true)} 
                            tintColor={theme.colors.primary}
                        />
                    }
                >

                    {/* ---- Latest Stats Row (Stat Boxes) ---- */}
                    {(() => {
                        const latest = selectedPlant.analyses?.[0];
                        if (!latest) return null;
                        const statItems = [
                            { label: 'ความสูง', val: latest.plant_height, unit: 'ชม.' },
                            { label: 'พุ่มใบ',   val: latest.canopy_width, unit: 'ชม.' },
                            { label: 'กว้างใบ',  val: latest.leaf_width,   unit: 'ชม.' },
                            { label: 'จำนวนใบ', val: latest.leaf_count,   unit: 'ใบ'  },
                            { label: 'น้ำหนัก', val: latest.fresh_weight_with_root, unit: 'ก.' },
                        ];
                        return (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}
                                style={{ marginBottom: 20 }} contentContainerStyle={{ gap: 10 }}>
                                {statItems.map((s, i) => (
                                    <View key={i} style={{
                                        backgroundColor: '#f0fdf4', 
                                        borderRadius: 12,
                                        width: scale(72),
                                        height: verticalScale(74),
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderWidth: 1, 
                                        borderColor: '#dcfce7'
                                    }}>
                                        <Text style={{ fontSize: moderateScale(16), fontWeight: '900', color: '#166534' }}>
                                            {s.val != null ? Number(s.val).toFixed(1) : '—'}
                                        </Text>
                                        <Text style={{ fontSize: moderateScale(8), color: '#16a34a', fontWeight: '800' }}>{s.unit}</Text>
                                        <Text style={{ fontSize: moderateScale(8), color: '#4b5563', marginTop: 4, fontWeight: '600' }}>{s.label}</Text>
                                    </View>
                                ))}
                            </ScrollView>
                        );
                    })()}

                    {/* ---- Charts Section (Area Charts) ---- */}
                    {selectedPlant.analyses && selectedPlant.analyses.length >= 1 && (() => {
                        const sorted = [...selectedPlant.analyses].reverse(); // เก่า→ใหม่
                        return (
                            <View style={{
                                backgroundColor: '#fff', borderRadius: 20,
                                padding: 16, marginBottom: 20,
                                shadowColor: '#000', shadowOpacity: 0.05,
                                shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
                                elevation: 2,
                            }}>
                                <Text style={{ fontSize: 13, fontWeight: '800', color: '#1f2937', marginBottom: 16 }}>
                                    กราฟการเจริญเติบโต (บันทึกล่าสุด)
                                </Text>
                                <GrowthChart
                                    label="ความสูงต้น (ซม.)"
                                    data={sorted.map(a => a.plant_height as number)}
                                    color="#166534"
                                />
                                <GrowthChart
                                    label="ความกว้างพุ่ม (ซม.)"
                                    data={sorted.map(a => a.canopy_width as number)}
                                    color="#15803d"
                                />
                                <GrowthChart
                                    label="ความกว้างใบ (ซม.)"
                                    data={sorted.map(a => a.leaf_width as number)}
                                    color="#16a34a"
                                />
                                <GrowthChart
                                    label="จำนวนใบ (ใบ)"
                                    data={sorted.map(a => a.leaf_count as number)}
                                    color="#22c55e"
                                />
                                <GrowthChart
                                    label="น้ำหนักสดรวมราก (ก.)"
                                    data={sorted.map(a => a.fresh_weight_with_root as number)}
                                    color="#d97706"
                                />
                            </View>
                        );
                    })()}

                    {/* ---- Data Table ---- */}
                    {selectedPlant.analyses && selectedPlant.analyses.length >= 1 && (
                        <View style={{ marginBottom: 24, backgroundColor: '#fff', borderRadius: 20, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 }}>
                            <Text style={{ fontSize: 13, fontWeight: '800', color: '#1f2937', marginBottom: 12 }}>
                                ตารางข้อมูลการเติบโต
                            </Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <View>
                                    {/* Table Header */}
                                    <View style={{ flexDirection: 'row', backgroundColor: '#f0fdf4', paddingVertical: 10, borderRadius: 8, marginBottom: 4 }}>
                                        <Text style={{ width: 110, textAlign: 'center', fontSize: 11, fontWeight: '800', color: '#166534' }}>วันที่ / เวลา</Text>
                                        <Text style={{ width: 65, textAlign: 'center', fontSize: 11, fontWeight: '800', color: '#166534' }}>สูง(ซม.)</Text>
                                        <Text style={{ width: 65, textAlign: 'center', fontSize: 11, fontWeight: '800', color: '#166534' }}>พุ่ม(ซม.)</Text>
                                        <Text style={{ width: 65, textAlign: 'center', fontSize: 11, fontWeight: '800', color: '#166534' }}>ใบ(ซม.)</Text>
                                        <Text style={{ width: 65, textAlign: 'center', fontSize: 11, fontWeight: '800', color: '#166534' }}>จำนวนใบ</Text>
                                        <Text style={{ width: 65, textAlign: 'center', fontSize: 11, fontWeight: '800', color: '#166534' }}>น้ำหนัก(ก.)</Text>
                                    </View>
                                    {/* Table Rows */}
                                    {selectedPlant.analyses.map((item, index) => (
                                        <View key={item.id.toString()} style={{ flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', backgroundColor: index % 2 === 0 ? '#fff' : '#fafafa' }}>
                                            <Text style={{ width: 110, textAlign: 'center', fontSize: 10, color: '#475569', fontWeight: '600' }}>
                                                {new Date(item.timestamp).toLocaleString('th-TH', {day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit'})}
                                            </Text>
                                            <Text style={{ width: 65, textAlign: 'center', fontSize: 11, color: '#166534', fontWeight: '700' }}>{item.plant_height != null ? Number(item.plant_height).toFixed(1) : '-'}</Text>
                                            <Text style={{ width: 65, textAlign: 'center', fontSize: 11, color: '#15803d', fontWeight: '700' }}>{item.canopy_width != null ? Number(item.canopy_width).toFixed(1) : '-'}</Text>
                                            <Text style={{ width: 65, textAlign: 'center', fontSize: 11, color: '#16a34a', fontWeight: '700' }}>{item.leaf_width != null ? Number(item.leaf_width).toFixed(1) : '-'}</Text>
                                            <Text style={{ width: 65, textAlign: 'center', fontSize: 11, color: '#22c55e', fontWeight: '700' }}>{item.leaf_count != null ? item.leaf_count : '-'}</Text>
                                            <Text style={{ width: 65, textAlign: 'center', fontSize: 11, color: '#d97706', fontWeight: '700' }}>{item.fresh_weight_with_root != null ? Number(item.fresh_weight_with_root).toFixed(1) : '-'}</Text>
                                        </View>
                                    ))}
                                </View>
                            </ScrollView>
                        </View>
                    )}

                    {/* ---- Timeline ---- */}
                    <Text style={{ fontSize: 12, fontWeight: '800', color: '#6b7280', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        ประวัติบันทึก
                    </Text>
                    {selectedPlant.analyses?.map((item, index) => (
                        <View key={item.id.toString()} style={styles.timelineItem}>
                            <View style={styles.timelineLeft}>
                                <View style={[styles.timelineDot, index === 0 && { backgroundColor: theme.colors.primary }]} />
                                {index < (selectedPlant.analyses?.length || 0) - 1 && <View style={styles.timelineLine} />}
                            </View>
                            <View style={styles.timelineContent}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text style={styles.timelineDate}>
                                        <Ionicons name="time-outline" size={12} color={theme.colors.textSecondary} />  {new Date(item.timestamp).toLocaleString('th-TH')}
                                    </Text>
                                    <TouchableOpacity onPress={() => handleDeleteEntry(item.id)} style={{ padding: 4 }}>
                                        <Ionicons name="trash-outline" size={14} color="#E53935" />
                                    </TouchableOpacity>
                                </View>
                                {/* Metric chips */}
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
                                    {item.plant_height != null && (
                                        <View style={{ backgroundColor: '#f0fdf4', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                                            <Text style={{ fontSize: 10, color: '#166534', fontWeight: '700' }}>สูง {Number(item.plant_height).toFixed(1)} ซม.</Text>
                                        </View>
                                    )}
                                    {item.canopy_width != null && (
                                        <View style={{ backgroundColor: '#f0fdf4', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                                            <Text style={{ fontSize: 10, color: '#166534', fontWeight: '700' }}>พุ่ม {Number(item.canopy_width).toFixed(1)} ซม.</Text>
                                        </View>
                                    )}
                                    {item.leaf_count != null && (
                                        <View style={{ backgroundColor: '#f0fdf4', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                                            <Text style={{ fontSize: 10, color: '#166534', fontWeight: '700' }}>{item.leaf_count} ใบ</Text>
                                        </View>
                                    )}
                                    {item.fresh_weight_with_root != null && (
                                        <View style={{ backgroundColor: '#fefce8', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                                            <Text style={{ fontSize: 10, color: '#92400e', fontWeight: '700' }}>{Number(item.fresh_weight_with_root).toFixed(1)} ก.</Text>
                                        </View>
                                    )}
                                </View>
                                {item.image_path && (
                                    <Image
                                        source={{ uri: `${API_BASE_URL}/storage/${item.image_path}` }}
                                        style={styles.timelineImage}
                                        resizeMode="cover"
                                    />
                                )}
                                {item.diagnosis_summary && (
                                    <View style={styles.aiBox}>
                                        <Text style={styles.aiBoxTitle}>
                                            <MaterialCommunityIcons name="robot" size={14} color={theme.colors.primary} /> AI วิเคราะห์:
                                        </Text>
                                        <Text style={styles.aiBoxText}>{item.diagnosis_summary}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    ))}
                </ScrollView>
            )}

            {/* Modal บันทึกการเจริญเติบโต */}
            <Modal visible={showAddEntry} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalBox, { maxHeight: '92%', paddingBottom: 8 }]}>
                        <ScrollView showsVerticalScrollIndicator={false}>

                            {/* Header */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                                <Text style={styles.modalTitle}>บันทึกการเติบโต</Text>
                                <TouchableOpacity onPress={() => { setShowAddEntry(false); setEntryImage(null); setAnalysisResult(null); }}>
                                    <Ionicons name="close-circle" size={24} color="#9ca3af" />
                                </TouchableOpacity>
                            </View>

                            {/* Step 1: Image picker */}
                            {!entryImage ? (
                                <View style={styles.imagePickerRow}>
                                    <TouchableOpacity style={styles.imgPickBtn} onPress={takePhoto}>
                                        <Ionicons name="camera-outline" size={28} color={theme.colors.primary} />
                                        <Text style={styles.imgPickText}>ถ่ายรูป</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.imgPickBtn} onPress={pickImage}>
                                        <Ionicons name="image-outline" size={28} color={theme.colors.primary} />
                                        <Text style={styles.imgPickText}>อัพโหลด</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View>
                                    {/* Preview image */}
                                    <Image source={{ uri: entryImage.uri }} style={[styles.previewImage, { borderRadius: 14 }]} resizeMode="cover" />
                                    <TouchableOpacity style={styles.changeImgBtn}
                                        onPress={() => { setEntryImage(null); setAnalysisResult(null); }}>
                                        <Text style={{ color: theme.colors.primary, fontSize: 13 }}>เปลี่ยนรูป</Text>
                                    </TouchableOpacity>

                                    {/* Step 2: Analyzing spinner */}
                                    {isAnalyzing && (
                                        <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                                            <ActivityIndicator size="large" color={theme.colors.primary} />
                                            <Text style={{ color: theme.colors.primary, fontWeight: '700', marginTop: 10, fontSize: 14 }}>
                                                AI กำลังวิเคราะห์ภาพ...
                                            </Text>
                                        </View>
                                    )}

                                    {/* Step 3: Analysis result with bar charts */}
                                    {!isAnalyzing && analysisResult && (() => {
                                        const metrics = [
                                            { label: 'ความสูง', val: analysisResult.plant_height, unit: 'ซม.', max: 60, color: '#166534' },
                                            { label: 'วงพุ่ม',  val: analysisResult.canopy_width, unit: 'ซม.', max: 40, color: '#15803d' },
                                            { label: 'กว้างใบ', val: analysisResult.leaf_width,   unit: 'ซม.', max: 20, color: '#16a34a' },
                                            { label: 'จำนวนใบ', val: analysisResult.leaf_count,   unit: 'ใบ',  max: 40, color: '#22c55e' },
                                            { label: 'น้ำหนัก',  val: analysisResult.fresh_weight_with_root, unit: 'ก.', max: 200, color: '#d97706' },
                                        ];
                                        const statusColor = analysisResult.health_status === 'Healthy' ? '#16a34a'
                                            : analysisResult.health_status === 'Warning' ? '#d97706' : '#dc2626';
                                        return (
                                            <View style={{ marginTop: 4 }}>
                                                {/* Health badge */}
                                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                                                    <Text style={{ fontSize: 13, fontWeight: '800', color: '#1f2937' }}>ผลวิเคราะห์ AI</Text>
                                                    <View style={{ backgroundColor: statusColor + '20', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1, borderColor: statusColor }}>
                                                        <Text style={{ fontSize: 11, fontWeight: '800', color: statusColor }}>
                                                            {analysisResult.health_status === 'Healthy' ? 'สุขภาพดี'
                                                            : analysisResult.health_status === 'Warning' ? 'เอาใจใส่' : 'ไม่สามารถ'}
                                                            {'  '}{analysisResult.confidence}%
                                                        </Text>
                                                    </View>
                                                </View>

                                                {/* Bar Charts */}
                                                {metrics.map((m, i) => (
                                                    <View key={i} style={{ marginBottom: 10 }}>
                                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                                                            <Text style={{ fontSize: 11, color: '#374151', fontWeight: '700' }}>{m.label}</Text>
                                                            <Text style={{ fontSize: 11, color: m.color, fontWeight: '800' }}>
                                                                {m.val != null ? Number(m.val).toFixed(m.label === 'จำนวนใบ' ? 0 : 1) + ' ' + m.unit : '—'}
                                                            </Text>
                                                        </View>
                                                        <View style={{ height: 8, backgroundColor: '#f3f4f6', borderRadius: 8, overflow: 'hidden' }}>
                                                            <View style={{
                                                                height: 8,
                                                                width: m.val != null ? `${Math.min(100, (Number(m.val) / m.max) * 100)}%` : '0%',
                                                                backgroundColor: m.color,
                                                                borderRadius: 8,
                                                            }} />
                                                        </View>
                                                    </View>
                                                ))}

                                                {/* AI Summary */}
                                                <View style={{ backgroundColor: '#f0fdf4', borderRadius: 12, padding: 12, marginTop: 8, borderWidth: 1, borderColor: '#bbf7d0' }}>
                                                    <Text style={{ fontSize: 10, fontWeight: '800', color: '#166534', marginBottom: 4 }}>คำวิเคราะห์</Text>
                                                    <Text style={{ fontSize: 12, color: '#374151', lineHeight: 18 }}>{analysisResult.summary}</Text>
                                                </View>
                                            </View>
                                        );
                                    })()}
                                </View>
                            )}

                            {/* Actions */}
                            <View style={[styles.modalActions, { marginTop: 16 }]}>
                                <TouchableOpacity style={styles.modalCancel}
                                    onPress={() => { setShowAddEntry(false); setEntryImage(null); setAnalysisResult(null); setEntryNote(''); }}>
                                    <Text style={{ color: theme.colors.textSecondary, fontWeight: '600' }}>ยกเลิก</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalConfirm,
                                        (!entryImage || isAnalyzing || !analysisResult) && { opacity: 0.35 }]}
                                    onPress={addEntry}
                                    disabled={!entryImage || isAnalyzing || !analysisResult}>
                                    {isAnalyzing ? (
                                        <ActivityIndicator size="small" color={theme.colors.white} />
                                    ) : (
                                        <Text style={{ color: theme.colors.white, fontWeight: 'bold' }}>
                                            {analysisResult ? 'บันทึกข้อมูล' : 'AI กำลังวิเคราะห์...'}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            </View>

                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default GrowthScreen;
