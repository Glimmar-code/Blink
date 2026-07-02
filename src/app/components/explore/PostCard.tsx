import { View, Text } from "react-native";
import { useState } from "react";
import { Heart, MessageSquare, Repeat2, Share, MoreHorizontal } from "lucide-react";
import type { Post } from "./types";
import { Avatar } from "./Avatar";
import { formatCount } from "./utils";

export function PostCard({ post, onGoToProfile }: { post: Post; onGoToProfile: (id: string) => void }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);

  const toggleLike = () => {
    setLiked((l) => !l);
    setLikeCount((c) => c + (liked ? -1 : 1));
  };

  return (
    <View className="bg-card border-b border-border px-4 py-3">
      <View className="flex gap-3">
        <Avatar user={post.user} size="sm" onClick={() => onGoToProfile(post.user.id)} />
        <View className="flex-1 min-w-0">
          <View className="flex items-center justify-between">
            <View
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => onGoToProfile(post.user.id)}
            >
              <Text className="font-semibold text-sm text-foreground">
                {post.user.name}
              </Text>
              <Text className="text-muted-foreground text-xs ml-1">· {post.time}</Text>
            </View>
            <MoreHorizontal size={16} className="text-muted-foreground" />
          </View>
          <Text className="text-foreground/90 text-sm mt-1 leading-relaxed">
            {post.content}
          </Text>
          <View className="flex items-center gap-5 mt-2.5">
            <button
              onClick={toggleLike}
              className={`flex items-center gap-1 text-xs ${liked ? "text-rose-500" : "text-muted-foreground"}`}
            >
              <Heart size={15} fill={liked ? "currentColor" : "none"} />
              {formatCount(likeCount)}
            </button>
            <button className="flex items-center gap-1 text-xs text-muted-foreground">
              <MessageSquare size={15} />
              {formatCount(post.comments)}
            </button>
            <button className="flex items-center gap-1 text-xs text-muted-foreground">
              <Repeat2 size={15} />
              {formatCount(post.reposts)}
            </button>
            <button className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
              <Share size={15} />
            </button>
          </View>
        </View>
      </View>
    </View>
  );
}
