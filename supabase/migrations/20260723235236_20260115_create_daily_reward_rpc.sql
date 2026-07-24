/*
# Create claim_daily_reward RPC

Atomically grants 50 points, bumps the streak, and records the claim
timestamp in a single round-trip. SECURITY DEFINER, granted to authenticated.
*/

CREATE OR REPLACE FUNCTION public.claim_daily_reward(p_user_id uuid)
RETURNS TABLE (new_points integer, new_streak integer, claimed_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_now timestamptz := now();
  v_last timestamptz;
  v_streak integer;
  v_points integer;
BEGIN
  SELECT last_reward_claimed_at, reward_streak, points
    INTO v_last, v_streak, v_points
    FROM public.profiles
   WHERE id = p_user_id
   FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found for user %', p_user_id;
  END IF;

  IF v_last IS NOT NULL AND v_last > v_now - interval '24 hours' THEN
    RAISE EXCEPTION 'Reward already claimed within the last 24 hours';
  END IF;

  v_streak := COALESCE(v_streak, 0) + 1;
  v_points := COALESCE(v_points, 0) + 50;

  UPDATE public.profiles
     SET points = v_points,
         reward_streak = v_streak,
         last_reward_claimed_at = v_now
   WHERE id = p_user_id;

  RETURN QUERY SELECT v_points, v_streak, v_now;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_daily_reward(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.claim_daily_reward(uuid) TO authenticated;