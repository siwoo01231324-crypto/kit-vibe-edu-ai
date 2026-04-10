# chore: Playwright E2E 시나리오 3종 (교사/학생/AI 플로우)

## 목적
공모전 데모 시나리오 3종을 Playwright E2E 로 자동화해 회귀를 방지한다.

## 배경
dev-spec §6.6 E2E 테스트 목록 — E2E-01(교사 플로우), E2E-02(학생 플로우), E2E-03(AI 기능 플로우). Chromium 단일 브라우저.

## 완료 기준 (AC)
- [x] `apps/web/tests/e2e/teacher-flow.spec.ts` (E2E-01): 로그인 → 세션 생성 → 문항 3개 → 활성화 → QR 표시
- [x] `apps/web/tests/e2e/student-flow.spec.ts` (E2E-02): join_code → 닉네임 → 응답 → 정답 애니메이션 → 리더보드에 본인 닉네임
- [x] `apps/web/tests/e2e/ai-flow.spec.ts` (E2E-03): 인사이트 생성 → weak_concepts 카드 렌더링 → 초안 생성 → 마크다운 표시
- [x] 다중 학생 시나리오 TEST-IU1-E02 포함 (3개 컨텍스트 동시 응답)
- [x] `npm run e2e` 전부 통과 (7/7, 15.7s)
- [x] Claude API 는 MSW 또는 테스트 전용 mock handler 로 대체 (MOCK_CLAUDE=1 분기)

## 구현 플랜
1. 테스트용 Supabase seed (`supabase/seed.sql`) 작성: 테스트 교사, 세션, 문항
2. Playwright auth storage state (교사 로그인 세션 저장)
3. 3개 시나리오 작성 + `test.describe.parallel` 구성
4. CI 에서 `webServer` 로 `npm run dev` 자동 구동

## 환경 세팅
- `npx playwright install chromium` 1회 실행 (#22 에서 이미 수행)
- Supabase 로컬 실행 중 필수 (`supabase start`)
- 테스트 전용 교사 계정 (seed 에 포함)

## 의존성
- 선행: #30, #34, #35, #38 (모든 핵심 feat 완료 필요)
- 병렬 가능: **#40** (CI 파이프라인과 병렬 작성 가능)

## 참고
- dev-spec §6.6 E2E 테스트 목록
- dev-spec §6.3 Playwright 설정
- dev-spec §7.4 공모전 제출 체크리스트

## 개발 체크리스트
- [x] E2E 테스트 코드 작성 (Playwright)
- [x] `apps/web/tests/e2e/.ai.md` 작성
- [x] `docs/ai-report/daily-log.md` 기록 (불변식 1)
- [x] AI 생성 테스트 인간 검토 후 커밋 (불변식 2)
- [x] 불변식 위반 없음


---

## 작업 내역

### 2026-04-10

**현황**: 6/6 완료 — `npm run e2e` 7/7 통과
**완료된 항목**:
- teacher-flow.spec.ts (E2E-01) ✓
- student-flow.spec.ts (E2E-02 + TEST-IU1-E02) ✓
- ai-flow.spec.ts (E2E-03) ✓
- npm run e2e 전부 통과 (7 passed, 15.7s) ✓
- Claude API mock 대체 (MOCK_CLAUDE=1) ✓
- docs/ai-report/daily-log.md 업데이트 ✓
**변경 파일**: 8개 (신규 6개 + 수정 3개)
**디버깅 노트**: animate-burst 대신 animate-float-up 사용 (React 배치 렌더로 currentQuestion 전진 후 버튼 DOM 사라짐)

