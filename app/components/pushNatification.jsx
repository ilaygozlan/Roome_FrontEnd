import { useState, useEffect, useRef } from 'react';
import { Text, View, Button, Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

/**
 * @module PushNotification
 * @description Module for handling push notifications in the application using Expo's notification system.
 * Includes setup, registration, and sending of push notifications.
 * 
 * Features:
 * - Device registration for push notifications
 * - Push notification sending functionality
 * - Notification permission handling
 * - Platform-specific configuration (Android/iOS)
 * - Error handling and reporting
 * 
 * @requires expo-notifications
 * @requires expo-device
 * @requires expo-constants
 */

/**
 * Configuration for notification handling
 * @constant
 * @type {Object}
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Sends a push notification to a specific device
 * @async
 * @function sendPushNotification
 * @param {string} expoPushToken - The target device's Expo push token
 * @param {string} title - Notification title
 * @param {string} body - Notification body content
 * @returns {Promise<void>}
 */
export async function sendPushNotification(expoPushToken, title, body) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: title,
    body: body,
    data: { someData: 'goes here' },
  };

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const responseData = await response.json();
    console.log('🔔 Push Notification Response:', responseData);
  } catch (error) {
    console.error('❌ Error sending push notification:', error);
  }
}

function handleRegistrationError(errorMessage) {
  //alert(errorMessage);
  throw new Error(errorMessage);
}

/**
 * Registers the device for push notifications
 * @async
 * @function registerForPushNotificationsAsync
 * @returns {Promise<string>} The device's push token
 * @throws {Error} If registration fails or permissions are denied
 */
export async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
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
      handleRegistrationError('Permission not granted to get push token for push notification!');
      return;
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.manifest?.extra?.eas?.projectId ??
      '74d7d55b-5541-423c-bab5-acf88cf98489';
    if (!projectId) {
      handleRegistrationError('Project ID not found');
    }
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log(pushTokenString);
      return pushTokenString;
    } catch (e) {
      handleRegistrationError(`${e}`);
    }
  } else {
    handleRegistrationError('Must use physical device for push notifications');
  }
}

/**
 * Main component for push notification testing and display
 * @component
 * @description Provides a UI for testing push notifications and displaying the device's push token
 */
export default function pushNatification() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState('');
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then(token => setExpoPushToken(token ?? ''))
      .catch((error) => setExpoPushToken(`${error}`));

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(notificationListener.current);
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'space-around' }}>
      <Text>Your Expo push token: {expoPushToken}</Text>
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text>Title: {notification && notification.request.content.title} </Text>
        <Text>Body: {notification && notification.request.content.body}</Text>
        <Text>Data: {notification && JSON.stringify(notification.request.content.data)}</Text>
      </View>
      <Button
        title="Press to Send Notification"
        onPress={async () => {
          await sendPushNotification(expoPushToken);
        }}
      />
    </View>
  );
}
