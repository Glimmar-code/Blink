import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, Pressable, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Heart, MessageCircle, UserPlus, Sparkles, Bell } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import {
  fetchInAppNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification,
} from '../services/notificationService';
import { formatDistanceToNow } from 'date-fns';
import type { RootStackParamList } from '../types/auth';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const ICON_MAP: Record<AppNotification['type'], React.ComponentType<{ size?: number; color?: string }>> = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
  message: MessageCircle,
  reward: Sparkles,
  system: Bell,
};

const COLOR_MAP: Record<AppNotification['type'], string> = {
  like: '#ef4444',
  comment: '#6366f1',
  follow: '#10b981',
  message: '#0ea5e9',
  reward: '#f59e0b',
  system: '#64748b',
};
export function NotificationsScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const load = useCallback(async () => {
    if (!user) return;
    const data = await fetchInAppNotifications(user.id);
    setItems(data);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleMarkAll = async () => {
    if (!user) return;
    await markAllNotificationsRead(user.id);
    await load();
  };

  const handlePress = async (item: AppNotification) => {
    await markNotificationRead(item.id);
    const data = item.data as any;
    if (data?.path) {
      navigation.navigate(data.path as any);
    } else if (data?.postId) {
      navigation.navigate('PostDetail', { id: data.postId });
    } else if (data?.username) {
      navigation.navigate('UserProfile', { username: data.username });
    }
    await load();
  };

  const filtered = filter === 'unread' ? items.filter((i) => !i.read) : items;
  const unreadCount = items.filter((i) => !i.read).length;

  return (
    <View className="flex-1 bg-background">
      <View className="px-4 pt-3 pb-2 border-b border-border">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-xl font-bold text-foreground">Notifications</Text>
          {unreadCount > 0 && (
            <Pressable onPress={handleMarkAll} hitSlop={6}>
              <Text className="text-sm text-primary-600 font-semibold">
                Mark all read
              </Text>
            </Pressable>
          )}
        </View>
        <View className="flex-row border-b border-border -mx-4 px-4">
          {(['all', 'unread'] as const).map((f) => {
            const isActive = filter === f;
            return (
              <Pressable
                key={f}
                onPress={() => setFilter(f)}
                className={`mr-6 pb-2 ${
                  isActive ? 'border-b-2 border-primary-500' : ''
                }`}
              >
                <Text
                  className={
                    isActive
                      ? 'text-sm font-semibold text-primary-600'
                      : 'text-sm text-muted-foreground'
                  }
                >
                  {f === 'all' ? 'All' : `Unread (${unreadCount})`}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 80 }}
        renderItem={({ item }) => {
          const Icon = ICON_MAP[item.type];
          const color = COLOR_MAP[item.type];
          return (
            <Pressable
              onPress={() => handlePress(item)}
              className={`flex-row items-start gap-3 px-4 py-3 border-b border-border ${
                !item.read ? 'bg-primary-50' : ''
              }`}
            >
              <View
                className="h-10 w-10 rounded-full items-center justify-center"
                style={{ backgroundColor: `${color}20` }}
              >
                <Icon size={18} color={color} />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-foreground">{item.title}</Text>
                <Text className="text-sm text-muted-foreground mt-0.5">{item.body}</Text>
                <Text className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                </Text>
              </View>
              {!item.read && <View className="h-2 w-2 rounded-full bg-primary-500 mt-2" />}
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <Bell size={48} color="#cbd5e1" />
            <Text className="text-base font-semibold text-foreground mt-3">
              All caught up!
            </Text>
            <Text className="text-sm text-muted-foreground mt-1">
              You'll see new notifications here
            </Text>
          </View>
        }
      />
    </View>
  );
}
