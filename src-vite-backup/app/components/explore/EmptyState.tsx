import { View, Text } from "react-native";
import { Search } from "lucide-react";

export function EmptyState({ label }: { label: string }) {
  return (
    <View className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      <Search size={32} className="mb-3 opacity-40" />
      <Text className="text-sm">{label}</Text>
    </View>
  );
}
