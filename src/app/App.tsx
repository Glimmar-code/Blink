import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { HomeScreen } from "./components/HomeScreen";
import { ExploreScreen } from "./components/ExploreScreen";
import { LeaderboardScreen } from "./components/LeaderboardScreen";
import { NotificationsScreen } from "./components/NotificationsScreen";
import { MessagesScreen } from "./components/MessagesScreen";
import { ProfileScreen } from "./components/ProfileScreen";
import { UserProfilePage } from "./components/UserProfilePage";
import { MenuOverlay } from "./components/MenuOverlay";
import { AuthScreen } from "./components/AuthScreen";
import { BottomNav } from "./components/BottomNav";
import { PostsProvider } from "./PostsContext";
import { AuthProvider, useAuth } from "./context/AuthContext";

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
function AppContent() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-dvh bg-gray-100 flex items-center justify-center">
        <div className="text-sm text-gray-500">Loading…</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <PostsProvider>
        <MobileShell>
          <Routes>
            <Route index element={<Navigate to={session ? "/home" : "/auth"} replace />} />
            <Route path="/auth" element={session ? <Navigate to="/home" replace /> : <AuthScreen />} />
            <Route path="/home" element={session ? <HomeScreen /> : <Navigate to="/auth" replace />} />
            <Route path="/explore" element={session ? <ExploreScreen /> : <Navigate to="/auth" replace />} />
            <Route path="/leaderboard" element={session ? <LeaderboardScreen /> : <Navigate to="/auth" replace />} />
            <Route path="/notifications" element={session ? <NotificationsScreen /> : <Navigate to="/auth" replace />} />
            <Route path="/messages" element={session ? <MessagesScreen /> : <Navigate to="/auth" replace />} />
            <Route path="/profile" element={session ? <ProfileScreen /> : <Navigate to="/auth" replace />} />
            <Route path="/profile/:username" element={session ? <UserProfilePage /> : <Navigate to="/auth" replace />} />
            <Route path="/menu" element={session ? <MenuOverlay /> : <Navigate to="/auth" replace />} />
            <Route path="/post/:id" element={session ? <PlaceholderScreen label="Post" /> : <Navigate to="/auth" replace />} />
            <Route path="*" element={<Navigate to={session ? "/home" : "/auth"} replace />} />
          </Routes>
        </MobileShell>
      </PostsProvider>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
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