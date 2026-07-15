import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Trophy } from 'lucide-react-native';
import { Avatar } from '../components/ui/Avatar';
import { supabase } from '../lib/supabase';
import type { RootStackParamList } from '../types/auth';
import { mapProfile, PROFILE_SELECT } from '../lib/dbCompat';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface LeaderboardEntry {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string | null;
  university?: string | null;
  xp: number;
  rank: number;
}

export function LeaderboardScreen() {
  const navigation = useNavigation<Nav>();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadLeaderboard = useCallback(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select(PROFILE_SELECT)
      .order('current_wallet_balance', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Failed to load leaderboard', error);
      return;
    }

    setEntries(
      (data ?? []).map((row: any, index: number) => {
        const profile = mapProfile(row);
        return {
          id: profile.id,
          username: profile.username,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          university: profile.university,
          xp: profile.xp ?? 0,
          rank: index + 1,
        };
      })
    );
  }, []);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLeaderboard();
    setRefreshing(false);
  };

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center border-b border-border px-4 py-3">
        <Pressable onPress={() => navigation.goBack()} hitSlop={8} className="p-1">
          <ArrowLeft size={22} color="#0f172a" />
        </Pressable>
        <Text className="ml-3 text-lg font-bold text-foreground">Leaderboard</Text>
      </View>

      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ padding: 12, paddingBottom: 80 }}
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <Trophy size={48} color="#cbd5e1" />
            <Text className="mt-3 text-base font-semibold text-foreground">No entries yet</Text>
            <Text className="mt-1 text-sm text-muted-foreground">
              Start earning XP to climb the ranks.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate('UserProfile', { username: item.username })}
            className="flex-row items-center gap-3 border-b border-border px-4 py-3 active:bg-muted"
          >
            <Text className="w-8 text-center text-lg font-bold text-muted-foreground">
              {item.rank}
            </Text>
            <Avatar uri={item.avatar_url} name={item.full_name} size="md" />
            <View className="flex-1">
              <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
                {item.full_name}
              </Text>
              <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                @{item.username}
                {item.university ? ` - ${item.university}` : ''}
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Text className="text-sm font-semibold text-primary-600">{item.xp}</Text>
              <Text className="text-xs text-muted-foreground">XP</Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}
