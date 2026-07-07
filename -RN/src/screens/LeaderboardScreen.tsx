import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Trophy, ArrowLeft } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { Avatar } from '../components/ui/Avatar';
import type { RootStackParamList } from '../types/auth';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface LeaderboardEntry {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  university?: string;
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
      .select('id, username, full_name, avatar_url, university, xp')
      .order('xp', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Failed to load leaderboard', error);
      return;
    }

    const mapped: LeaderboardEntry[] = (data ?? []).map((p: any, index: number) => ({
      id: p.id,
      username: p.username,
      full_name: p.full_name,
      avatar_url: p.avatar_url,
      university: p.university,
      xp: p.xp ?? 0,
      rank: index + 1,
    }));
    setEntries(mapped);
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
    <View className=\"flex-1 bg-background\">\
      <View className=\"flex-row items-center px-4 py-3 border-b border-border\">\
        <Pressable onPress={() => navigation.goBack()} hitSlop={8} className=\"p-1\">\
          <ArrowLeft size={22} color=\"#0f172a\" />\
        </Pressable>\
        <Text className=\"ml-3 text-lg font-bold text-foreground\">Leaderboard</Text>\
      </View>\
\
      <FlatList\
        data={entries}\
        keyExtractor={(item) => item.id}\
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}\
        contentContainerStyle={{ padding: 12, paddingBottom: 80 }}\
        ListEmptyComponent={\
          <View className=\"items-center justify-center py-20\">\
            <Trophy size={48} color=\"#cbd5e1\" />\
            <Text className=\"text-base font-semibold text-foreground mt-3\">\
              No entries yet\
            </Text>\
            <Text className=\"text-sm text-muted-foreground mt-1\">\
              Start earning XP to climb the ranks!\
            </Text>\
          </View>\
        }\
        renderItem={({ item }) => (\
          <Pressable\
            onPress={() => navigation.navigate('UserProfile', { username: item.username })}\
            className=\"flex-row items-center gap-3 px-4 py-3 border-b border-border active:bg-muted\"\
          >\
            <Text className=\"text-lg font-bold text-muted-foreground w-8 text-center\">\
              {item.rank}\
            </Text>\
            <Avatar uri={item.avatar_url} name={item.full_name} size=\"md\" />\
            <View className=\"flex-1\">\
              <Text className=\"text-sm font-semibold text-foreground\" numberOfLines={1}>\
                {item.full_name}\
              </Text>\
              <Text className=\"text-xs text-muted-foreground\">\
                @{item.username}\
                {item.university ? ` • ${item.university}` : ''}\
              </Text>\
            </View>\
            <View className=\"flex-row items-center gap-1\">\
              <Text className=\"text-sm font-semibold text-primary-600\">{item.xp}</Text>\
              <Text className=\"text-xs text-muted-foreground\">XP</Text>\
            </View>\
          </Pressable>\
        )}\
      />\
    </View>\
  );\
}\
