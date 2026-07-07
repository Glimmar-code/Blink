import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './src/context/AuthContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useEffect } from 'react';
import { setupNotificationListeners, teardownNotificationListeners, registerForPushNotifications, savePushTokenToSupabase } from './src/services/notificationService';
import { useAuth } from './src/context/AuthContext';
import { AppState, AppStateStatus, View } from 'react-native';

const queryClient = new QueryClient();

function NotificationBootstrap({ children }: { children: React.ReactNode }) {
  const { user, session } = useAuth();

  useEffect(() => {
    setupNotificationListeners();
    return () => teardownNotificationListeners();
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      if (!user || !session) return;
      const token = await registerForPushNotifications();
      if (!cancelled && token) {
        await savePushTokenToSupabase(user.id, token);
      }
    }
    bootstrap();

    const sub = AppState.addEventListener('change', async (state: AppStateStatus) => {
      if (state === 'active' && user) {
        const token = await registerForPushNotifications();
        if (token) {
          await savePushTokenToSupabase(user.id, token);
        }
      }
    });

    return () => {
      cancelled = true;
      sub.remove();
    };
  }, [user, session]);

  return <>{children}</>;
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <NotificationBootstrap>
              <View className="flex-1 bg-background">
                <RootNavigator />
                <StatusBar style="auto" />
              </View>
            </NotificationBootstrap>
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
