import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { supabase } from '../lib/supabase';
import { navigationRef } from '../navigation/navigationRef';

// ─── In-App Notification Types ───────────────────────────────────────────────

export type NotificationType = 'like' | 'comment' | 'follow' | 'message' | 'reward' | 'system';

export interface AppNotification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  read: boolean;
  created_at: string;
}

// ─── In-App Notification Fetching ────────────────────────────────────────────

export async function fetchInAppNotifications(userId: string): Promise<AppNotification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('[notifications] fetch error:', error);
    return [];
  }
  return (data ?? []) as AppNotification[];
}

export async function fetchUnreadCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) {
    console.error('[notifications] unread count error:', error);
    return 0;
  }
  return count ?? 0;
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId);

  if (error) {
    console.error('[notifications] mark read error:', error);
  }
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) {
    console.error('[notifications] mark all read error:', error);
  }
}

// ─── Push Notification Setup ──────────────────────────────────────────────────

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.warn('[notifications] push not available on simulator');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('[notifications] push permission denied');
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6366f1',
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync('messages', {
      name: 'Messages',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 100],
      lightColor: '#0ea5e9',
      sound: 'default',
    });
  }

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID,
    });
    return tokenData.data;
  } catch (err) {
    console.error('[notifications] failed to get push token:', err);
    return null;
  }
}

export async function savePushTokenToSupabase(userId: string, token: string): Promise<void> {
  const { error } = await supabase
    .from('push_tokens')
    .upsert(
      { user_id: userId, token, platform: Platform.OS, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,platform' }
    );

  if (error) {
    console.error('[notifications] failed to save push token:', error);
  }
}

// ─── Notification Event Listeners ────────────────────────────────────────────

let foregroundSub: Notifications.Subscription | null = null;
let responseSub: Notifications.Subscription | null = null;

export function setupNotificationListeners(): void {
  foregroundSub = Notifications.addNotificationReceivedListener((notification) => {
    console.log('[notifications] received in foreground:', notification.request.content.title);
  });

  responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data as any;
    handleNotificationNavigation(data);
  });
}

export function teardownNotificationListeners(): void {
  foregroundSub?.remove();
  responseSub?.remove();
  foregroundSub = null;
  responseSub = null;
}

function handleNotificationNavigation(data: any): void {
  if (!navigationRef.isReady()) return;

  if (data?.postId) {
    navigationRef.navigate('PostDetail', { id: data.postId });
  } else if (data?.username) {
    navigationRef.navigate('UserProfile', { username: data.username });
  } else if (data?.threadId) {
    navigationRef.navigate('Chat', { threadId: data.threadId, title: data.title ?? 'Chat' });
  } else if (data?.screen === 'Notifications') {
    navigationRef.navigate('Main', { screen: 'Notifications' });
  }
}

// ─── Schedule Local Notification (for testing / daily reward) ───────────────

export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: Record<string, unknown>,
  trigger?: Notifications.NotificationTriggerInput
): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: { title, body, data: data ?? {}, sound: 'default' },
    trigger: trigger ?? null,
  });
}
