import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import type { RootStackParamList, MainTabParamList } from '../types/auth';

import { AuthScreen } from '../screens/AuthScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { PermissionsScreen } from '../screens/PermissionsScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ExploreScreen } from '../screens/ExploreScreen';
import { LeaderboardScreen } from '../screens/LeaderboardScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { MessagesScreen } from '../screens/MessagesScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { PostDetailScreen } from '../screens/PostDetailScreen';
import { UserProfileScreen } from '../screens/UserProfileScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { DailyRewardScreen } from '../screens/DailyRewardScreen';
import { MenuScreen } from '../screens/MenuScreen';
import { navigationRef } from './navigationRef';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Leaderboard" component={LeaderboardScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { session, loading, isNewUser } = useAuth();

  if (loading) {
    return null;
  }

  const showOnboarding = session && isNewUser;

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!session ? (
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Auth" component={AuthScreen} />
          </>
        ) : showOnboarding ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="PostDetail" component={PostDetailScreen} />
            <Stack.Screen name="UserProfile" component={UserProfileScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="DailyReward" component={DailyRewardScreen} />
            <Stack.Screen name="Menu" component={MenuScreen} />
          </>
        )}
        <Stack.Screen name="Permissions" component={PermissionsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
