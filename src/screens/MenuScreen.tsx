import { Alert, Pressable, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Bell, Gift, LogOut, Shield, UserPen } from 'lucide-react-native';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/auth';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function MenuScreen() {
  const navigation = useNavigation<Nav>();
  const { signOut } = useAuth();

  const confirmSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center border-b border-border px-4 py-3">
        <Pressable onPress={() => navigation.goBack()} hitSlop={8} className="p-1">
          <ArrowLeft size={22} color="#0f172a" />
        </Pressable>
        <Text className="ml-3 text-lg font-bold text-foreground">Menu</Text>
      </View>
      <View className="gap-3 p-4">
        <MenuItem icon={<UserPen size={20} color="#0f172a" />} title="Edit profile" onPress={() => navigation.navigate('EditProfile')} />
        <MenuItem icon={<Gift size={20} color="#0f172a" />} title="Daily reward" onPress={() => navigation.navigate('DailyReward')} />
        <MenuItem icon={<Bell size={20} color="#0f172a" />} title="Notifications" onPress={() => navigation.navigate('Main')} />
        <MenuItem icon={<Shield size={20} color="#0f172a" />} title="Permissions" onPress={() => navigation.navigate('Permissions')} />
        <Button title="Sign out" variant="destructive" icon={<LogOut size={18} color="white" />} onPress={confirmSignOut} className="mt-3" />
      </View>
    </View>
  );
}

function MenuItem({ icon, title, onPress }: { icon: React.ReactNode; title: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center gap-3 rounded-lg border border-border bg-card px-4 py-4 active:bg-muted">
      {icon}
      <Text className="text-base font-semibold text-foreground">{title}</Text>
    </Pressable>
  );
}
