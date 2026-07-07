import { View, Text, Pressable } from 'react-native';
import { Home, Compass, Trophy, Bell, MessageCircle, User } from 'lucide-react-native';
import { cn } from '../lib/cn';
import type { MainTabParamList } from '../types/auth';

interface BottomNavProps {
  activeTab: keyof MainTabParamList;
  onTabPress: (tab: keyof MainTabParamList) => void;
  unreadNotifications?: number;
  unreadMessages?: number;
}

const tabs: Array<{
  name: keyof MainTabParamList;
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
}> = [
  { name: 'Home', label: 'Home', icon: Home },
  { name: 'Explore', label: 'Explore', icon: Compass },
  { name: 'Leaderboard', label: 'Ranks', icon: Trophy },
  { name: 'Notifications', label: 'Alerts', icon: Bell },
  { name: 'Messages', label: 'Chats', icon: MessageCircle },
  { name: 'Profile', label: 'You', icon: User },
];

export function BottomNav({
  activeTab,
  onTabPress,
  unreadNotifications = 0,
  unreadMessages = 0,
}: BottomNavProps) {
  return (
    <View className="flex-row items-center justify-around bg-background border-t border-border px-1 py-2 pb-3">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.name;
        const Icon = tab.icon;
        const badge =
          tab.name === 'Notifications'
            ? unreadNotifications
            : tab.name === 'Messages'
            ? unreadMessages
            : 0;
        return (
          <Pressable
            key={tab.name}
            onPress={() => onTabPress(tab.name)}
            className="items-center justify-center flex-1 py-1"
          >
            <View className="relative">
              <Icon size={22} color={isActive ? '#6366f1' : '#64748b'} />
              {badge > 0 && (
                <View className="absolute -top-1.5 -right-2 bg-destructive rounded-full min-w-[16px] h-4 px-1 items-center justify-center">
                  <Text className="text-white text-[9px] font-bold">
                    {badge > 9 ? '9+' : badge}
                  </Text>
                </View>
              )}
            </View>
            <Text
              className={cn(
                'text-[10px] mt-0.5',
                isActive ? 'text-primary-600 font-semibold' : 'text-muted-foreground'
              )}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
