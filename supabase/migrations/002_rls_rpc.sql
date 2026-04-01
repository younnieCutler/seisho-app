-- =====================
-- analytics_events RLS
-- =====================
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- 자신의 이벤트만 INSERT 가능
CREATE POLICY "users insert own analytics"
  ON analytics_events FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 자신의 이벤트만 SELECT 가능
CREATE POLICY "users read own analytics"
  ON analytics_events FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- =====================
-- feed_posts RLS (P6 준비)
-- =====================
ALTER TABLE feed_posts ENABLE ROW LEVEL SECURITY;

-- 그룹 멤버만 피드 조회 가능
CREATE POLICY "group members read feed"
  ON feed_posts FOR SELECT
  TO authenticated
  USING (
    group_code IN (
      SELECT group_code FROM member_status
      WHERE user_id = auth.uid()
    )
  );

-- 자신의 포스트만 INSERT 가능
CREATE POLICY "users insert own posts"
  ON feed_posts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- =====================
-- member_status RLS (P6 준비)
-- =====================
ALTER TABLE member_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users manage own status"
  ON member_status FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =====================
-- generate_group_code RPC
-- =====================
CREATE OR REPLACE FUNCTION generate_group_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  code    text;
  attempt int := 0;
BEGIN
  LOOP
    code := upper(substring(md5(random()::text) from 1 for 6));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM groups WHERE group_code = code);
    attempt := attempt + 1;
    IF attempt >= 10 THEN
      RAISE EXCEPTION 'code_gen_failed';
    END IF;
  END LOOP;
  RETURN code;
END;
$$;
