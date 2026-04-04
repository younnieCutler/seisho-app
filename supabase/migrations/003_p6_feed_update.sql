-- supabase/migrations/003_p6_feed_update.sql

-- 1. content 제약 150 → 1000자
ALTER TABLE feed_posts DROP CONSTRAINT IF EXISTS feed_posts_content_check;
ALTER TABLE feed_posts
  ADD CONSTRAINT feed_posts_content_length_check
  CHECK (char_length(content) <= 1000);

-- 2. upsert용 UNIQUE 제약 (user_id + group_code + date)
ALTER TABLE feed_posts
  ADD CONSTRAINT feed_posts_user_group_date_unique
  UNIQUE (user_id, group_code, date);

-- 3. UPDATE RLS (자신의 포스트만 수정 가능)
CREATE POLICY "users update own posts"
  ON feed_posts FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
