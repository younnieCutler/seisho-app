-- Migration 004: feed_posts에 nickname 컬럼 추가
-- P6 소그룹 기능 — 멤버 닉네임 표시용

ALTER TABLE feed_posts ADD COLUMN nickname TEXT;
