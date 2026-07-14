import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Image, Pressable, RefreshControl, Text, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Grid3x3, Heart, MessageCircle, MoreHorizontal, UserCheck, UserPlus } from 'lucide-react-native';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { PostCard, type Post } from '../components/PostCard';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { AuthProfile, RootStackParamList } from '../types/auth';
import { mapPost, mapProfile, POST_WITH_PROFILE_SELECT, PROFILE_SELECT } from '../lib/dbCompat';

type Nav = NativeStackNavigationProp<RootStackParamList, 'UserProfile'>;
type Route = RouteProp<RootStackParamList, 'UserProfile'>;

export function UserProfileScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const { username } = route.params;
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [tab, setTab] = useState<'posts' | 'liked'>('posts');
  const [stats, setStats] = useState({ followers: 0, following: 0, posts: 0 });

  const loadProfile = useCallback(async () => {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select(PROFILE_SELECT)
      .eq('handle', username)
      .single();

    if (profileError || !profileData) {
      console.error('Failed to load profile', profileError);
      Alert.alert('Error', 'Could not load user profile.');
      navigation.goBack();
      return;
    }

    const normalizedProfile = mapProfile(profileData);
    setProfile(normalizedProfile);
    const [postsRes, followersRes, followingRes, isFollowingRes] = await Promise.all([
      supabase
        .from('posts')
        .select(POST_WITH_PROFILE_SELECT)
        .eq('author_id', profileData.id)
        .order('created_at', { ascending: false }),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', profileData.id),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', profileData.id),
      user
        ? supabase
            .from('follows')
            .select('*', { count: 'exact', head: true })
            .eq('follower_id', user.id)
            .eq('following_id', profileData.id)
        : Promise.resolve({ count: 0 }),
    ]);

    if (postsRes.data) {
      setPosts(postsRes.data.map(mapPost));
    }

    setStats({
      followers: followersRes.count ?? normalizedProfile.followers_count ?? 0,
      following: followingRes.count ?? normalizedProfile.following_count ?? 0,
      posts: postsRes.data?.length ?? 0,
    });
    setIsFollowing((isFollowingRes.count ?? 0) > 0);
  }, [navigation, user, username]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  };

  const handleFollowToggle = async () => {
    if (!user || !profile) return;
    const query = supabase.from('follows');
    const { error } = isFollowing
      ? await query.delete().eq('follower_id', user.id).eq('following_id', profile.id)
      : await query.insert({ follower_id: user.id, following_id: profile.id });

    if (error) {
      console.error('Failed to update follow state', error);
      return;
    }
    await loadProfile();
  };

  if (!profile) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted-foreground">Loading profile...</Text>
      </View>
    );
  }

  const isMyProfile = user?.id === profile.id;

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
              {profile.cover_url ? (
                <Image source={{ uri: profile.cover_url }} className="h-32 w-full" resizeMode="cover" />
              ) : (
                <View className="h-32 w-full bg-primary-600" />
              )}
              <View className="absolute left-2 top-2 flex-row gap-2">
                <Pressable onPress={() => navigation.goBack()} className="h-9 w-9 items-center justify-center rounded-full bg-black/40" hitSlop={6}>
                  <ArrowLeft size={18} color="white" />
                </Pressable>
              </View>
              {!isMyProfile && (
                <View className="absolute right-2 top-2">
                  <Pressable className="h-9 w-9 items-center justify-center rounded-full bg-black/40" hitSlop={6}>
                    <MoreHorizontal size={18} color="white" />
                  </Pressable>
                </View>
              )}
            </View>

            <View className="-mt-10 px-4">
              <View className="flex-row items-end justify-between">
                <Avatar uri={profile.avatar_url} name={profile.full_name} size="xl" className="border-4 border-background" />
                {!isMyProfile && (
                  <View className="mb-2 flex-row gap-2">
                    <Button
                      title={isFollowing ? 'Following' : 'Follow'}
                      onPress={handleFollowToggle}
                      variant={isFollowing ? 'secondary' : 'primary'}
                      icon={isFollowing ? <UserCheck size={16} color="#0f172a" /> : <UserPlus size={16} color="white" />}
                    />
                    <Button title="Message" variant="outline" icon={<MessageCircle size={16} color="#0f172a" />} />
                  </View>
                )}
              </View>

              <View className="mt-3">
                <Text className="text-xl font-bold text-foreground">{profile.full_name || 'User'}</Text>
                <Text className="text-sm text-muted-foreground">@{profile.username}</Text>
                {profile.bio ? <Text className="mt-2 text-sm text-foreground">{profile.bio}</Text> : null}
                <View className="mt-2 flex-row flex-wrap gap-x-3">
                  {profile.university ? <Text className="text-xs text-muted-foreground">{profile.university}</Text> : null}
                  {profile.level ? <Text className="text-xs text-muted-foreground">{profile.level}</Text> : null}
                  {profile.department ? <Text className="text-xs text-muted-foreground">{profile.department}</Text> : null}
                </View>
              </View>

              <View className="mt-3 flex-row justify-around border-y border-border py-4">
                <Stat label="Posts" value={stats.posts} />
                <Stat label="Followers" value={stats.followers} />
                <Stat label="Following" value={stats.following} />
              </View>

              <View className="mt-4 flex-row border-b border-border">
                {(['posts', 'liked'] as const).map((item) => {
                  const Icon = item === 'posts' ? Grid3x3 : Heart;
                  const isActive = tab === item;
                  return (
                    <Pressable
                      key={item}
                      onPress={() => setTab(item)}
                      className={`flex-1 flex-row items-center justify-center gap-1 py-3 ${isActive ? 'border-b-2 border-primary-500' : ''}`}
                    >
                      <Icon size={16} color={isActive ? '#6366f1' : '#64748b'} />
                      <Text className={isActive ? 'text-sm font-semibold text-primary-600' : 'text-sm text-muted-foreground'}>
                        {item === 'posts' ? 'Posts' : 'Liked'}
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
            onComment={() => navigation.navigate('PostDetail', { id: item.id })}
            onPress={() => navigation.navigate('PostDetail', { id: item.id })}
          />
        )}
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <Text className="text-sm text-muted-foreground">No posts yet</Text>
          </View>
        }
      />
    </View>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View className="items-center">
      <Text className="text-lg font-bold text-foreground">{value}</Text>
      <Text className="text-xs text-muted-foreground">{label}</Text>
    </View>
  );
}
