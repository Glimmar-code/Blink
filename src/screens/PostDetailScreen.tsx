import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Send, Heart, MessageCircle, Share2, Bookmark } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Avatar } from '../components/ui/Avatar';
import { PostCard, type Post } from '../components/PostCard';
import { formatDistanceToNow } from 'date-fns';
import type { RootStackParamList } from '../types/auth';
import { COMMENT_WITH_PROFILE_SELECT, mapPost, POST_WITH_PROFILE_SELECT } from '../lib/dbCompat';

type Nav = NativeStackNavigationProp<RootStackParamList, 'PostDetail'>;
type Route = RouteProp<RootStackParamList, 'PostDetail'>;

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
}
export function PostDetailScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const { id } = route.params;

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadPost = useCallback(async () => {
    const { data, error } = await supabase
      .from('posts')
      .select(POST_WITH_PROFILE_SELECT)
      .eq('id', id)
      .single();
    if (error) {
      console.error('Failed to load post', error);
      return;
    }
    setPost(mapPost(data));
  }, [id]);

  const loadComments = useCallback(async () => {
    const { data, error } = await supabase
      .from('comments')
      .select(COMMENT_WITH_PROFILE_SELECT)
      .eq('post_id', id)
      .order('created_at', { ascending: true });
    if (error) {
      console.error('Failed to load comments', error);
      return;
    }
    const mapped: Comment[] = (data ?? []).map((c: any) => ({
      id: c.id,
      post_id: c.post_id,
      user_id: c.user_id ?? c.author_id,
      content: c.content,
      created_at: c.created_at,
      username: c.profiles?.username ?? c.profiles?.handle,
      full_name: c.profiles?.full_name ?? c.profiles?.name,
      avatar_url: c.profiles?.avatar_url,
    }));
    setComments(mapped);
  }, [id]);
  useEffect(() => {
    loadPost();
    loadComments();
  }, [loadPost, loadComments]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadPost(), loadComments()]);
    setRefreshing(false);
  };

  const handleSubmitComment = async () => {
    if (!user || !post || !newComment.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from('comments').insert({
      post_id: post.id,
      author_id: user.id,
      content: newComment.trim(),
    });
    if (error) {
      console.error('Failed to post comment', error);
    } else {
      setNewComment('');
      await loadComments();
    }
    setSubmitting(false);
  };

  const handleLike = async () => {
    if (!user || !post) return;
    // TODO: implement like toggle
  };

  if (!post) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted-foreground">Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={64}
    >
      <View className="flex-row items-center px-4 py-3 border-b border-border">
        <Pressable onPress={() => navigation.goBack()} hitSlop={8} className="p-1">
          <ArrowLeft size={22} color="#0f172a" />
        </Pressable>
        <Text className="ml-3 text-lg font-bold text-foreground">Post</Text>
      </View>

      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <View>
            <PostCard post={post} onLike={handleLike} />
            <View className="px-4 py-2 border-b border-border">
              <Text className="text-sm font-semibold text-foreground">
                {comments.length} comments
              </Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View className="flex-row gap-2 px-4 py-3 border-b border-border">
            <Avatar uri={item.avatar_url} name={item.full_name} size="sm" />
            <View className="flex-1">
              <View className="bg-muted rounded-2xl px-3 py-2">
                <Text className="text-sm font-semibold text-foreground">
                  {item.full_name || item.username}
                </Text>
                <Text className="text-sm text-foreground mt-0.5">{item.content}</Text>
              </View>
              <View className="flex-row items-center gap-3 mt-1 px-1">
                <Text className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                </Text>
                <Pressable hitSlop={4}>
                  <Text className="text-xs text-muted-foreground font-medium">Like</Text>
                </Pressable>
                <Pressable hitSlop={4}>
                  <Text className="text-xs text-muted-foreground font-medium">Reply</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <Text className="text-4xl mb-2">💬</Text>
            <Text className="text-sm text-muted-foreground">No comments yet</Text>
            <Text className="text-xs text-muted-foreground mt-1">Be the first!</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      <View className="flex-row items-center gap-2 px-3 py-2 border-t border-border bg-background">
        <Avatar uri={user?.user_metadata?.avatar_url} name={user?.email} size="sm" />
        <TextInput
          className="flex-1 bg-muted rounded-full px-4 h-10 text-sm text-foreground"
          placeholder="Write a comment..."
          placeholderTextColor="#94a3b8"
          value={newComment}
          onChangeText={setNewComment}
          multiline
        />
        <Pressable
          onPress={handleSubmitComment}
          disabled={!newComment.trim() || submitting}
          className="h-10 w-10 rounded-full bg-primary-500 items-center justify-center active:bg-primary-600 disabled:opacity-50"
        >
          <Send size={18} color="white" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
