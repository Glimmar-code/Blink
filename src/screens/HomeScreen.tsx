import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Bell, Menu, Flame, Sparkles } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Avatar } from '../components/ui/Avatar';
import { PostCard, type Post } from '../components/PostCard';
import { BottomNav } from '../components/BottomNav';
import type { RootStackParamList, MainTabParamList } from '../types/auth';
import { mapPost, POST_WITH_PROFILE_SELECT } from '../lib/dbCompat';
import { fetchUnreadCount } from '../services/notificationService';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { profile, user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<keyof MainTabParamList>('Home');
  const [feedType, setFeedType] = useState<'foryou' | 'following'>('foryou');
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    if (!user) return;
    fetchUnreadCount(user.id).then(setUnreadNotifications);
    const interval = setInterval(() => {
      fetchUnreadCount(user.id).then(setUnreadNotifications);
    }, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const loadPosts = useCallback(async () => {
    const { data, error } = await supabase
      .from('posts')
      .select(POST_WITH_PROFILE_SELECT)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) {
      console.error('Failed to load posts', error);
      return;
    }
    const mapped: Post[] = (data ?? []).map(mapPost);
    setPosts(mapped);
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
        <Pressable
          onPress={() => navigation.navigate('Menu')}
          className="p-1"
          hitSlop={8}
        >
          <Menu size={24} color="#0f172a" />
        </Pressable>
        <Text className="text-xl font-bold text-foreground">Blink</Text>
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() => navigation.navigate('DailyReward')}
            hitSlop={6}
          >
            <Sparkles size={22} color="#f59e0b" />
          </Pressable>
          <Pressable
            onPress={() => {
              setUnreadNotifications(0);
              navigation.navigate('Main', { screen: 'Notifications' });
            }}
            hitSlop={6}
            className="relative"
          >
            <Bell size={22} color="#0f172a" />
            {unreadNotifications > 0 && (
              <View className="absolute -top-1.5 -right-2 bg-destructive rounded-full min-w-[16px] h-4 px-1 items-center justify-center">
                <Text className="text-white text-[9px] font-bold">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      {/* Feed type tabs */}
      <View className="flex-row border-b border-border">
        <Pressable
          onPress={() => setFeedType('foryou')}
          className={`flex-1 items-center py-3 ${
            feedType === 'foryou' ? 'border-b-2 border-primary-500' : ''
          }`}
        >
          <View className="flex-row items-center gap-1">
            <Flame
              size={16}
              color={feedType === 'foryou' ? '#6366f1' : '#64748b'}
            />
            <Text
              className={
                feedType === 'foryou'
                  ? 'text-sm font-semibold text-primary-600'
                  : 'text-sm text-muted-foreground'
              }
            >
              For You
            </Text>
          </View>
        </Pressable>
        <Pressable
          onPress={() => setFeedType('following')}
          className={`flex-1 items-center py-3 ${
            feedType === 'following' ? 'border-b-2 border-primary-500' : ''
          }`}
        >
          <Text
            className={
              feedType === 'following'
                ? 'text-sm font-semibold text-primary-600'
                : 'text-sm text-muted-foreground'
            }
          >
            Following
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 12, paddingBottom: 80 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          profile ? (
            <View className="flex-row items-center gap-3 mb-3 p-2">
              <Avatar uri={profile.avatar_url} name={profile.full_name} size="sm" />
              <View>
                <Text className="text-sm font-semibold text-foreground">
                  Hi, {profile.full_name?.split(' ')[0] || 'there'} 👋
                </Text>
                <Text className="text-xs text-muted-foreground">
                  {profile.university || 'Welcome back'}
                </Text>
              </View>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onLike={() => {
              /* TODO: like */
            }}
            onComment={() => navigation.navigate('PostDetail', { id: item.id })}
            onShare={() => {
              /* TODO: share */
            }}
            onSave={() => {
              /* TODO: save */
            }}
            onProfilePress={() =>
              navigation.navigate('UserProfile', { username: item.username })
            }
            onPress={() => navigation.navigate('PostDetail', { id: item.id })}
          />
        )}
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <Text className="text-5xl mb-3">📱</Text>
            <Text className="text-base font-semibold text-foreground">
              No posts yet
            </Text>
            <Text className="text-sm text-muted-foreground mt-1">
              Be the first to share something with the community!
            </Text>
          </View>
        }
      />

      <View className="absolute bottom-0 left-0 right-0">
        <BottomNav
          activeTab={activeTab}
          unreadNotifications={unreadNotifications}
          onTabPress={(t) => {
            setActiveTab(t);
            if (t === 'Notifications') {
              setUnreadNotifications(0);
              navigation.navigate('Main', { screen: 'Notifications' });
            }
            if (t === 'Messages') navigation.navigate('Main', { screen: 'Messages' });
            if (t === 'Profile') navigation.navigate('UserProfile', { username: profile?.username ?? '' });
          }}
        />
      </View>
    </View>
  );
}
