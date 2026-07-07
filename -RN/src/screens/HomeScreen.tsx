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

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { profile } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<keyof MainTabParamList>('Home');
  const [feedType, setFeedType] = useState<'foryou' | 'following'>('foryou');

  const loadPosts = useCallback(async () => {
    const { data, error } = await supabase
      .from('posts')
      .select(
        `
        *,
        profiles:user_id (username, full_name, avatar_url, university)
      `
      )
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) {
      console.error('Failed to load posts', error);
      return;
    }
    const mapped: Post[] = (data ?? []).map((p: any) => ({
      id: p.id,
      user_id: p.user_id,
      username: p.profiles?.username ?? 'user',
      full_name: p.profiles?.full_name ?? 'Unknown',
      avatar_url: p.profiles?.avatar_url,
      content: p.content,
      image_url: p.image_url,
      likes_count: p.likes_count ?? 0,
      comments_count: p.comments_count ?? 0,
      shares_count: p.shares_count ?? 0,
      created_at: p.created_at,
      tag: p.tag,
      university: p.profiles?.university,
    }));
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
            onPress={() => navigation.navigate('Notifications')}
            hitSlop={6}
          >
            <Bell size={22} color="#0f172a" />
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
        <BottomNav activeTab={activeTab} onTabPress={(t) => {
          setActiveTab(t);
          if (t === 'Notifications') navigation.navigate('Notifications');
          if (t === 'Messages') navigation.navigate('Messages');
          if (t === 'Profile') navigation.navigate('UserProfile', { username: profile?.username ?? '' });
        }} />
      </View>
    </View>
  );
}
