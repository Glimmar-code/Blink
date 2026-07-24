/*
# Blink Engagement — Views, Points, Profile Views, Comment Replies

## What this adds (only what is missing from the existing schema)

### Modified Tables
- profiles: + points integer DEFAULT 0 (live leaderboard score)
- posts: + saves_count integer DEFAULT 0
- statuses: + likes_count integer DEFAULT 0, + replies_count integer DEFAULT 0

### New enum value
- interaction_type_enum: + 'share' value (existing: like, repost, save)

### New Tables
1. post_views — records every scroll-through view with badge-weighted counts
   - view_weight: 1 = None tier, 2 = Standard (blue tick), 3 = Gold/Elite (yellow tick)
2. profile_views — every time a user visits another user's public profile
3. point_transactions — full audit log of every points event
4. comment_replies — nested replies under a comment

### New RPCs
- award_points(p_user_id, p_action_type, p_reference_id)
  Points per action: view_post=1, like_post=1, comment=2, save_post=2,
  share_post=2, like_comment=2, reply_comment=2, like_status=3,
  create_status=5, message_user=5, reply_status=5, create_post=15
- record_post_view(p_post_id, p_viewer_id)
  Inserts post_view, increments posts.views_count by badge weight, awards 1 point

### New View
- leaderboard_live — real-time rank of all profiles ordered by points
*/

-- ─── Add points to profiles ───────────────────────────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'points'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN points integer NOT NULL DEFAULT 0;
  END IF;
END $$;

-- ─── Add saves_count to posts ─────────────────────────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'posts' AND column_name = 'saves_count'
  ) THEN
    ALTER TABLE public.posts ADD COLUMN saves_count integer NOT NULL DEFAULT 0;
  END IF;
END $$;

-- ─── Add likes_count and replies_count to statuses ────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'statuses' AND column_name = 'likes_count'
  ) THEN
    ALTER TABLE public.statuses ADD COLUMN likes_count integer NOT NULL DEFAULT 0;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'statuses' AND column_name = 'replies_count'
  ) THEN
    ALTER TABLE public.statuses ADD COLUMN replies_count integer NOT NULL DEFAULT 0;
  END IF;
END $$;

-- ─── Add 'share' to interaction_type_enum if missing ─────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'interaction_type_enum' AND e.enumlabel = 'share'
  ) THEN
    ALTER TYPE public.interaction_type_enum ADD VALUE 'share';
  END IF;
END $$;

-- ─── post_views ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.post_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  viewer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  view_weight integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_post_views_post_id ON public.post_views(post_id);
CREATE INDEX IF NOT EXISTS idx_post_views_viewer_id ON public.post_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_post_views_created_at ON public.post_views(created_at DESC);

ALTER TABLE public.post_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "post_views_select_all" ON public.post_views;
CREATE POLICY "post_views_select_all" ON public.post_views FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "post_views_insert_own" ON public.post_views;
CREATE POLICY "post_views_insert_own" ON public.post_views FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = viewer_id);

-- ─── profile_views ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profile_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  viewer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profile_views_profile_id ON public.profile_views(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewer_id ON public.profile_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_created_at ON public.profile_views(created_at DESC);

ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profile_views_select_own_profile" ON public.profile_views;
CREATE POLICY "profile_views_select_own_profile" ON public.profile_views FOR SELECT
  TO authenticated USING (auth.uid() = profile_id OR auth.uid() = viewer_id);

DROP POLICY IF EXISTS "profile_views_insert_own" ON public.profile_views;
CREATE POLICY "profile_views_insert_own" ON public.profile_views FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = viewer_id);

-- ─── point_transactions ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.point_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  points_delta integer NOT NULL,
  reference_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_point_transactions_user_id ON public.point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_created_at ON public.point_transactions(created_at DESC);

ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "point_transactions_select_own" ON public.point_transactions;
CREATE POLICY "point_transactions_select_own" ON public.point_transactions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "point_transactions_insert_own" ON public.point_transactions;
CREATE POLICY "point_transactions_insert_own" ON public.point_transactions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- ─── comment_replies ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.comment_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL DEFAULT '',
  likes_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comment_replies_comment_id ON public.comment_replies(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_replies_author_id ON public.comment_replies(author_id);

ALTER TABLE public.comment_replies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "comment_replies_select_all" ON public.comment_replies;
CREATE POLICY "comment_replies_select_all" ON public.comment_replies FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "comment_replies_insert_own" ON public.comment_replies;
CREATE POLICY "comment_replies_insert_own" ON public.comment_replies FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "comment_replies_update_own" ON public.comment_replies;
CREATE POLICY "comment_replies_update_own" ON public.comment_replies FOR UPDATE
  TO authenticated USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "comment_replies_delete_own" ON public.comment_replies;
CREATE POLICY "comment_replies_delete_own" ON public.comment_replies FOR DELETE
  TO authenticated USING (auth.uid() = author_id);

-- ─── Live leaderboard view ────────────────────────────────────────────────────

CREATE OR REPLACE VIEW public.leaderboard_live AS
  SELECT
    p.id,
    p.handle,
    p.name,
    p.avatar_url,
    p.verification_tier,
    p.university,
    p.points,
    RANK() OVER (ORDER BY p.points DESC) AS rank,
    RANK() OVER (PARTITION BY p.university ORDER BY p.points DESC) AS campus_rank
  FROM public.profiles p;

-- ─── award_points RPC ─────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.award_points(
  p_user_id uuid,
  p_action_type text,
  p_reference_id uuid DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_delta integer;
  v_new_points integer;
BEGIN
  v_delta := CASE p_action_type
    WHEN 'view_post'      THEN 1
    WHEN 'like_post'      THEN 1
    WHEN 'comment'        THEN 2
    WHEN 'save_post'      THEN 2
    WHEN 'share_post'     THEN 2
    WHEN 'like_comment'   THEN 2
    WHEN 'reply_comment'  THEN 2
    WHEN 'like_status'    THEN 3
    WHEN 'create_status'  THEN 5
    WHEN 'message_user'   THEN 5
    WHEN 'reply_status'   THEN 5
    WHEN 'create_post'    THEN 15
    ELSE 0
  END;

  IF v_delta = 0 THEN
    RAISE EXCEPTION 'Unknown action_type: %', p_action_type;
  END IF;

  UPDATE public.profiles
     SET points = points + v_delta
   WHERE id = p_user_id
  RETURNING points INTO v_new_points;

  INSERT INTO public.point_transactions (user_id, action_type, points_delta, reference_id)
  VALUES (p_user_id, p_action_type, v_delta, p_reference_id);

  RETURN v_new_points;
END;
$$;

REVOKE ALL ON FUNCTION public.award_points(uuid, text, uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.award_points(uuid, text, uuid) TO authenticated;

-- ─── record_post_view RPC ─────────────────────────────────────────────────────
-- Badge-weighted view counting:
--   None (regular user) = 1, Standard (blue tick) = 2, Gold/Elite (yellow tick) = 3

CREATE OR REPLACE FUNCTION public.record_post_view(
  p_post_id uuid,
  p_viewer_id uuid
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_weight integer;
  v_new_views integer;
BEGIN
  SELECT CASE verification_tier::text
    WHEN 'Gold'   THEN 3
    WHEN 'Elite'  THEN 3
    WHEN 'Standard' THEN 2
    ELSE 1
  END
  INTO v_weight
  FROM public.profiles WHERE id = p_viewer_id;

  INSERT INTO public.post_views (post_id, viewer_id, view_weight)
  VALUES (p_post_id, p_viewer_id, COALESCE(v_weight, 1));

  UPDATE public.posts
     SET views_count = views_count + COALESCE(v_weight, 1)
   WHERE id = p_post_id
  RETURNING views_count INTO v_new_views;

  PERFORM public.award_points(p_viewer_id, 'view_post', p_post_id);

  RETURN v_new_views;
END;
$$;

REVOKE ALL ON FUNCTION public.record_post_view(uuid, uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.record_post_view(uuid, uuid) TO authenticated;
