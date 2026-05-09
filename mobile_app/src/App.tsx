import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Prompt_400Regular, Prompt_500Medium, Prompt_700Bold } from '@expo-google-fonts/prompt';

import MainTabs from './navigation/MainTabs';
import { registerForPushNotificationsAsync, updatePushTokenOnServer } from './services/NotificationService';

// Auth
import LoginScreen from './screens/System_Login/LoginScreen';
import RegisterScreen from './screens/System_Login/RegisterScreen';
import ForgotPasswordScreen from './screens/System_Login/ForgotPasswordScreen';

// Main screens
import HistoryScreen from './screens/HistoryScreen';
import ChatScreen from './screens/ChatScreen';
import CameraAlertsScreen from './screens/CameraAlertsScreen';

// Camera
import CameraLens from './screens/Camera_mobile/CameraLens';
import CameraAnalyze from './screens/Camera_mobile/CameraAnalyze';
import HistoryDetail from './screens/Camera_mobile/HistoryDetail';

// Profile sub-screens
import AccountSettingsScreen from './screens/Profile_sub/AccountSettingsScreen';
import PersonalInfoScreen from './screens/Profile_sub/PersonalInfoScreen';
import SecurityScreen from './screens/Profile_sub/SecurityScreen';
import NotificationsSettingsScreen from './screens/Profile_sub/NotificationsSettingsScreen';
import ManageFarmScreen from './screens/Profile_sub/ManageFarmScreen';
import CameraSettingsScreen from './screens/Profile_sub/CameraSettingsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({ Prompt_400Regular, Prompt_500Medium, Prompt_700Bold });

  React.useEffect(() => {
    // ลงทะเบียนรับ Push Notifications ทันทีที่แอปเปิด
    const setupNotifications = async () => {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        await updatePushTokenOnServer(token);
      }
    };
    
    setupNotifications();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          id={undefined}
          initialRouteName="Login"
          screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#fff' }, animation: 'slide_from_right' }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />

          <Stack.Screen name="Main" component={MainTabs} />

          <Stack.Screen name="History" component={HistoryScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="CameraAlerts" component={CameraAlertsScreen} />
          <Stack.Screen name="CameraLens" component={CameraLens} />
          <Stack.Screen name="CameraAnalyze" component={CameraAnalyze} />
          <Stack.Screen name="HistoryDetail" component={HistoryDetail} />

          <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} />
          <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
          <Stack.Screen name="Security" component={SecurityScreen} />
          <Stack.Screen name="NotificationsSettings" component={NotificationsSettingsScreen} />
          <Stack.Screen name="ManageFarm" component={ManageFarmScreen} />
          <Stack.Screen name="CameraSettings" component={CameraSettingsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="dark" backgroundColor="transparent" translucent />
    </SafeAreaProvider>
  );
}
