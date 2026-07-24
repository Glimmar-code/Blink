import { View } from "react-native";
import { Outlet, useLocation } from "react-router";
import { BottomNav } from "../components/BottomNav";
import { DailyRewardModal } from "../components/DailyRewardModal";

export function MobileLayout() {
  const location = useLocation();

  // Define which paths should display the bottom navigation bar
  const mainPages = ["/home", "/explore", "/leaderboard", "/notifications", "/messages"];
  const showBottomNav = mainPages.includes(location.pathname);

  return (
    <View className="flex flex-col h-screen w-full max-w-md mx-auto bg-gray-50 overflow-hidden border-x border-gray-200 relative">

      {/* Scrollable Content Container */}
      <View className="flex-1 overflow-y-auto w-full base-scroll-container">
        <Outlet />
      </View>

      {/* Pinned Bottom Navigation Bar */}
      {showBottomNav && <BottomNav />}

      {/* Daily login reward popup — auto-eligible based on cooldown */}
      <DailyRewardModal />

    </View>
  );
}