import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, Pressable, TextInput, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Search, Plus, MessageCircle } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Avatar } from '../components/ui/Avatar';
import { formatDistanceToNow } from 'date-fns';
import type { RootStackParamList } from '../types/auth';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export interface Thread {
  id: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  other_user_id: string;
  other_username?: string;
  other_full_name?: string;
  other_avatar_url?: string;
}

export function MessagesScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const loadThreads = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('threads')
      .select(
        `*, thread_members!inner (user_id), last_message:messages (content, created_at, sender_id)`
      )
      .contains('thread_members.user_id', [user.id])
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Failed to load threads', error);
      return;
    }
    setThreads((data ?? []) as any);
  }, [user]);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadThreads();
    setRefreshing(false);
  };

  const filtered = threads.filter((t) =>
    !query.trim()
      ? true
      : (t.other_full_name ?? '').toLowerCase().includes(query.toLowerCase())
  );

  return (
    <View className="flex-1 bg-background">
      <View className="px-4 pt-3 pb-2 border-b border-border">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-xl font-bold text-foreground">Messages</Text>
          <Pressable hitSlop={8} className="p-1">
            <Plus size={22} color="#6366f1" />
          </Pressable>
        </View>
        <View className="flex-row items-center bg-muted rounded-lg px-3 h-10">
          <Search size={18} color="#64748b" />
          <TextInput
            className="flex-1 ml-2 text-sm text-foreground"
            placeholder="Search conversations..."
            placeholderTextColor="#94a3b8"
            value={query}
            onChangeText={setQuery}
          />
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(t) => t.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 80 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              navigation.navigate('Chat', { threadId: item.id, title: item.other_full_name ?? 'Chat' })
            }
            className="flex-row items-center gap-3 px-4 py-3 border-b border-border active:bg-muted"
          >
            <Avatar uri={item.other_avatar_url} name={item.other_full_name} size="md" />
            <View className="flex-1">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
                  {item.other_full_name ?? item.other_username}
                </Text>
                <Text className="text-xs text-muted-foreground">
                  {item.last_message_at
                    ? formatDistanceToNow(new Date(item.last_message_at), { addSuffix: false })
                    : ''}
                </Text>
              </View>
              <View className="flex-row items-center justify-between mt-0.5">
                <Text
                  className={`text-sm flex-1 ${
                    item.unread_count > 0 ? 'text-foreground font-semibold' : 'text-muted-foreground'
                  }`}
                  numberOfLines={1}
                >
                  {item.last_message}
                </Text>
                {item.unread_count > 0 && (
                  <View className="bg-primary-500 rounded-full min-w-[20px] h-5 px-1.5 items-center justify-center ml-2">
                    <Text className="text-white text-xs font-bold">
                      {item.unread_count > 9 ? '9+' : item.unread_count}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <MessageCircle size={48} color="#cbd5e1" />
            <Text className="text-base font-semibold text-foreground mt-3">
              No conversations yet
            </Text>
            <Text className="text-sm text-muted-foreground mt-1 text-center px-8">
              Start a chat by tapping the + button
            </Text>
          </View>
        }
      />
    </View>
  );
}
