-- groups: 소그룹 (P6에서 사용)
CREATE TABLE IF NOT EXISTS groups (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_code  text NOT NULL UNIQUE,
  created_by  uuid NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- member_status: 소그룹 멤버 읽기 현황 (P6에서 사용)
CREATE TABLE IF NOT EXISTS member_status (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL,
  group_code     text NOT NULL,
  joined_at      timestamptz NOT NULL DEFAULT now(),
  last_read_date date,
  UNIQUE (user_id, group_code)
);
CREATE INDEX idx_member_status_group_date ON member_status(group_code, last_read_date);

-- feed_posts: 소그룹 나눔 피드 (P6에서 사용)
CREATE TABLE IF NOT EXISTS feed_posts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_code  text NOT NULL,
  user_id     uuid NOT NULL,
  content     text NOT NULL CHECK (char_length(content) <= 150),
  date        date NOT NULL DEFAULT CURRENT_DATE,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_feed_posts_group_date ON feed_posts(group_code, date);

-- analytics_events: 독서 완료 이벤트 (P5에서 사용)
CREATE TABLE IF NOT EXISTS analytics_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL,
  event_type  text NOT NULL,
  event_data  jsonb,
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT valid_event_type CHECK (event_type IN ('verse_read', 'share', 'group_join'))
);
CREATE INDEX idx_analytics_events_user ON analytics_events(user_id, created_at);
