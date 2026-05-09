import React from 'react';
import CustomBottomTab from './CustomBottomTab';

// หน้าจอทั้งหมดที่ใช้ใน Tab Navigation
import HomeScreen from '../screens/HomeScreen';
import MonitorLiveScreen from '../screens/MonitorLiveScreen';
import Scanvegetables from '../screens/Camera_mobile/Scanvegetables';
import GrowthScreen from '../screens/GrowthScreen';
import ProfileScreen from '../screens/ProfileScreen';

// กำหนด 5 แท็บหลัก โดยมี Scanner เป็นปุ่มตรงกลาง
const tabScreens = [
    {
        name: 'Home',
        component: HomeScreen,
        title: 'หน้าหลัก',
        iconName: 'home',
        iconType: 'Ionicons' as const,
    },
    {
        name: 'Growth',
        component: GrowthScreen,
        title: 'การเติบโต',
        iconName: 'chart-timeline-variant',
        iconType: 'MaterialCommunityIcons' as const,
    },
    {
        name: 'Scanner',
        component: Scanvegetables,
        title: 'สแกน',
        iconName: 'scan',
        iconType: 'Ionicons' as const,
        isCenterButton: true, // กำหนดเป็นปุ่มตรงกลาง
    },
    {
        name: 'Camera',
        component: MonitorLiveScreen,
        title: 'กล้องสด',
        iconName: 'videocam',
        iconType: 'Ionicons' as const,
    },
    {
        name: 'Profile',
        component: ProfileScreen,
        title: 'โปรไฟล์',
        iconName: 'person',
        iconType: 'Ionicons' as const,
    },
];

export default function MainTabs() {
    return (
        <CustomBottomTab
            screens={tabScreens}
            initialRouteName="Home"
        />
    );
}
