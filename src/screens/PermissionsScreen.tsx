import { useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Bell,
  Camera,
  Image as ImageIcon,
  FolderOpen,
  Check,
  X,
  Settings as SettingsIcon,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Button } from '../components/ui/Button';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import {
  requestAllPermissions,
  checkPermission,
  openSystemSettings,
  type PermissionKey,
  type PermissionResult,
} from '../services/permissionService';
import type { RootStackParamList } from '../types/auth';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Permissions'>;

const ICON_MAP: Record<
  PermissionKey,
  LucideIcon
> = {
  notifications: Bell,
  camera: Camera,
  photos: ImageIcon,
  mediaLibrary: FolderOpen,
};

const FRIENDLY: Record<PermissionKey, { title: string; description: string }> = {
  notifications: {
    title: 'Notifications',
    description:
      'Get pinged for new messages, likes, comments, follows, and your daily reward.',
  },
  camera: {
    title: 'Camera',
    description: 'Take photos and short videos to share with the community.',
  },
  photos: {
    title: 'Photo Library',
    description: 'Pick images from your gallery to upload to your posts.',
  },
  mediaLibrary: {
    title: 'Media Library',
    description: 'Save the photos and videos you create in Blink to your gallery.',
  },
};

const ORDER: PermissionKey[] = ['notifications', 'photos', 'camera', 'mediaLibrary'];

export function PermissionsScreen() {
  const navigation = useNavigation<Nav>();
  const [results, setResults] = useState<Record<PermissionKey, PermissionResult | null>>({
    notifications: null,
    camera: null,
    photos: null,
    mediaLibrary: null,
  });
  const [loadingKey, setLoadingKey] = useState<PermissionKey | null>(null);
  const [requesting, setRequesting] = useState(false);

  const refresh = async () => {
    const updates: typeof results = { ...results };
    for (const key of ORDER) {
      updates[key] = await checkPermission(key);
    }
    setResults(updates);
  };

  const handleRequest = async (key: PermissionKey) => {
    setLoadingKey(key);
    const result = await requestAllPermissions({
      order: [key],
      showExplanation: true,
      skipGranted: false,
    });
    setResults((prev) => ({ ...prev, [key]: result[0] }));
    setLoadingKey(null);
  };

  const handleAllowAll = async () => {
    setRequesting(true);
    const all = await requestAllPermissions({ order: ORDER, showExplanation: true });
    const map: typeof results = { ...results };
    all.forEach((r) => {
      map[r.key] = r;
    });
    setResults(map);
    setRequesting(false);
  };

  const allHandled = ORDER.every((k) => results[k] !== null);
  const anyGranted = ORDER.some((k) => results[k]?.status === 'granted');

  return (
    <ScreenContainer noPadding>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
        <View className="items-center mb-6">
          <View className="h-16 w-16 rounded-full bg-primary-100 items-center justify-center mb-3">
            <Bell size={28} color="#6366f1" />
          </View>
          <Text className="text-2xl font-bold text-foreground text-center">
            Let's set up your access
          </Text>
          <Text className="text-sm text-muted-foreground text-center mt-2">
            Blink needs a few permissions to work properly. We'll ask one at a time, just like
            every new app on your phone.
          </Text>
        </View>

        <View className="gap-3">
          {ORDER.map((key) => {
            const result = results[key];
            const Icon = ICON_MAP[key];
            const { title, description } = FRIENDLY[key];
            const isLoading = loadingKey === key;
            const status = result?.status;

            return (
              <View
                key={key}
                className="rounded-xl border border-border bg-card p-4 flex-row gap-3"
              >
                <View className="h-11 w-11 rounded-full bg-primary-100 items-center justify-center">
                  <Icon size={20} color="#6366f1" />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-base font-semibold text-foreground">{title}</Text>
                    {status === 'granted' && (
                      <View className="flex-row items-center gap-1 bg-success/10 px-2 py-0.5 rounded-full">
                        <Check size={12} color="#10b981" />
                        <Text className="text-xs text-success font-medium">Allowed</Text>
                      </View>
                    )}
                    {status === 'denied' && (
                      <View className="flex-row items-center gap-1 bg-destructive/10 px-2 py-0.5 rounded-full">
                        <X size={12} color="#ef4444" />
                        <Text className="text-xs text-destructive font-medium">Denied</Text>
                      </View>
                    )}
                    {status === 'undetermined' && (
                      <View className="bg-muted px-2 py-0.5 rounded-full">
                        <Text className="text-xs text-muted-foreground font-medium">Not set</Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-xs text-muted-foreground mt-1">{description}</Text>
                  <View className="flex-row gap-2 mt-3">
                    <Pressable
                      onPress={() => handleRequest(key)}
                      disabled={isLoading}
                      className="bg-primary-500 active:bg-primary-600 rounded-md px-3 py-1.5 flex-row items-center gap-1"
                    >
                      {isLoading ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <Text className="text-white text-xs font-semibold">
                          {status === 'granted' ? 'Re-request' : 'Allow'}
                        </Text>
                      )}
                    </Pressable>
                    {status === 'denied' && (
                      <Pressable
                        onPress={openSystemSettings}
                        className="bg-muted active:bg-slate-200 rounded-md px-3 py-1.5 flex-row items-center gap-1"
                      >
                        <SettingsIcon size={12} color="#0f172a" />
                        <Text className="text-foreground text-xs font-semibold">Settings</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        <View className="gap-2 mt-6">
          <Button
            title="Allow all at once"
            onPress={handleAllowAll}
            loading={requesting}
            size="lg"
          />
          <Button
            title={allHandled && anyGranted ? 'Continue to Blink' : 'Skip for now'}
            variant="ghost"
            onPress={() => navigation.replace('Main')}
            size="lg"
          />
          <Text className="text-xs text-muted-foreground text-center mt-2">
            You can change these anytime in Settings → Blink.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
