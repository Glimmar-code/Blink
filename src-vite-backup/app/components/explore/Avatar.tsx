import { View, Text } from "react-native";
import type { UserProfile } from "./types";

const AVATAR_COLORS: Record<string, string> = {
  AO: "bg-violet-500",
  JB: "bg-sky-600",
  ZM: "bg-pink-500",
  KA: "bg-emerald-600",
  RC: "bg-amber-500",
  DW: "bg-rose-500",
  ML: "bg-indigo-600",
  NJ: "bg-teal-600",
};

export function Avatar({
  user,
  size = "md",
  onClick,
}: {
  user: UserProfile;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}) {
  const sizeClasses = {
    sm: "w-9 h-9 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-16 h-16 text-base",
  };
  const dotSize = { sm: "w-2 h-2", md: "w-2.5 h-2.5", lg: "w-3 h-3" };

  return (
    <View className="relative flex-shrink-0" onClick={onClick}>
      <View
        className={`${sizeClasses[size]} ${AVATAR_COLORS[user.avatar] || "bg-muted-foreground"} rounded-full flex items-center justify-center font-bold text-white ${onClick ? "cursor-pointer" : ""}`}
      >
        {user.avatar}
      </View>
      {user.isActive && (
        <Text
          className={`absolute bottom-0 right-0 ${dotSize[size]} bg-green-500 rounded-full border-2 border-background`}
        />
      )}
    </View>
  );
}
