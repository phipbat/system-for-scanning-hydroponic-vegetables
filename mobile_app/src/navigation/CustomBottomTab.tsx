import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Text from '../components/CustomText';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scale, verticalScale, moderateScale } from '../utils/responsive';
import { theme } from '../styles/theme';

const Tab = createBottomTabNavigator();

// Interface กำหนดโครงสร้าง props ของแต่ละแท็บ
interface TabScreen {
    name: string;
    component: React.ComponentType<any>;
    title: string;
    iconName: string;
    iconType: 'Ionicons' | 'MaterialCommunityIcons';
    hideTabBar?: boolean;
    isCenterButton?: boolean; // เพิ่ม flag สำหรับปุ่มตรงกลาง
}

interface CustomBottomTabProps {
    screens: TabScreen[];
    initialRouteName: string;
}

// คอมโพเนนต์แท็บบาร์แบบกำหนดเองทั้งหมด (Full Custom)
function CustomTabBar({ state, descriptors, navigation }: any) {
    const insets = useSafeAreaInsets();
    const bottomPad = Math.max(insets.bottom, Platform.OS === 'android' ? 8 : 0);

    return (
        <View style={[styles.tabBarWrapper, { paddingBottom: bottomPad }]}>
            <View style={styles.tabBar}>
                {state.routes.map((route: any, index: number) => {
                    const { options } = descriptors[route.key];
                    const screenConfig = options.__screenConfig as TabScreen;
                    const isFocused = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });
                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    // กรณีเป็นปุ่มพิเศษตรงกลาง
                    if (screenConfig.isCenterButton) {
                        return (
                            <TouchableOpacity
                                key={route.key}
                                activeOpacity={0.8}
                                onPress={onPress}
                                style={styles.centerTabItem}
                            >
                                <View style={styles.centerButton}>
                                    <Ionicons
                                        name={screenConfig.iconName as any}
                                        size={moderateScale(28)}
                                        color="#ffffff"
                                    />
                                </View>
                                <Text style={[styles.tabLabel, { color: theme.colors.primary, marginTop: 4 }]}>
                                    {screenConfig.title}
                                </Text>
                            </TouchableOpacity>
                        );
                    }

                    // ปุ่มแท็บปกติ
                    const iconName = isFocused
                        ? screenConfig.iconName
                        : `${screenConfig.iconName}-outline`;

                    const IconComponent =
                        screenConfig.iconType === 'MaterialCommunityIcons'
                            ? MaterialCommunityIcons
                            : Ionicons;

                    return (
                        <TouchableOpacity
                            key={route.key}
                            activeOpacity={0.75}
                            onPress={onPress}
                            style={styles.tabItem}
                        >
                            <View style={[
                                styles.iconWrapper,
                                isFocused && styles.iconWrapperActive,
                            ]}>
                                <IconComponent
                                    name={iconName as any}
                                    size={moderateScale(22)}
                                    color={isFocused ? theme.colors.primary : '#B0B8C1'}
                                />
                            </View>
                            <Text style={[
                                styles.tabLabel,
                                isFocused ? styles.tabLabelActive : styles.tabLabelInactive,
                            ]}>
                                {screenConfig.title}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

// คอมโพเนนต์หลักที่ใช้งาน
export default function CustomBottomTab({ screens, initialRouteName }: CustomBottomTabProps) {
    // กรองหน้าจอที่ต้องการแสดง (ไม่รวมหน้าที่ซ่อน)
    const visibleScreens = screens.filter(s => !s.hideTabBar);

    return (
        <Tab.Navigator
            initialRouteName={initialRouteName}
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={({ route }) => {
                const screen = visibleScreens.find(s => s.name === route.name);
                return {
                    headerShown: false,
                    tabBarHideOnKeyboard: true,
                    ...(screen ? { __screenConfig: screen } as any : {}),
                };
            }}
        >
            {visibleScreens.map((screen) => (
                <Tab.Screen
                    key={screen.name}
                    name={screen.name}
                    component={screen.component}
                    options={{ __screenConfig: screen } as any}
                />
            ))}
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    tabBarWrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: scale(16),
        paddingTop: verticalScale(8),
        backgroundColor: 'transparent',
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        borderRadius: scale(28),
        paddingVertical: verticalScale(8),
        paddingHorizontal: scale(8),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 12,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.03)',
        marginBottom: verticalScale(6),
        alignItems: 'flex-end', // ให้ปุ่มปกติอยู่ชิดล่าง
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: verticalScale(4),
    },
    // สไตล์ปุ่มตรงกลาง
    centerTabItem: {
        flex: 1.2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerButton: {
        width: scale(56),
        height: scale(56),
        borderRadius: scale(28),
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: verticalScale(-30), // ดันปุ่มขึ้นไปให้ลอย
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
        borderWidth: 4,
        borderColor: '#ffffff', // ขอบขาวตัดกับปุ่ม
    },
    iconWrapper: {
        width: scale(40),
        height: scale(40),
        aspectRatio: 1, // บังคับให้เป็นจัตุรัสเป๊ะๆ
        borderRadius: 999,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(2),
        overflow: 'hidden', // กันสีพื้นหลังรั่วออกมาตอนสลับ
    },
    iconWrapperActive: {
        backgroundColor: '#E8F5E9',
    },
    tabLabel: {
        fontSize: moderateScale(10),
        fontWeight: '600',
        letterSpacing: 0.2,
    },
    tabLabelActive: {
        color: theme.colors.primary,
        fontWeight: '700',
    },
    tabLabelInactive: {
        color: '#B0B8C1',
    },
});
