ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

-- 멤버만 조회 가능
CREATE POLICY "members can view groups" ON groups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM member_status
      WHERE member_status.group_code = groups.group_code
        AND member_status.user_id = auth.uid()
    )
  );

-- 인증된 사용자는 그룹 생성 가능
CREATE POLICY "authenticated users can create groups" ON groups
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 생성자만 삭제 가능
CREATE POLICY "creator can delete group" ON groups
  FOR DELETE USING (created_by = auth.uid());
