/*
# Enable RLS and create policies for all Blink tables

## Security
- RLS enabled on every table.
- profiles: any authenticated user can SELECT (social app); only owner can
  INSERT/UPDATE/DELETE.
- posts / comments: any authenticated user can SELECT; only author can
  INSERT/UPDATE/DELETE.
- follows: users can see follows where they are follower or following; only
  the follower can INSERT/DELETE.
- tags: any authenticated user can SELECT/INSERT/UPDATE.
- threads / thread_members / messages: users can only access threads they
  are a member of.
- notifications: only the owner can SELECT/UPDATE/DELETE; any authenticated
  user can INSERT (so other users can trigger notifications).
- push_tokens: only the owner can CRUD.
*/

-- ─── profiles ────────────────────────────────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- ─── posts ────────────────────────────────────────────────────────────────────

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "posts_select_all" ON public.posts;
CREATE POLICY "posts_select_all" ON public.posts FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "posts_insert_own" ON public.posts;
CREATE POLICY "posts_insert_own" ON public.posts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "posts_update_own" ON public.posts;
CREATE POLICY "posts_update_own" ON public.posts FOR UPDATE
  TO authenticated USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "posts_delete_own" ON public.posts;
CREATE POLICY "posts_delete_own" ON public.posts FOR DELETE
  TO authenticated USING (auth.uid() = author_id);

-- ─── comments ─────────────────────────────────────────────────────────────────

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "comments_select_all" ON public.comments;
CREATE POLICY "comments_select_all" ON public.comments FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "comments_insert_own" ON public.comments;
CREATE POLICY "comments_insert_own" ON public.comments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "comments_update_own" ON public.comments;
CREATE POLICY "comments_update_own" ON public.comments FOR UPDATE
  TO authenticated USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "comments_delete_own" ON public.comments;
CREATE POLICY "comments_delete_own" ON public.comments FOR DELETE
  TO authenticated USING (auth.uid() = author_id);

-- ─── follows ──────────────────────────────────────────────────────────────────

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "follows_select_participant" ON public.follows;
CREATE POLICY "follows_select_participant" ON public.follows FOR SELECT
  TO authenticated USING (auth.uid() = follower_id OR auth.uid() = following_id);

DROP POLICY IF EXISTS "follows_insert_follower" ON public.follows;
CREATE POLICY "follows_insert_follower" ON public.follows FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "follows_delete_follower" ON public.follows;
CREATE POLICY "follows_delete_follower" ON public.follows FOR DELETE
  TO authenticated USING (auth.uid() = follower_id);

-- ─── tags ─────────────────────────────────────────────────────────────────────

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tags_select_all" ON public.tags;
CREATE POLICY "tags_select_all" ON public.tags FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "tags_insert_auth" ON public.tags;
CREATE POLICY "tags_insert_auth" ON public.tags FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "tags_update_auth" ON public.tags;
CREATE POLICY "tags_update_auth" ON public.tags FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- ─── threads ──────────────────────────────────────────────────────────────────

ALTER TABLE public.threads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "threads_select_member" ON public.threads;
CREATE POLICY "threads_select_member" ON public.threads FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.thread_members
      WHERE thread_members.thread_id = threads.id
        AND thread_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "threads_insert_auth" ON public.threads;
CREATE POLICY "threads_insert_auth" ON public.threads FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "threads_update_member" ON public.threads;
CREATE POLICY "threads_update_member" ON public.threads FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.thread_members
      WHERE thread_members.thread_id = threads.id
        AND thread_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "threads_delete_member" ON public.threads;
CREATE POLICY "threads_delete_member" ON public.threads FOR DELETE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.thread_members
      WHERE thread_members.thread_id = threads.id
        AND thread_members.user_id = auth.uid()
    )
  );

-- ─── thread_members ───────────────────────────────────────────────────────────

ALTER TABLE public.thread_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "thread_members_select_member" ON public.thread_members;
CREATE POLICY "thread_members_select_member" ON public.thread_members FOR SELECT
  TO authenticated USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.thread_members tm
      WHERE tm.thread_id = thread_members.thread_id
        AND tm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "thread_members_insert_own" ON public.thread_members;
CREATE POLICY "thread_members_insert_own" ON public.thread_members FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "thread_members_delete_own" ON public.thread_members;
CREATE POLICY "thread_members_delete_own" ON public.thread_members FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ─── messages ─────────────────────────────────────────────────────────────────

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "messages_select_member" ON public.messages;
CREATE POLICY "messages_select_member" ON public.messages FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.thread_members
      WHERE thread_members.thread_id = messages.thread_id
        AND thread_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "messages_insert_sender" ON public.messages;
CREATE POLICY "messages_insert_sender" ON public.messages FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "messages_update_sender" ON public.messages;
CREATE POLICY "messages_update_sender" ON public.messages FOR UPDATE
  TO authenticated USING (auth.uid() = sender_id) WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "messages_delete_sender" ON public.messages;
CREATE POLICY "messages_delete_sender" ON public.messages FOR DELETE
  TO authenticated USING (auth.uid() = sender_id);

-- ─── notifications ────────────────────────────────────────────────────────────

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_insert_auth" ON public.notifications;
CREATE POLICY "notifications_insert_auth" ON public.notifications FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_delete_own" ON public.notifications;
CREATE POLICY "notifications_delete_own" ON public.notifications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ─── push_tokens ──────────────────────────────────────────────────────────────

ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "push_tokens_select_own" ON public.push_tokens;
CREATE POLICY "push_tokens_select_own" ON public.push_tokens FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "push_tokens_insert_own" ON public.push_tokens;
CREATE POLICY "push_tokens_insert_own" ON public.push_tokens FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "push_tokens_update_own" ON public.push_tokens;
CREATE POLICY "push_tokens_update_own" ON public.push_tokens FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "push_tokens_delete_own" ON public.push_tokens;
CREATE POLICY "push_tokens_delete_own" ON public.push_tokens FOR DELETE
  TO authenticated USING (auth.uid() = user_id);