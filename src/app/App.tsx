import { View, Text } from "react-native";
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from "react-router";
import { HomeScreen } from "./components/HomeScreen";
import { ExploreScreen } from "./components/ExploreScreen";
import LeaderboardScreen from "./components/LeaderboardScreen";
import { NotificationsScreen } from "./components/NotificationsScreen";
import { MessagesScreen } from "./components/MessagesScreen";
import { ProfileScreen } from "./components/ProfileScreen";
import { UserProfilePage } from "./components/UserProfilePage";
import { MenuOverlay } from "./components/MenuOverlay";
import { AuthScreen } from "./components/AuthScreen";
import { PostsProvider } from "./PostsContext";
import { AuthProvider, useAuth } from "./context/AuthContext";

// ─── Layouts & Wrappers ───────────────────────────────────────────────────────

function MobileShell() {
  return (
    <View className="min-h-dvh bg-gray-100 flex items-center justify-center">
      <View
        className="relative flex flex-col bg-white overflow-hidden shadow-2xl"
        style={{
          width: "min(430px, 100vw)",
          height: "min(932px, 100dvh)",
          borderRadius: "clamp(0px, calc((100vw - 430px) * 999), 40px)",
        }}
      >
        <Outlet />
      </View>
    </View>
  );
}

function ProtectedRoute() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 h-full bg-gray-100 flex items-center justify-center">
        <View className="text-sm text-gray-500">Loading Blink...</View>
      </View>
    );
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
}

function PlaceholderScreen({ label }: { label: string }) {
  return (
    <View className="flex flex-col items-center justify-center h-full gap-4 bg-background text-foreground">
      <View className="text-5xl">🚧</View>
      <Text className="text-lg font-bold">{label}</Text>
      <Text className="text-sm text-muted-foreground">Coming soon</Text>
      <a href="/home" className="mt-2 px-5 py-2 bg-foreground text-background rounded-full text-sm font-semibold hover:opacity-80 transition-opacity">
        Go Home
      </a>
    </View>
  );
}

// ─── Routing Configuration ────────────────────────────────────────────────────

const router = createBrowserRouter([
  {
    path: "/",
    element: <MobileShell />,
    children: [
      // Base redirect
      { index: true, element: <Navigate to="/home" replace /> },
      
      // Public Route
      { path: "auth", element: <AuthScreen /> },
      
      // Protected Routes
      {
        element: <ProtectedRoute />,
        children: [
          { path: "home", element: <HomeScreen /> },
          { path: "explore", element: <ExploreScreen /> },
          { path: "leaderboard", element: <LeaderboardScreen /> },
          { path: "notifications", element: <NotificationsScreen /> },
          { path: "messages", element: <MessagesScreen /> },
          { path: "profile", element: <ProfileScreen /> },
          { path: "profile/:username", element: <UserProfilePage /> },
          { path: "menu", element: <MenuOverlay /> },
          { path: "post/:id", element: <PlaceholderScreen label="Post" /> },
        ],
      },
      
      // Catch-all
      { path: "*", element: <Navigate to="/home" replace /> },
    ],
  },
]);

// ─── Main App Component ───────────────────────────────────────────────────────

export default function App() {
  return (
    <AuthProvider>
      <PostsProvider>
        <RouterProvider router={router} />
      </PostsProvider>
    </AuthProvider>
  );
}
