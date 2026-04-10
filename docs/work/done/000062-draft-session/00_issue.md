# feat: 수업 초안에서 다음 세션 자동 생성

## 사용자 관점 목표
교사는 AI 인사이트와 수업 초안 생성 후, 별도 입력 없이 \"AI 세션 생성\" 버튼 하나로 다음 수업 퀴즈 세션과 문항을 자동으로 세팅할 수 있다.

## 배경
현재 수업 초안 생성 후 교사가 직접 새 세션을 만들고 문항을 수동 입력해야 한다. 인사이트 기반으로 자동 생성하면 흐름이 끊기지 않는다.

## 완료 기준
- [x] 수업 초안 생성 후 "AI 세션 생성" 버튼이 ClassDraftPanel 하단에 표시된다
- [x] 버튼 클릭 시 AI가 추출한 세션 제목·문항·정답 목록을 미리 볼 수 있는 확인 모달이 열린다
- [x] 확인 클릭 시 세션과 문항이 자동 생성되고 편집 페이지(`/teacher/sessions/{id}/edit`)로 이동한다
- [x] 초안의 weak_concepts 기반으로 문항 3~5개를 자동 추출·등록한다

## 구현 플랜
1. `/api/class-draft/generate` 응답에 structured questions 추가 (제목·문항·정답)
2. `ClassDraftPanel`에 "AI 세션 생성" 버튼 + 확인 모달 추가
3. `/api/sessions/from-draft` 엔드포인트 — 세션 + 문항 일괄 생성
4. 생성 후 `/teacher/sessions/{id}/edit` 리디렉트

## 개발 체크리스트
- [ ] 테스트 코드 포함
- [ ] 해당 디렉토리 .ai.md 최신화
- [ ] 불변식 위반 없음


## 작업 내역

### 2026-04-10

**현황**: 4/4 완료
**완료된 항목**: 전체 AC 달성
**변경 파일**: 8개 (신규 5개, 수정 3개)

**구현 내역:**
- `apps/web/src/lib/prompts/draft-questions.ts` (신규) — Claude tool use 스키마 + buildDraftQuestionsPrompt 함수. weak_concepts 기반 4지선다 3~5개 생성 지시
- `apps/web/src/app/api/sessions/from-draft/preview/route.ts` (신규) — AI 호출, DB 미저장. draft+insights 병렬 조회 후 Claude tool use로 문항 생성
- `apps/web/src/app/api/sessions/from-draft/route.ts` (신규) — AI 없음, DB 트랜잭션 삽입. source session에서 subject/grade 복사, questions bulk INSERT, 실패 시 세션 롤백
- `apps/web/src/components/dashboard/DraftSessionConfirmModal.tsx` (신규) — preview 캐시 + AbortController, 편집 가능 title, 문항 미리보기, 생성 버튼
- `apps/web/src/components/dashboard/ClassDraftPanel.tsx` (수정) — sourceSessionId prop 추가, "AI 세션 생성" 버튼 + 모달 연결, onCreated 시 편집 페이지 라우팅
- `apps/web/src/app/teacher/sessions/[id]/insights/page.tsx` (수정) — sourceSessionId prop 전달
- `apps/web/src/components/dashboard/SessionDetailClient.tsx` (수정) — 👍👎 배지 및 thumbsStats 상태/useEffect 제거
- `apps/web/src/lib/prompts/insights.ts` (수정) — parseInsightResponse에 코드 펜스 제거 처리 추가

**기술적 결정:**
- 2-step API 패턴: preview(AI 호출, 미리보기) → from-draft(DB만, 원자적 생성). `/api/class-draft/generate` 기존 계약 유지
- Architect synthesis 채택: 마크다운 초안과 structured questions의 생명주기 분리

