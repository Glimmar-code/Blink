import { useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, Pressable, RefreshControl, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Settings, Edit3, LogOut, Sparkles, Grid3x3, Heart } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { PostCard, type Post } from '../components/PostCard';
import type { RootStackParamList } from '../types/auth';
import { mapPost, POST_WITH_PROFILE_SELECT } from '../lib/dbCompat';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { user, profile, signOut } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState({ followers: 0, following: 0, posts: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<'posts' | 'liked'>('posts');
  const loadProfile = useCallback(async () => {
    if (!user) return;
    const [postsRes, followersRes, followingRes] = await Promise.all([
      supabase
        .from('posts')
        .select(POST_WITH_PROFILE_SELECT)
        .eq('author_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', user.id),
      supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', user.id),
    ]);

    if (postsRes.data) {
      const mapped: Post[] = postsRes.data.map(mapPost);
      setPosts(mapped);
    }
    setStats({
      followers: followersRes.count ?? profile?.followers_count ?? 0,
      following: followingRes.count ?? profile?.following_count ?? 0,
      posts: postsRes.data?.length ?? 0,
    });
  }, [profile?.followers_count, profile?.following_count, user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  };

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => signOut() },
    ]);
  };
  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={tab === 'posts' ? posts : []}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 80 }}
        ListHeaderComponent={
          <View>
            <View className="relative">
              {profile?.cover_url ? (
                <Image
                  source={{ uri: profile.cover_url }}
                  className="w-full h-32"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-32 bg-gradient-to-br from-primary-500 to-primary-700" />
              )}
              <View className="absolute top-2 right-2 flex-row gap-2">
                <Pressable
                  onPress={() => navigation.navigate('Menu')}
                  className="h-9 w-9 rounded-full bg-black/40 items-center justify-center"
                  hitSlop={6}
                >
                  <Settings size={18} color="white" />
                </Pressable>
              </View>
            </View>

            <View className="px-4 -mt-10">
              <View className="flex-row items-end justify-between">
                <Avatar
                  uri={profile?.avatar_url}
                  name={profile?.full_name}
                  size="xl"
                  className="border-4 border-background"
                />
                <View className="flex-row gap-2 mb-2">
                  <Pressable
                    onPress={() => navigation.navigate('EditProfile')}
                    className="bg-muted active:bg-slate-200 rounded-md px-3 py-1.5 flex-row items-center gap-1"
                  >
                    <Edit3 size={14} color="#0f172a" />
                    <Text className="text-sm text-foreground font-semibold">Edit</Text>
                  </Pressable>
                </View>
              </View>

              <View className="mt-3">
                <Text className="text-xl font-bold text-foreground">
                  {profile?.full_name || 'Your name'}
                </Text>
                <Text className="text-sm text-muted-foreground">
                  @{profile?.username}
                </Text>
                {profile?.bio ? (
                  <Text className="text-sm text-foreground mt-2">{profile.bio}</Text>
                ) : null}
                <View className="flex-row flex-wrap gap-x-3 mt-2">
                  {profile?.university && (
                    <Text className="text-xs text-muted-foreground">
                      🎓 {profile.university}
                    </Text>
                  )}
                  {profile?.level && (
                    <Text className="text-xs text-muted-foreground">
                      📚 {profile.level}
                    </Text>
                  )}
                  {profile?.department && (
                    <Text className="text-xs text-muted-foreground">
                      🏛 {profile.department}
                    </Text>
                  )}
                </View>
              </View>

              <View className="flex-row justify-around py-4 mt-3 border-y border-border">
                <View className="items-center">
                  <Text className="text-lg font-bold text-foreground">
                    {stats.posts}
                  </Text>
                  <Text className="text-xs text-muted-foreground">Posts</Text>
                </View>
                <View className="items-center">
                  <Text className="text-lg font-bold text-foreground">
                    {stats.followers}
                  </Text>
                  <Text className="text-xs text-muted-foreground">Followers</Text>
                </View>
                <View className="items-center">
                  <Text className="text-lg font-bold text-foreground">
                    {stats.following}
                  </Text>
                  <Text className="text-xs text-muted-foreground">Following</Text>
                </View>
              </View>

              <Pressable
                onPress={() => navigation.navigate('DailyReward')}
                className="flex-row items-center gap-3 p-3 mt-3 rounded-xl bg-gradient-to-r from-amber-100 to-amber-200"
              >
                <Sparkles size={20} color="#f59e0b" />
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-amber-900">
                    Claim your daily reward
                  </Text>
                  <Text className="text-xs text-amber-800">
                    Streak bonuses, XP, and badges await!
                  </Text>
                </View>
                <Text className="text-amber-900 text-lg">→</Text>
              </Pressable>

              <View className="flex-row border-b border-border mt-4">
                {(['posts', 'liked'] as const).map((t) => {
                  const Icon = t === 'posts' ? Grid3x3 : Heart;
                  const isActive = tab === t;
                  return (
                    <Pressable
                      key={t}
                      onPress={() => setTab(t)}
                      className={`flex-1 flex-row items-center justify-center gap-1 py-3 ${
                        isActive ? 'border-b-2 border-primary-500' : ''
                      }`}
                    >
                      <Icon size={16} color={isActive ? '#6366f1' : '#64748b'} />
                      <Text
                        className={
                          isActive
                            ? 'text-sm font-semibold text-primary-600'
                            : 'text-sm text-muted-foreground'
                        }
                      >
                        {t === 'posts' ? 'Posts' : 'Liked'}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onLike={() => {}}
            onComment={() => navigation.navigate('PostDetail', { id: item.id })}
            onPress={() => navigation.navigate('PostDetail', { id: item.id })}
          />
        )}
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <Text className="text-5xl mb-3">📷</Text>
            <Text className="text-sm text-muted-foreground">
              {tab === 'posts' ? 'No posts yet' : 'No liked posts'}
            </Text>
          </View>
        }
      />

      <View className="absolute bottom-0 left-0 right-0 px-4 pb-3">
        <Button
          title="Sign Out"
          variant="destructive"
          onPress={handleSignOut}
          leftIcon={<LogOut size={16} color="white" />}
        />
      </View>
    </View>
  );
}
