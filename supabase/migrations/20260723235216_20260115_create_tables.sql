/*
# Create full Blink schema — tables only

Creates all tables for the Blink social app. RLS policies and RPC are
applied in a follow-up migration to avoid forward-reference errors.
*/

-- ─── profiles ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  handle text NOT NULL DEFAULT '',
  name text NOT NULL DEFAULT '',
  full_name text NOT NULL DEFAULT '',
  avatar_url text,
  cover_url text,
  bio text,
  university text,
  faculty text,
  department text,
  level text,
  gender text,
  relationship_status text,
  phone text,
  hobby text,
  xp integer NOT NULL DEFAULT 0,
  current_wallet_balance integer NOT NULL DEFAULT 0,
  followers_count integer NOT NULL DEFAULT 0,
  following_count integer NOT NULL DEFAULT 0,
  points integer NOT NULL DEFAULT 0,
  last_reward_claimed_at timestamptz,
  reward_streak integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─── posts ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL DEFAULT '',
  image_url text,
  likes_count integer NOT NULL DEFAULT 0,
  comments_count integer NOT NULL DEFAULT 0,
  shares_count integer NOT NULL DEFAULT 0,
  tag text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_posts_author_id ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);

-- ─── comments ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON public.comments(author_id);

-- ─── follows ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (follower_id, following_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON public.follows(following_id);

-- ─── tags ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  post_count integer NOT NULL DEFAULT 0
);

-- ─── threads ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ─── thread_members ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.thread_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.threads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (thread_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_thread_members_thread_id ON public.thread_members(thread_id);
CREATE INDEX IF NOT EXISTS idx_thread_members_user_id ON public.thread_members(user_id);

-- ─── messages ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.threads(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON public.messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);

-- ─── notifications ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'system',
  title text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  data jsonb,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);

-- ─── push_tokens ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.push_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token text NOT NULL,
  platform text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, platform)
);