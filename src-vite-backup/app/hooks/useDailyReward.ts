import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../context/AuthContext";

/**
 * Daily login reward system.
 *
 * Rules:
 *  - A user becomes eligible to claim once every REWARD_COOLDOWN_HOURS hours.
 *  - When eligible, `eligible` flips to true and the consumer UI should
 *    surface the DailyRewardModal.
 *  - claimReward() grants DAILY_XP, updates the leaderboard score,
 *    bumps the streak, and resets the cooldown by writing
 *    last_reward_claimed_at = now().
 *  - dismiss() just hides the modal for the current session; the modal
 *    will pop again on the next eligible visit.
 */
export const DAILY_XP = 50;
export const REWARD_COOLDOWN_HOURS = 24;

const COOLDOWN_MS = REWARD_COOLDOWN_HOURS * 60 * 60 * 1000;

function isEligibleSince(lastClaimed: string | null | undefined): boolean {
  if (!lastClaimed) return true;
  const last = new Date(lastClaimed).getTime();
  if (Number.isNaN(last)) return true;
  return Date.now() - last >= COOLDOWN_MS;
}

export function useDailyReward() {
  const { user, profile, refreshProfile } = useAuth();
  const [eligible, setEligible] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [lastClaimedAt, setLastClaimedAt] = useState<string | null>(null);
  const [streak, setStreak] = useState<number>(0);

  // Recompute eligibility whenever the profile / user changes.
  useEffect(() => {
    if (!user || !profile) {
      setEligible(false);
      return;
    }
    const claimed = (profile as any).last_reward_claimed_at as string | null | undefined;
    setLastClaimedAt(claimed ?? null);
    setStreak(Number((profile as any).reward_streak ?? 0));
    setEligible(isEligibleSince(claimed));
  }, [user, profile]);

  const claimReward = useCallback(async (): Promise<{ ok: boolean; newPoints?: number; error?: string }> => {
    if (!user) return { ok: false, error: "Not signed in" };
    if (claiming) return { ok: false, error: "Already claiming" };

    setClaiming(true);
    try {
      const currentPoints = Number((profile as any)?.points ?? 0);
      const currentStreak = Number((profile as any)?.reward_streak ?? 0);
      const newPoints = currentPoints + DAILY_XP;
      const newStreak = currentStreak + 1;
      const nowIso = new Date().toISOString();

      // Try the secure RPC path first (atomic, single round-trip).
      const rpc = await supabase.rpc("claim_daily_reward", { p_user_id: user.id });
      if (!rpc.error && rpc.data) {
        setLastClaimedAt(nowIso);
        setStreak(newStreak);
        setEligible(false);
        await refreshProfile();
        return { ok: true, newPoints };
      }

      // Fallback: optimistic update if the RPC isn't installed yet.
      const { error } = await supabase
        .from("profiles")
        .update({
          points: newPoints,
          last_reward_claimed_at: nowIso,
          reward_streak: newStreak,
        })
        .eq("id", user.id);

      if (error) {
        return { ok: false, error: error.message };
      }

      setLastClaimedAt(nowIso);
      setStreak(newStreak);
      setEligible(false);
      await refreshProfile();
      return { ok: true, newPoints };
    } catch (e: any) {
      return { ok: false, error: e?.message ?? "Unknown error" };
    } finally {
      setClaiming(false);
    }
  }, [user, profile, claiming, refreshProfile]);

  const dismiss = useCallback(() => {
    setEligible(false);
  }, []);

  return {
    eligible,
    claiming,
    lastClaimedAt,
    streak,
    claimReward,
    dismiss,
    DAILY_XP,
  };
}
