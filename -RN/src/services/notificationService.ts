import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { supabase } from '../lib/supabase';
import { router } from 'expo-router';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export type AppNotification = {
  id: string;
  user_id: string;
  type: 'like' | 'comment' | 'follow' | 'message' | 'reward' | 'system';
  title: string;
  body: string;
  data?: Record<string, any>;
  read: boolean;
  created_at: string;
};

let notificationListener: Notifications.Subscription | null = null;
let responseListener: Notifications.Subscription | null = null;

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('[push] Must use physical device for Push Notifications');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('[push] Permission not granted');
    return null;
  }

  try {
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      (Constants.easConfig as any)?.projectId;

    if (!projectId) {
      console.warn('[push] No EAS projectId found in app config');
    }

    const token = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6366f1',
        sound: 'default',
      });
    }

    return token.data;
  } catch (error) {
    console.error('[push] Failed to get Expo push token', error);
    return null;
  }
}

export async function savePushTokenToSupabase(userId: string, token: string) {
  if (!userId || !token) return;

  const platform = Platform.OS;
  const { error } = await supabase
    .from('push_tokens')
    .upsert(
      { user_id: userId, token, platform, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,token' }
    );

  if (error) {
    console.error('[push] Failed to save push token', error);
  }
}

export async function removePushTokenFromSupabase(userId: string, token: string) {
  if (!userId || !token) return;
  const { error } = await supabase
    .from('push_tokens')
    .delete()
    .eq('user_id', userId)
    .eq('token', token);
  if (error) {
    console.error('[push] Failed to remove push token', error);
  }
}

export function handleNotificationNavigation(notification: Notifications.Notification) {
  const data = notification.request.content.data as
    | { path?: string; threadId?: string; username?: string; postId?: string }
    | undefined;

  if (!data) return;

  if (data.path) {
    try {
      router.push(data.path as any);
    } catch (e) {
      console.warn('[push] Failed to navigate to', data.path);
    }
  } else if (data.threadId) {
    router.push({ pathname: '/chat', params: { threadId: data.threadId } } as any);
  } else if (data.username) {
    router.push({ pathname: '/user', params: { username: data.username } } as any);
  } else if (data.postId) {
    router.push({ pathname: '/post', params: { id: data.postId } } as any);
  }
}

export function setupNotificationListeners() {
  notificationListener = Notifications.addNotificationReceivedListener((notification) => {
    console.log('[push] Received in foreground:', notification);
  });

  responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
    console.log('[push] User tapped:', response);
    handleNotificationNavigation(response.notification);
  });
}

export function teardownNotificationListeners() {
  notificationListener?.remove();
  responseListener?.remove();
  notificationListener = null;
  responseListener = null;
}

export async function getBadgeCount(): Promise<number> {
  return await Notifications.getBadgeCountAsync();
}

export async function setBadgeCount(count: number) {
  await Notifications.setBadgeCountAsync(count);
}

export async function clearBadge() {
  await Notifications.setBadgeCountAsync(0);
}

export async function fetchInAppNotifications(userId: string): Promise<AppNotification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('[notifications] fetch failed', error);
    return [];
  }
  return (data ?? []) as AppNotification[];
}

export async function markNotificationRead(id: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id);
  if (error) console.error('[notifications] mark read failed', error);
}

export async function markAllNotificationsRead(userId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);
  if (error) console.error('[notifications] mark all read failed', error);
}
