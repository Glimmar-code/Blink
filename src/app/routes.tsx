import { createBrowserRouter } from "react-router";
import { MobileLayout } from "./layouts/MobileLayout";
import { AuthScreen } from "./components/AuthScreen";
import { OnboardingModal } from "./components/OnboardingModal";
import { HomeScreen } from "./components/HomeScreen";
import { MenuOverlay } from "./components/MenuOverlay";
import { PostDetailScreen } from "./components/PostDetailScreen";
import { ProfileScreen } from "./components/ProfileScreen";
import { ExploreScreen } from "./components/ExploreScreen";
import { LeaderboardScreen } from "./components/LeaderboardScreen";
import { NotificationsScreen } from "./components/NotificationsScreen";
import { MessagesScreen } from "./components/MessagesScreen";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: MobileLayout,
    children: [
      { index: true, Component: AuthScreen },
      { path: "onboarding", Component: OnboardingModal },
      { path: "home", Component: HomeScreen },
      { path: "menu", Component: MenuOverlay },
      { path: "post/:id", Component: PostDetailScreen },
      { path: "profile", Component: ProfileScreen },
      { path: "explore", Component: ExploreScreen },
      { path: "leaderboard", Component: LeaderboardScreen },
      { path: "notifications", Component: NotificationsScreen },
      { path: "messages", Component: MessagesScreen },
      // Catch-all route just redirects to home for now
      { path: "*", Component: HomeScreen },
    ],
  },
]);