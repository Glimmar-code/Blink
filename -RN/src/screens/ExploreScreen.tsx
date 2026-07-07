import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, Pressable, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Search, Hash, Users } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { Avatar } from '../components/ui/Avatar';
import { Card } from '../components/ui/Card';
import type { RootStackParamList } from '../types/auth';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type ExploreItem =
  | { type: 'person'; id: string; username: string; full_name: string; avatar_url?: string; university?: string }
  | { type: 'tag'; id: string; name: string; post_count: number };

const SECTIONS = [
  { key: 'people', label: 'People', icon: Users },
  { key: 'tags', label: 'Tags', icon: Hash },
] as const;

type SectionKey = (typeof SECTIONS)[number]['key'];

export function ExploreScreen() {
  const navigation = useNavigation<Nav>();
  const [query, setQuery] = useState('');
  const [activeSection, setActiveSection] = useState<SectionKey>('people');
  const [items, setItems] = useState<ExploreItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (activeSection === 'people') {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, university')
        .order('created_at', { ascending: false })
        .limit(30);
      if (error) {
        console.error('Failed to load people', error);
        setItems([]);
        return;
      }
      const mapped: ExploreItem[] = (data ?? []).map((p: any) => ({
        type: 'person',
        id: p.id,
        username: p.username,
        full_name: p.full_name,
        avatar_url: p.avatar_url,
        university: p.university,
      }));
      setItems(mapped);
    } else {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('post_count', { ascending: false })
        .limit(30);
      if (error) {
        console.error('Failed to load tags', error);
        setItems([]);
        return;
      }
      const mapped: ExploreItem[] = (data ?? []).map((t: any) => ({
        type: 'tag',
        id: t.id ?? t.name,
        name: t.name,
        post_count: t.post_count ?? 0,
      }));
      setItems(mapped);
    }
  }, [activeSection]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const filtered = items.filter((it) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    if (it.type === 'person') {
      return (
        it.username.toLowerCase().includes(q) ||
        it.full_name.toLowerCase().includes(q)
      );
    }
    return it.name.toLowerCase().includes(q);
  });

  return (
    <View className="flex-1 bg-background">
      <View className="px-4 pt-3 pb-2 border-b border-border">
        <Text className="text-xl font-bold text-foreground mb-2">Explore</Text>
        <View className="flex-row items-center bg-muted rounded-lg px-3 h-10">
          <Search size={18} color="#64748b" />
          <TextInput
            className="flex-1 ml-2 text-sm text-foreground"
            placeholder="Search people, tags..."
            placeholderTextColor="#94a3b8"
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
          />
        </View>
      </View>

      <View className="flex-row border-b border-border">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          const isActive = activeSection === s.key;
          return (
            <Pressable
              key={s.key}
              onPress={() => setActiveSection(s.key)}
              className={`flex-1 flex-row items-center justify-center gap-1 py-3 ${
                isActive ? 'border-b-2 border-primary-500' : ''
              }`}
            >
              <Icon size={16} color={isActive ? '#6366f1' : '#64748b'} />
              <Text
                className={
                  isActive
                    ? 'text-sm font-semibold text-primary-600'
                    : 'text-sm text-muted-foreground'
                }
              >
                {s.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item, i) => `${item.type}-${item.id}-${i}`}
        contentContainerStyle={{ padding: 12 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => {
          if (item.type === 'person') {
            return (
              <Card className="mb-2 p-3 flex-row items-center gap-3">
                <Avatar uri={item.avatar_url} name={item.full_name} size="md" />
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground">
                    {item.full_name}
                  </Text>
                  <Text className="text-xs text-muted-foreground">
                    @{item.username}
                    {item.university ? ` • ${item.university}` : ''}
                  </Text>
                </View>
                <Pressable
                  onPress={() =>
                    navigation.navigate('UserProfile', { username: item.username })
                  }
                  className="bg-primary-500 active:bg-primary-600 rounded-md px-3 py-1.5"
                >
                  <Text className="text-white text-xs font-semibold">View</Text>
                </Pressable>
              </Card>
            );
          }
          return (
            <Card className="mb-2 p-3 flex-row items-center gap-3">
              <View className="h-10 w-10 rounded-lg bg-primary-100 items-center justify-center">
                <Hash size={18} color="#6366f1" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-foreground">
                  #{item.name}
                </Text>
                <Text className="text-xs text-muted-foreground">
                  {item.post_count} posts
                </Text>
              </View>
            </Card>
          );
        }}
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <Text className="text-5xl mb-3">🔍</Text>
            <Text className="text-sm text-muted-foreground">Nothing to show</Text>
          </View>
        }
      />
    </View>
  );
}
