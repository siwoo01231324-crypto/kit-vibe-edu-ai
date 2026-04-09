# feat: AI 인사이트 생성 API + InsightPanel (IU-02)

## 사용자 관점 목표
교사가 세션 결과 화면에서 "분석하기" 버튼을 누르면 AI 가 취약/강한 개념과 다음 수업 포커스를 제시한다.

## 배경
dev-spec §5 IU-02 — `POST /api/insights/generate`. 소유권 확인 + 캐시(있으면 기존 반환) + `aggregateResponses` + `callClaude` + zod 검증 + `ai_insights` INSERT. MSW 로 Claude mock.

## 완료 기준 (AC)
- [ ] `apps/web/src/app/api/insights/generate/route.ts` 구현
- [ ] zod body 검증 (`{session_id}`)
- [ ] 소유권 체크 실패 → 403, 미인증 → 401
- [ ] 이미 있는 insights → 캐시 반환 (Claude 미호출)
- [ ] `aggregateResponses` (#27) + `buildInsightsPrompt` (#36) 재사용
- [ ] zod 파싱 실패 → 500 + 에러 메시지
- [ ] `apps/web/src/components/dashboard/InsightPanel.tsx` — 카드 3종 (weak/strong/next_focus)
- [ ] 통합 테스트 TEST-IU2-I01~I04 (성공/캐시/403/파싱 실패) — MSW Claude mock 사용
- [ ] `apps/web/tests/setup.ts` 에 MSW 서버 설정 추가

## 구현 플랜
1. RED: `apps/web/tests/integration/api/insights-generate.test.ts` (MSW 포함)
2. GREEN: API Route + 서비스 함수
3. UI 패널 + 대시보드 통합 (#31 InsightPanel 슬롯에 바인딩)

## 환경 세팅
- MSW 설치: `npm i -D msw`
- `apps/web/.env.local` ANTHROPIC_API_KEY 존재 확인 (#36 에서 세팅)

## 의존성
- 선행: #27, #31, #36
- 병렬 가능: **#38** (수업 초안, 동일 AI 레이어 재사용 독립)

## 참고
- dev-spec §5 IU-02 전체
- dev-spec §6.3 MSW 설정

## 개발 체크리스트
- [ ] 통합 테스트 코드 작성 (Vitest + MSW)
- [ ] `apps/web/src/app/api/insights/.ai.md`, `apps/web/src/components/dashboard/.ai.md` 최신화
- [ ] `docs/ai-report/daily-log.md` 기록 (불변식 1)
- [ ] AI 생성 코드 인간 검토 후 커밋 (불변식 2)
- [ ] 불변식 위반 없음



## 작업 내역

