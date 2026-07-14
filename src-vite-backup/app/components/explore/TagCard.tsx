import { View, Text } from "react-native";
import { Hash, TrendingUp } from "lucide-react";
import type { Tag } from "./types";
import { formatCount } from "./utils";

export function TagCard({ tag }: { tag: Tag }) {
  return (
    <View className="bg-card border-b border-border px-4 py-3 flex items-center gap-3">
      <View className="w-9 h-9 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
        <Hash size={16} className="text-foreground" />
      </View>
      <View className="flex-1">
        <Text className="font-semibold text-sm text-foreground">#{tag.name}</Text>
        <Text className="text-muted-foreground text-xs mt-0.5">
          {formatCount(tag.count)} posts
        </Text>
      </View>
      <TrendingUp size={14} className="text-muted-foreground" />
    </View>
  );
}
