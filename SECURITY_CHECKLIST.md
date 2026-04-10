# Seisho App Security Checklist

모바일 앱 배포 및 운영 환경(React Native / Supabase)에서 필수적으로 점검해야 할 보안 사항입니다.

## 1. 🔐 환경 변수 (Environment Variables)
- [ ] **.env 파일 관리**: `.env` 파일이 Git에 커밋되지 않도록 `.gitignore`에 확실히 포함되어 있는지 확인.
- [ ] **Service Role Key 노출 방지**: 클라이언트 앱 내에 절대로 `SUPABASE_SERVICE_ROLE_KEY`가 하드코딩되거나 `.env`를 통해 주입되지 않았는지 확인. (Expo 클라이언트에서는 `EXPO_PUBLIC_SUPABASE_ANON_KEY`만 사용해야 함)
- [ ] **.env.example 동기화**: 공동 개발을 위해 필요한 키 목록만 더미 데이터로 `.env.example`에 적어 관리.

## 2. 🗄 데이터베이스 보안 (Supabase)
- [ ] **RLS(Row Level Security) 활성화 여부**: 테이블(`groups`, `member_status`, `feed_posts` 등)에 RLS가 켜져 있는지 확인. (Supabase 대시보드 - Authentication - Policies)
- [ ] **정책(Policies) 검증**: 
  - [ ] 다른 그룹의 게시물을 읽을 수 없도록 `group members read feed` 정책이 정상 적용되었는지 확인.
  - [ ] 익명 사용자가 임의의 ID로 Post를 Insert 할 수 없도록 `user_id = auth.uid()` 규칙 검증.
- [ ] **익명 인증 의도 외 남용 방지**: 익명 사용자가 장기간 미사용 시, Supabase 설정 상 가비지 컬렉션(비인증 사용자 삭제) 정책 수립 필요성 검토.

## 3. 📱 클라이언트 보안 (React Native / Expo)
- [ ] **로컬 스토리지 (MMKV) 평문 저장**: 유저 식별자나 묵상 노트 외에 민감 정보(비밀번호, 주소 등)가 있다면 추가적인 암호화(Encryption) 플러그인 검토. (현재는 민감정보 없음)
- [ ] **사용자 입력 살균 (Input Sanitization)**: 닉네임이나 말씀 나눔 텍스트에 악의적 XSS나 SQL Injection이 불가능하도록 Supabase 쿼리단에서 Parametrized Query 사용 여부 확인 (Supabase Client는 기본적으로 이를 방어함).
- [ ] **디버깅 코드 제거**: Console에 유저 객체, 세션 토큰 등이 출력되는 디버깅 로그(`console.log(session)`)가 Product 빌드 전에 모두 제거되었는지 로직 확인.

## 4. 🪪 계정 및 탈퇴 처리
- [ ] **탈퇴 시 데이터 클린업**: 사용자가 캐시를 지우거나 그룹에서 탈퇴할 때, MMKV 또는 Supabase 테이블에서 해당 유저의 정보 및 연결 상태(`member_status`)가 완전히 파기되는지 확인.
