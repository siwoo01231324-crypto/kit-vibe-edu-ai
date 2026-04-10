# 작업 플랜 — #60 E2E 통합 테스트 및 버그 수정

## 현황 (2026-04-10)

### 완료된 항목 (master에 이미 반영)
- [x] thumbs_feedback RLS: ended 세션도 INSERT 허용 (migration 00005)
- [x] Supabase migration 00005 로컬 적용
- [x] react-markdown 패키지 설치
- [x] insights 페이지: InsightPanel + 수업 초안 통합
- [x] SessionDetailClient: ended 세션에 AI 인사이트 링크 추가
- [x] parseInsightResponse: 코드블록 제거 처리 추가

### 완료된 항목 (2026-04-10 추가)
- [x] AI 인사이트 생성 500 에러 원인 수정
  - Claude API 에러 원문을 그대로 throw하여 실패 원인 추적 가능하도록 변경
  - insights 생성 API 에러 응답에 message 필드 추가
  - Claude 응답이 JSON 코드블록으로 감싸인 경우에도 파싱되도록 수정 (parseInsightResponse)
- [x] 수업 초안 마크다운 렌더링 개선
  - remark-gfm 플러그인 설치 및 ClassDraftPanel에 적용
  - 표·체크박스·취소선 등 GFM 문법 정상 렌더링
- [x] 퀴즈 결과 화면 따봉 피드백 UI 분리
  - quiz/[sessionId]/page.tsx에서 thumbs 관련 상태·로직·UI 제거
- [x] 학생·교사 전체 흐름 E2E 테스트 추가
  - student-flow.spec.ts, teacher-flow.spec.ts 신규 작성
  - BASE_URL 환경변수로 로컬/스테이징 전환 지원
  - playwright.config.ts: ignoreHTTPSErrors, reuseExistingServer 개선
  - smoke 테스트 heading 텍스트 현행화 ("Kit Vibe Edu")
  - 공통 헬퍼(supabase-admin.ts) 및 테스트용 로그인 API 추가

### 미완성 항목
- [ ] 수업 초안 생성 E2E 검증 (스테이징 환경에서 추가 확인 필요)
- [ ] 학생 따봉 피드백 코멘트 저장 확인

## 작업 브랜치
`feat/000060-e2e-bugfix`

## 참고
- `apps/web/.env.local` — ANTHROPIC_API_KEY 필수
- `supabase/migrations/` — migration 00005까지 로컬 적용 완료
