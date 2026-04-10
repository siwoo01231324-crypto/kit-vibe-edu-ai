# 작업 플랜 — #60 E2E 통합 테스트 및 버그 수정

## 현황 (2026-04-09)

### 완료된 항목 (master에 이미 반영)
- [x] thumbs_feedback RLS: ended 세션도 INSERT 허용 (migration 00005)
- [x] Supabase migration 00005 로컬 적용
- [x] react-markdown 패키지 설치
- [x] insights 페이지: InsightPanel + 수업 초안 통합
- [x] SessionDetailClient: ended 세션에 AI 인사이트 링크 추가
- [x] parseInsightResponse: 코드블록 제거 처리 추가

### 미완성 항목
- [ ] AI 인사이트 생성 500 에러 — 추가 원인 확인 및 수정
- [ ] 수업 초안 생성 E2E 검증
- [ ] 학생 따봉 피드백 코멘트 저장 확인

## 작업 브랜치
`feat/000060-e2e-bugfix`

## 참고
- `apps/web/.env.local` — ANTHROPIC_API_KEY 필수
- `supabase/migrations/` — migration 00005까지 로컬 적용 완료
