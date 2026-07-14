import { View, Text, Image, Pressable } from 'react-native';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from 'lucide-react-native';
import { Avatar } from './ui/Avatar';
import { Card } from './ui/Card';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '../lib/cn';

export interface Post {
  id: string;
  user_id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  content: string;
  image_url?: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  liked?: boolean;
  saved?: boolean;
  created_at: string;
  tag?: string;
  university?: string;
}

interface PostCardProps {
  post: Post;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onSave?: () => void;
  onProfilePress?: () => void;
  onMore?: () => void;
  onPress?: () => void;
}

export function PostCard({
  post,
  onLike,
  onComment,
  onShare,
  onSave,
  onProfilePress,
  onMore,
  onPress,
}: PostCardProps) {
  return (
    <Card className="mb-3 overflow-hidden">
      <View className="flex-row items-center justify-between p-3">
        <Pressable
          onPress={onProfilePress}
          className="flex-row items-center gap-2 flex-1"
        >
          <Avatar uri={post.avatar_url} name={post.full_name} size="sm" />
          <View className="flex-1">
            <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
              {post.full_name}
            </Text>
            <View className="flex-row items-center gap-1">
              <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                @{post.username}
              </Text>
              {post.university && (
                <>
                  <Text className="text-xs text-muted-foreground">•</Text>
                  <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                    {post.university}
                  </Text>
                </>
              )}
              <Text className="text-xs text-muted-foreground">•</Text>
              <Text className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: false })}
              </Text>
            </View>
          </View>
        </Pressable>
        <Pressable onPress={onMore} hitSlop={8} className="p-1">
          <MoreHorizontal size={18} color="#64748b" />
        </Pressable>
      </View>

      <Pressable onPress={onPress}>
        {post.content ? (
          <Text className="px-3 pb-2 text-sm text-foreground">{post.content}</Text>
        ) : null}
        {post.image_url ? (
          <Image
            source={{ uri: post.image_url }}
            className="w-full aspect-square"
            resizeMode="cover"
          />
        ) : null}
        {post.tag ? (
          <View className="px-3 pt-2">
            <Text className="text-xs text-primary-600 font-medium">
              #{post.tag}
            </Text>
          </View>
        ) : null}
      </Pressable>

      <View className="flex-row items-center justify-between px-3 py-2 border-t border-border">
        <View className="flex-row items-center gap-4">
          <Pressable onPress={onLike} hitSlop={6} className="flex-row items-center gap-1">
            <Heart
              size={18}
              color={post.liked ? '#ef4444' : '#64748b'}
              fill={post.liked ? '#ef4444' : 'transparent'}
            />
            <Text className={cn('text-xs', post.liked ? 'text-destructive' : 'text-muted-foreground')}>
              {post.likes_count}
            </Text>
          </Pressable>
          <Pressable onPress={onComment} hitSlop={6} className="flex-row items-center gap-1">
            <MessageCircle size={18} color="#64748b" />
            <Text className="text-xs text-muted-foreground">{post.comments_count}</Text>
          </Pressable>
          <Pressable onPress={onShare} hitSlop={6} className="flex-row items-center gap-1">
            <Share2 size={18} color="#64748b" />
            <Text className="text-xs text-muted-foreground">{post.shares_count}</Text>
          </Pressable>
        </View>
        <Pressable onPress={onSave} hitSlop={6}>
          <Bookmark
            size={18}
            color={post.saved ? '#6366f1' : '#64748b'}
            fill={post.saved ? '#6366f1' : 'transparent'}
          />
        </Pressable>
      </View>
    </Card>
  );
}
