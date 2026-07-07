-- Adds daily-reward tracking + XP/points counter to the profiles table.
-- Run this in the Supabase SQL editor or via `supabase db push`.

alter table public.profiles
  add column if not exists points integer not null default 0,
  add column if not exists last_reward_claimed_at timestamptz null,
  add column if not exists reward_streak integer not null default 0;
