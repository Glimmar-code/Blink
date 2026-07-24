-- Optional but recommended: atomic "claim daily reward" RPC.
-- Grants DAILY_XP points, bumps the streak, and records the claim time
-- in a single round-trip so the UI never double-counts.
-- Run after the columns from 20260115_daily_reward.sql exist.

create or replace function public.claim_daily_reward(p_user_id uuid)
returns table (new_points integer, new_streak integer, claimed_at timestamptz)
language plpgsql
security definer
as $$
declare
  v_now timestamptz := now();
  v_last timestamptz;
  v_streak integer;
  v_points integer;
begin
  select last_reward_claimed_at, reward_streak, points
    into v_last, v_streak, v_points
    from public.profiles
   where id = p_user_id
   for update;

  if not found then
    raise exception 'Profile not found for user %', p_user_id;
  end if;

  if v_last is not null and v_last > v_now - interval '24 hours' then
    raise exception 'Reward already claimed within the last 24 hours';
  end if;

  v_streak := coalesce(v_streak, 0) + 1;
  v_points := coalesce(v_points, 0) + 50;

  update public.profiles
     set points = v_points,
         reward_streak = v_streak,
         last_reward_claimed_at = v_now
   where id = p_user_id;

  return query select v_points, v_streak, v_now;
end;
$$;

revoke all on function public.claim_daily_reward(uuid) from public;
grant execute on function public.claim_daily_reward(uuid) to authenticated;
