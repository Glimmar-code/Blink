export interface AuthProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string | null;
  cover_url?: string | null;
  bio?: string | null;
  university?: string | null;
  faculty?: string | null;
  department?: string | null;
  level?: string | null;
  gender?: string | null;
  relationship_status?: string | null;
  phone?: string | null;
  hobby?: string | null;
  xp?: number;
  current_wallet_balance?: number;
  followers_count?: number;
  following_count?: number;
  created_at?: string;
}

export type RootStackParamList = {
  Onboarding: undefined;
  Auth: undefined;
  Permissions: undefined;
  Main: { screen?: keyof MainTabParamList } | undefined;
  PostDetail: { id: string };
  UserProfile: { username: string };
  EditProfile: undefined;
  DailyReward: undefined;
  Menu: undefined;
  Chat: { threadId: string; title: string };
};

export type MainTabParamList = {
  Home: undefined;
  Explore: undefined;
  Leaderboard: undefined;
  Notifications: undefined;
  Messages: undefined;
  Profile: undefined;
};
