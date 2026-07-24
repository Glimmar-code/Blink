import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Gift } from 'lucide-react-native';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export function DailyRewardScreen() {
  const navigation = useNavigation();
  const { user, refreshProfile } = useAuth();
  const [claiming, setClaiming] = useState(false);

  const claimReward = async () => {
    if (!user) return;
    setClaiming(true);
    const { error } = await supabase.rpc('claim_daily_reward', { p_user_id: user.id });
    setClaiming(false);

    if (error) {
      Alert.alert('Daily reward', error.message);
      return;
    }
    await refreshProfile();
    Alert.alert('Daily reward', 'Your daily XP reward has been claimed.');
  };

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center border-b border-border px-4 py-3">
        <Pressable onPress={() => navigation.goBack()} hitSlop={8} className="p-1">
          <ArrowLeft size={22} color="#0f172a" />
        </Pressable>
        <Text className="ml-3 text-lg font-bold text-foreground">Daily reward</Text>
      </View>
      <View className="flex-1 items-center justify-center px-6">
        <View className="mb-5 h-20 w-20 items-center justify-center rounded-full bg-primary-100">
          <Gift size={36} color="#6366f1" />
        </View>
        <Text className="text-center text-2xl font-bold text-foreground">Claim your daily XP</Text>
        <Text className="mt-2 text-center text-sm text-muted-foreground">
          Keep your streak alive and earn progress for showing up today.
        </Text>
        <Button title="Claim reward" onPress={claimReward} loading={claiming} className="mt-6 w-full" />
      </View>
    </View>
  );
}
