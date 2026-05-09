// ไฟล์สำหรับหน้า ChatScreen (หน้าแชทบอท AI สำหรับสอบถามข้อมูลเกษตร)
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    View, TouchableOpacity,
    FlatList, KeyboardAvoidingView, Platform,
    ActivityIndicator, Keyboard, StatusBar, Image, Alert, TextStyle
} from 'react-native';
import TextInput from '../components/CustomTextInput';
import Text from '../components/CustomText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import ActionBar from '../components/ActionBar';
import { styles as chatStyles } from '../styles/chatStyles';
import { GEMINI_API_URL } from '../services/geminiConfig';
import { fetchRemoteChatSessions, syncRemoteChatSession, deleteRemoteChatSession } from '../services/api';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { theme } from '../styles/theme';
import { scale, verticalScale, moderateScale } from '../utils/responsive';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    imageUri?: string;
    imageBase64?: string;
    timestamp?: number;
}

interface ChatSession {
    id: string;
    title: string;
    lastMessage: string;
    timestamp: number;
    messages: Message[];
}

const SESSIONS_KEY = '@plantoeye_v2_chat_sessions';

// --- Markdown Renderer สำหรับข้อความ AI ---
const renderInline = (text: string, baseStyle: TextStyle, key: number): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    const regex = /\*\*(.+?)\*\*/g;
    let last = 0, match, i = 0;
    while ((match = regex.exec(text)) !== null) {
        if (match.index > last) parts.push(<Text key={i++} style={baseStyle}>{text.slice(last, match.index)}</Text>);
        parts.push(<Text key={i++} style={[baseStyle, { fontWeight: 'bold' }]}>{match[1]}</Text>);
        last = match.index + match[0].length;
    }
    if (last < text.length) parts.push(<Text key={i++} style={baseStyle}>{text.slice(last)}</Text>);
    return <Text key={key}>{parts}</Text>;
};

const MarkdownText: React.FC<{ text: string }> = ({ text }) => {
    const elements: React.ReactNode[] = [];
    let k = 0;

    text.split('\n').forEach((line) => {
        const t = line.trim();
        if (!t) { elements.push(<View key={k++} style={chatStyles.markdownEmptyLine} />); return; }

        // หัวข้อ # — แสดงเป็น bold แทน
        const headerMatch = t.match(/^#{1,3}\s+(.*)/);
        if (headerMatch) {
            elements.push(<Text key={k++} style={[chatStyles.markdownBase, chatStyles.markdownHeader]}>{headerMatch[1]}</Text>);
            return;
        }
        // Bullet
        if (/^[-*•]\s/.test(t)) {
            elements.push(
                <View key={k++} style={chatStyles.markdownBulletRow}>
                    <Text style={[chatStyles.markdownBase, chatStyles.markdownBulletDot]}>•</Text>
                    <Text style={[chatStyles.markdownBase, { flex: 1 }]}>{renderInline(t.slice(2), chatStyles.markdownBase as TextStyle, k++)}</Text>
                </View>
            );
            return;
        }
        // Numbered list
        const numMatch = t.match(/^(\d+)\.\s(.*)/);
        if (numMatch) {
            elements.push(
                <View key={k++} style={chatStyles.markdownBulletRow}>
                    <Text style={[chatStyles.markdownBase, chatStyles.markdownNumberDot]}>{numMatch[1]}.</Text>
                    <Text style={[chatStyles.markdownBase, { flex: 1 }]}>{renderInline(numMatch[2], chatStyles.markdownBase as TextStyle, k++)}</Text>
                </View>
            );
            return;
        }
        // ข้อความปกติ
        elements.push(<Text key={k++} style={chatStyles.markdownBase}>{renderInline(t, chatStyles.markdownBase as TextStyle, k++)}</Text>);
    });

    return <View>{elements}</View>;
};

const ChatScreen: React.FC = ({ navigation, route }: any) => {
    // --- สถานะ (States) ---
    const [viewMode, setViewMode] = useState<'list' | 'chat'>('list');
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListLoading, setIsListLoading] = useState(true);
    
    // --- สถานะรูปภาพ (Image States) ---
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
    
    const insets = useSafeAreaInsets();
    const flatListRef = useRef<FlatList>(null);

    // --- จัดการพารามิเตอร์ (Params Handling) ---
    const analysisContext = route?.params?.analysisContext || null;
    const imageUri = route?.params?.imageUri || null;
    const imageBase64 = route?.params?.imageBase64 || null;
    const displayImageUri = imageBase64 ? `data:image/jpeg;base64,${imageBase64}` : imageUri || undefined;

    // --- วงจรชีวิต (Lifecycle) ---
    useFocusEffect(
        React.useCallback(() => {
            loadSessions();
        }, [])
    );

    useEffect(() => {
        if (analysisContext) {
            startNewChatFromScan();
        }
    }, [analysisContext]);

    // --- ตรรกะของเซสชัน (Session Logic) ---
    const loadSessions = async () => {
        try {
            setIsListLoading(true);
            
            // 1. ดึงข้อมูลจาก Local Storage เป็นแคชด่วน
            const saved = await AsyncStorage.getItem(SESSIONS_KEY);
            const localSessions: ChatSession[] = saved ? JSON.parse(saved) : [];
            
            // 2. พยายามเรียกข้อมูลจากเซิร์ฟเวอร์
            try {
                const remoteSessions = await fetchRemoteChatSessions();
                if (remoteSessions && remoteSessions.length > 0) {
                    // อัปเดต Local Storage ด้วยข้อมูลจากเซิร์ฟเวอร์เพื่อให้ซิงค์กัน
                    // เรียงลำดับตามเวลาล่าสุด
                    const sorted = remoteSessions.sort((a: any, b: any) => b.timestamp - a.timestamp);
                    setSessions(sorted);
                    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sorted));
                    setIsListLoading(false);
                    return;
                }
            } catch (err) {
                console.warn("ไม่สามารถซิงค์จากเซิร์ฟเวอร์ได้ กำลังใช้ข้อมูลจากเครื่อง");
            }

            // ใช้ข้อมูลจากเครื่องถ้าซิงค์ไม่สำเร็จ
            const sorted = localSessions.sort((a, b) => b.timestamp - a.timestamp);
            setSessions(sorted);
        } catch (e) {
            console.error(e);
        } finally {
            setIsListLoading(false);
        }
    };

    const startNewChatFromScan = () => {
        const initialMsgs: Message[] = [
            { id: 'bot_1', text: 'ผลวิเคราะห์ใหม่ถูกโหลดเข้ามาแล้วครับ!', sender: 'bot', timestamp: Date.now() },
            { id: 'user_1', text: `ผลวิเคราะห์ล่าสุด:\n${analysisContext}`, sender: 'user', imageUri: displayImageUri, timestamp: Date.now() },
            { id: 'bot_2', text: 'ต้องการให้ผมแนะนำข้อมูลส่วนไหนเพิ่มเติมจากภาพนี้ไหมครับ?', sender: 'bot', timestamp: Date.now() }
        ];
        
        const newTempSession: ChatSession = {
            id: 'sess_' + Date.now(),
            title: 'วิเคราะห์โรคพืช',
            lastMessage: 'ผลวินิจฉัย...',
            timestamp: Date.now(),
            messages: initialMsgs
        };

        setActiveSession(newTempSession);
        setMessages(initialMsgs);
        setViewMode('chat');
    };

    const openSession = (session: ChatSession) => {
        setActiveSession(session);
        setMessages(session.messages);
        setViewMode('chat');
    };

    const startFreshChat = () => {
        const newTempSession: ChatSession = {
            id: 'sess_' + Date.now(),
            title: 'การสนทนาใหม่',
            lastMessage: '',
            timestamp: Date.now(),
            messages: []
        };
        setActiveSession(newTempSession);
        setMessages([]);
        setViewMode('chat');
    };

    const goBackToList = () => {
        setViewMode('list');
        setActiveSession(null);
        setMessages([]);
        setSelectedImage(null);
        setSelectedImageBase64(null);
        loadSessions();
    };

    // --- ตรรกะการเลือกรูปภาพ (Image Picker Logic) ---
    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.7,
            base64: true,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
            setSelectedImageBase64(result.assets[0].base64 || null);
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('ขออภัย', 'เราต้องการสิทธิ์เข้าถึงกล้องเพื่อถ่ายภาพ');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.7,
            base64: true,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
            setSelectedImageBase64(result.assets[0].base64 || null);
        }
    };

    const removeSelectedImage = () => {
        setSelectedImage(null);
        setSelectedImageBase64(null);
    };

    const deleteSession = (id: string, title: string) => {
        Alert.alert("ลบการสนทนา", `ลบ "${title}" ใช่หรือไม่?`, [
            { text: "ยกเลิก", style: "cancel" },
            { text: "ลบ", style: "destructive", onPress: async () => {
                const updated = sessions.filter(s => s.id !== id);
                setSessions(updated);
                await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
                // ลบจากเซิร์ฟเวอร์แบบเงียบๆ
                try {
                    await deleteRemoteChatSession(id);
                } catch(e) {}
            }}
        ]);
    };

    // --- ตรรกะการรับส่งข้อความ (Messaging Logic) ---
    const sendMessage = async () => {
        if ((!inputText.trim() && !selectedImage) || isLoading) return;

        const userText = inputText.trim();
        const newUserMsg: Message = { 
            id: Date.now().toString(), 
            text: userText, 
            sender: 'user', 
            imageUri: selectedImage || undefined,
            imageBase64: selectedImageBase64 || undefined,
            timestamp: Date.now() 
        };
        const updatedMsgs = [...messages, newUserMsg];
        
        setMessages(updatedMsgs);
        setInputText('');
        setIsLoading(true);
        const currentImageBase64 = selectedImageBase64;
        setSelectedImage(null);
        setSelectedImageBase64(null);
        Keyboard.dismiss();

        try {
            // สร้างคำสั่ง (Prompt) สำหรับ Gemini แบบมัลติโมดอล
            const promptParts: any[] = [{ text: userText || "วิเคราะห์ภาพนี้ให้หน่อยครับ" }];
            
            if (currentImageBase64) {
                promptParts.push({
                    inlineData: {
                        mimeType: "image/jpeg",
                        data: currentImageBase64
                    }
                });
            }

            const response = await fetch(GEMINI_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [
                        {
                            role: 'user',
                            parts: promptParts
                        }
                    ],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 1000,
                    }
                })
            });

            const data = await response.json();
            
            // แสดงข้อความแสดงข้อผิดพลาดถ้ามี
            if (data.error) {
                console.error("Gemini API Error:", data.error);
                throw new Error(data.error.message);
            }

            const botText = data.candidates?.[0]?.content?.parts?.[0]?.text || "ขออภัยครับ ลองใหม่อีกครั้งนะครับ";

            const newBotMsg: Message = { id: (Date.now()+1).toString(), text: botText, sender: 'bot', timestamp: Date.now() };
            const finalMsgs = [...updatedMsgs, newBotMsg];
            
            setMessages(finalMsgs);
            saveSession(finalMsgs);
        } catch (e) {
            console.error(e);
            Alert.alert("ข้อผิดพลาด", "ไม่สามารถส่งข้อความได้ในขณะนี้");
        } finally {
            setIsLoading(false);
        }
    };

    const saveSession = async (currentMsgs: Message[]) => {
        const sessId = activeSession?.id || 'sess_' + Date.now();
        let title = activeSession?.title || 'บทสนทนาใหม่';
        
        if (title === 'บทสนทนาใหม่' || title === 'วิเคราะห์โรคพืช') {
            const firstUser = currentMsgs.find(m => m.sender === 'user');
            if (firstUser) title = firstUser.text.substring(0, 25);
        }

        const sessData: ChatSession = {
            id: sessId,
            title,
            lastMessage: currentMsgs[currentMsgs.length - 1].text,
            timestamp: Date.now(),
            messages: currentMsgs
        };

        const updatedSessions = [...sessions];
        const idx = updatedSessions.findIndex(s => s.id === sessId);
        if (idx > -1) updatedSessions[idx] = sessData;
        else updatedSessions.unshift(sessData);

        setSessions(updatedSessions);
        setActiveSession(sessData);
        await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(updatedSessions));
        
        // ซิงค์ข้อมูลไปยังเซิร์ฟเวอร์ในพื้นหลัง
        try {
            await syncRemoteChatSession(sessData as any);
        } catch (err) {
            console.log("Remote sync fail", err);
        }
    };

    useEffect(() => {
        if (viewMode === 'chat') {
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 200);
        }
    }, [messages, isLoading, viewMode]);

    // --- ส่วนการแสดงผล (Renders) ---
    if (viewMode === 'list') {
        return (
            <View style={[chatStyles.container, { paddingTop: insets.top }]}>
                <StatusBar barStyle="dark-content" />
                <ActionBar
                    title="แชทบอท AI"
                    subtitle="ประวัติการสนทนา"
                    showBack={true}
                    onBack={() => navigation.navigate('Main')}
                    rightAction={
                        <TouchableOpacity onPress={() => {
                            Alert.alert("ล้างประวัติ", "ลบประวัติการแชททั้งหมด?", [
                                { text: "ยกเลิก" },
                                { text: "ลบทั้งหมด", style: "destructive", onPress: async () => {
                                    await AsyncStorage.removeItem(SESSIONS_KEY);
                                    setSessions([]);
                                }}
                            ]);
                        }} style={chatStyles.headerRightAction}>
                            <Ionicons name="trash-outline" size={20} color={theme.colors.primary} />
                        </TouchableOpacity>
                    }
                />

                {isListLoading ? (
                    <View style={chatStyles.center}><ActivityIndicator color={theme.colors.primary} /></View>
                ) : sessions.length === 0 ? (
                    <View style={chatStyles.emptyState}>
                        <MaterialCommunityIcons name="chat-plus-outline" size={64} color="#e2e8f0" />
                        <Text style={chatStyles.emptyText}>ยังไม่มีประวัติการคุย</Text>
                        <TouchableOpacity style={chatStyles.newChatButton} onPress={startFreshChat}>
                            <Text style={chatStyles.newChatButtonText}>เริ่มคุยตอนนี้</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <FlatList
                        data={sessions}
                        keyExtractor={s => s.id}
                        contentContainerStyle={{ padding: scale(16) }}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={chatStyles.sessionCard} onPress={() => openSession(item)}>
                                <View style={chatStyles.sessionCardIcon}><MaterialCommunityIcons name="chat-outline" size={22} color={theme.colors.primary} /></View>
                                <View style={{ flex: 1 }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <Text style={chatStyles.sessionCardTitle} numberOfLines={1}>{item.title}</Text>
                                        <Text style={chatStyles.sessionCardTime}>{new Date(item.timestamp).toLocaleDateString('th-TH')}</Text>
                                    </View>
                                    <Text style={chatStyles.sessionCardLast} numberOfLines={1}>{item.lastMessage}</Text>
                                </View>
                                <TouchableOpacity onPress={() => deleteSession(item.id, item.title)} style={{ padding: scale(4) }}>
                                    <Ionicons name="trash-outline" size={16} color="#cbd5e1" />
                                </TouchableOpacity>
                            </TouchableOpacity>
                        )}
                    />
                )}
                <TouchableOpacity style={chatStyles.fab} onPress={startFreshChat}>
                    <Ionicons name="add" size={30} color="#fff" />
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[chatStyles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" />
            <ActionBar 
                title={activeSession?.title || 'แชทบอท AI'} 
                subtitle={isLoading ? "กำลังคิด..." : "ออนไลน์"} 
                showBack={true}
                onBack={goBackToList}
                rightAction={
                    <TouchableOpacity onPress={() => deleteSession(activeSession?.id || '', activeSession?.title || 'แชท')} style={[chatStyles.headerRightAction, { backgroundColor: '#F5F7FA' }]}>
                        <Ionicons name="trash-outline" size={20} color={theme.colors.primary} />
                    </TouchableOpacity>
                }
            />
            
            <KeyboardAvoidingView 
                style={chatStyles.keyboardAvoid} 
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 90 : 0}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={m => m.id}
                    renderItem={({ item }) => {
                        const isU = item.sender === 'user';
                        return (
                            <View style={[chatStyles.messageWrapper, isU ? chatStyles.messageWrapperUser : chatStyles.messageWrapperBot]}>
                                {!isU && <View style={chatStyles.botAvatar}><MaterialCommunityIcons name="robot-outline" size={16} color="#fff" /></View>}
                                <View style={[chatStyles.messageBubble, isU ? chatStyles.userBubble : chatStyles.botBubble]}>
                                    {item.imageUri && <Image source={{ uri: item.imageUri }} style={chatStyles.chatImage} />}
                                    {isU
                                        ? <Text style={[chatStyles.messageText, chatStyles.userText]}>{item.text}</Text>
                                        : <MarkdownText text={item.text} />
                                    }
                                    {item.timestamp && <Text style={{ fontSize: 8, marginTop: 4, opacity: 0.5, color: isU ? '#fff' : '#64748b', alignSelf: 'flex-end' }}>{new Date(item.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</Text>}
                                </View>
                            </View>
                        );
                    }}
                    contentContainerStyle={chatStyles.listContent}
                    showsVerticalScrollIndicator={false}
                />

                {isLoading && (
                    <View style={chatStyles.loadingContainer}>
                        <ActivityIndicator size="small" color={theme.colors.primary} />
                        <Text style={chatStyles.loadingText}> AI กำลังคิด...</Text>
                    </View>
                )}

                {selectedImage && (
                    <View style={chatStyles.previewContainer}>
                        <Image source={{ uri: selectedImage }} style={chatStyles.previewImage} />
                        <TouchableOpacity style={chatStyles.removePreview} onPress={removeSelectedImage}>
                            <Ionicons name="close-circle" size={24} color={theme.colors.danger} />
                        </TouchableOpacity>
                    </View>
                )}

                <View style={[chatStyles.inputOuterContainer, { paddingBottom: Math.max(insets.bottom, verticalScale(12)) }]}>
                    <TouchableOpacity style={chatStyles.mediaButton} onPress={pickImage}>
                        <Ionicons name="image-outline" size={moderateScale(24)} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={chatStyles.mediaButton} onPress={takePhoto}>
                        <Ionicons name="camera-outline" size={moderateScale(24)} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <View style={chatStyles.inputContainer}>
                        <TextInput
                            style={chatStyles.input}
                            placeholder="พิมพ์ข้อความ..."
                            placeholderTextColor="#94A3B8"
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                        />
                        <TouchableOpacity 
                            style={[chatStyles.sendButton, (!inputText.trim() && !selectedImage) && { opacity: 0.5 }]} 
                            onPress={sendMessage}
                            disabled={(!inputText.trim() && !selectedImage) || isLoading}
                        >
                            <Ionicons name="send" size={moderateScale(20)} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

export default ChatScreen;
