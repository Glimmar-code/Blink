export interface AuthProfile {
  id: string;
  email: string;
  username: string;
  full_name: string;
  avatar_url: string;
  cover_url: string;
  bio: string;
  university: string;
  level: string;
  department: string;
  gender: string;
  relationship: string;
  phone: string;
  hobbies: string;
}

export type RootStackParamList = {
  Onboarding: undefined;
  Permissions: undefined;
  Auth: undefined;
  Main: undefined;
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
