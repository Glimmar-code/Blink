import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { HomeScreen } from "./components/HomeScreen";
import { ExploreScreen } from "./components/ExploreScreen";
import { LeaderboardScreen } from "./components/LeaderboardScreen";
import { NotificationsScreen } from "./components/NotificationsScreen";
import { MessagesScreen } from "./components/MessagesScreen";
import { ProfileScreen } from "./components/ProfileScreen";
import { UserProfilePage } from "./components/UserProfilePage";
import { MenuOverlay } from "./components/MenuOverlay";
import { BottomNav } from "./components/BottomNav";
import { PostsProvider } from "./PostsContext";

function MobileShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-gray-100 flex items-center justify-center">
      <div
        className="relative flex flex-col bg-white overflow-hidden shadow-2xl"
        style={{
          width: "min(430px, 100vw)",
          height: "min(932px, 100dvh)",
          borderRadius: "clamp(0px, calc((100vw - 430px) * 999), 40px)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// Placeholder screens for other routes
export default function App() {
  return (
    <BrowserRouter>
      <PostsProvider>
      <MobileShell>
        <Routes>
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<HomeScreen />} />
          <Route path="/explore" element={<ExploreScreen />} />
          <Route path="/leaderboard" element={<LeaderboardScreen />} />
          <Route path="/notifications" element={<NotificationsScreen />} />
          <Route path="/messages" element={<MessagesScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/profile/:username" element={<UserProfilePage />} />
          <Route path="/menu" element={<MenuOverlay />} />
          <Route path="/post/:id" element={<PlaceholderScreen label="Post" />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </MobileShell>
      </PostsProvider>
    </BrowserRouter>
  );
}

function PlaceholderScreen({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 bg-background text-foreground">
      <div className="text-5xl">🚧</div>
      <p className="text-lg font-bold">{label}</p>
      <p className="text-sm text-muted-foreground">Coming soon</p>
      <a href="/home" className="mt-2 px-5 py-2 bg-foreground text-background rounded-full text-sm font-semibold hover:opacity-80 transition-opacity">
        Go Home
      </a>
    </div>
  );
}