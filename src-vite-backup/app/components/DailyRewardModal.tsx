import { View, Text } from "react-native";
import { useNavigate } from "react-router";
import { useDailyReward, DAILY_XP } from "../hooks/useDailyReward";

/**
 * DailyRewardModal
 *
 * Pops up after a user finishes onboarding (or whenever the daily-reward
 * cooldown has elapsed) and lets them claim +50 XP that flows into the
 * leaderboard / season reward. Tapping "Later" simply dismisses the
 * modal for this session; it will re-appear once the 24h cooldown
 * elapses.
 */
export function DailyRewardModal() {
  const navigate = useNavigate();
  const { eligible, claiming, claimReward, dismiss, streak, lastClaimedAt } =
    useDailyReward();

  if (!eligible) return null;

  const handleClaim = async () => {
    const result = await claimReward();
    if (result.ok) {
      navigate("/leaderboard");
    }
  };

  const handleLater = () => {
    dismiss();
  };

  return (
    <View
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 100,
      }}
      className="absolute inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
    >
      <View className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center">
        <View className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
          <Text className="text-4xl">🎁</Text>
        </View>

        <Text className="text-2xl font-bold text-gray-900 mb-2">
          Claim your daily login reward
        </Text>
        <Text className="text-gray-500 mb-6 leading-relaxed">
          Open the app every day to build your streak and earn XP towards
          the season leaderboard.
        </Text>

        <View className="flex flex-row items-center justify-center gap-6 mb-8">
          <View className="flex flex-col items-center">
            <Text className="text-3xl font-extrabold text-yellow-500">
              +{DAILY_XP}
            </Text>
            <Text className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">
              XP
            </Text>
          </View>
          <View className="w-px h-10 bg-gray-200" />
          <View className="flex flex-col items-center">
            <Text className="text-3xl font-extrabold text-orange-500">
              {streak + 1}🔥
            </Text>
            <Text className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">
              Streak
            </Text>
          </View>
        </View>

        {lastClaimedAt ? (
          <Text className="text-xs text-gray-400 mb-4">
            Last claimed {new Date(lastClaimedAt).toLocaleString()}
          </Text>
        ) : null}

        <View className="flex flex-col gap-3 w-full">
          <button
            type="button"
            disabled={claiming}
            onClick={handleClaim}
            className="w-full bg-black text-white font-semibold py-4 rounded-xl active:scale-95 transition-transform disabled:opacity-50"
          >
            {claiming ? "Claiming…" : "Claim"}
          </button>
          <button
            type="button"
            onClick={handleLater}
            className="w-full bg-transparent text-gray-500 font-semibold py-4 rounded-xl hover:bg-gray-50 active:scale-95 transition-all"
          >
            Later
          </button>
        </View>
      </View>
    </View>
  );
}
