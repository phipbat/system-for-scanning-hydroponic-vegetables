import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { API_BASE_URL } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const registerForPushNotificationsAsync = async () => {

  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }

    const projectId = Constants?.expoConfig?.extra?.eas?.projectId || Constants?.easConfig?.projectId;

    try {
      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      console.log('Expo Push Token ในเครื่องคือ:', token);
    } catch (e) {
      console.log('ยังไม่สามารถรับ Token ได้:', e);
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
};

/**
 * ส่ง Token ไปเก็บที่ Laravel Backend
 */
export const updatePushTokenOnServer = async (token: string) => {
    try {
        const userToken = await AsyncStorage.getItem('@auth_token');
        if (!userToken) return;

        const response = await fetch(`${API_BASE_URL}/user/push-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`,
            },
            body: JSON.stringify({ push_token: token }),
        });

        if (response.ok) {
            console.log('Push token updated on server successfully');
        } else {
            console.error('Failed to update push token on server');
        }
    } catch (error) {
        console.error('Error updating push token on server:', error);
    }
};
