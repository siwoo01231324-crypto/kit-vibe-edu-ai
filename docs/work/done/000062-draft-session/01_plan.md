# [#62] feat: 수업 초안에서 다음 세션 자동 생성 — 구현 계획

> 작성: 2026-04-10 | ralplan consensus (Planner → Architect → Critic)

---

## 완료 기준

- [ ] 수업 초안 생성 후 "AI 세션 생성" 버튼이 ClassDraftPanel 하단에 표시된다
- [ ] 버튼 클릭 시 AI가 추출한 세션 제목·문항·정답 목록을 미리 볼 수 있는 확인 모달이 열린다
- [ ] 확인 클릭 시 세션과 문항이 자동 생성되고 편집 페이지(`/teacher/sessions/{id}/edit`)로 이동한다
- [ ] 초안의 weak_concepts 기반으로 문항 3~5개를 자동 추출·등록한다

---

## 구현 계획

### 설계 결정 (RALPLAN-DR)

**Architect synthesis 채택** — `/api/class-draft/generate`는 기존 마크다운만 반환 유지.  
`/api/sessions/from-draft`가 캐시된 초안을 입력으로 AI tool use → 세션+문항 트랜잭션 삽입.

**이유:** 마크다운(교안)과 structured_questions(퀴즈 스키마)는 생명주기가 다름.  
파싱 실패 격리, 재생성 유연성, 마크다운 표시 안정성 확보.

**미리보기 패턴:** 2-step API
1. `POST /api/sessions/from-draft/preview` — AI 호출, DB 미저장, 미리보기 데이터 반환
2. `POST /api/sessions/from-draft` — AI 호출 없음, 미리보기 데이터 받아 DB 트랜잭션 삽입

---

### Guardrails

**Must Have:**
- `/api/class-draft/generate` 응답 기존 그대로 유지 (content 필드만, 변경 없음)
- 문항 3~5개 검증 (Zod, 초과/미만 시 400)
- 세션+문항 원자적 생성 (문항 삽입 실패 시 세션 롤백)
- 소유권 체크 (teacher_id === user.id) 모든 엔드포인트
- AI tool use / structured output으로 JSON 스키마 강제

**Must NOT:**
- 기존 `/api/sessions` POST 시그니처 변경 금지
- `class_drafts` 테이블에 `structured_questions` 컬럼 추가 금지 (불필요)
- `ClassDraftPanel` props 파괴적 변경 금지

---

### 실행 순서

```
[1] /api/sessions/from-draft/preview 엔드포인트 (AI 호출, DB 미저장)
        ↓
[2] /api/sessions/from-draft 엔드포인트 (AI 없음, DB 트랜잭션 삽입)
        ↓
[3] ClassDraftPanel UI — 버튼 + DraftSessionConfirmModal
        ↓
[4] 호출처 업데이트 + 타입 체크
```

---

### Step 1. `/api/sessions/from-draft/preview` (AC#2, #4)

**파일:**
- `apps/web/src/app/api/sessions/from-draft/preview/route.ts` (신규)
- `apps/web/src/lib/prompts/draft-questions.ts` (신규)

**동작:**
- Body: `{ source_session_id: uuid }`
- 인증 + 소유권 검증
- `class_drafts` + `ai_insights` 조회 (weak_concepts 포함)
- Claude tool use 호출 — tool schema: `{ title: string, questions: [{content, options: [×4], correct_answer: 0..3}] }`, 문항 3~5개 강제
- DB 저장 없이 생성된 `{ title, questions }` 반환

**Acceptance:**
- 권한 없는 사용자 → 403
- 초안/인사이트 없는 세션 → 404
- 응답에 title + questions 3~5개 포함

---

### Step 2. `/api/sessions/from-draft` (AC#3)

**파일:**
- `apps/web/src/app/api/sessions/from-draft/route.ts` (신규)

**동작:**
- Body: `{ source_session_id: uuid, title: string, questions: Question[] }`
- 인증 + 소유권 검증 + Zod 검증 (문항 3~5개)
- `generateUniqueJoinCode()`로 join_code 생성
- source session에서 subject/grade 복사
- `sessions` INSERT → `questions` bulk INSERT (question_order 0..n)
- 문항 삽입 실패 시 세션 DELETE 후 500
- 성공 시 `{ id }` 반환

**Acceptance:**
- 유효하지 않은 payload → 400
- 성공 시 sessions 1개 + questions N개 생성
- 실패 시 orphan session 없음

---

### Step 3. `ClassDraftPanel` UI (AC#1, #2, #3)

**파일:**
- `apps/web/src/components/dashboard/ClassDraftPanel.tsx` (수정)
- `apps/web/src/components/dashboard/DraftSessionConfirmModal.tsx` (신규)

**동작:**
- props에 `sourceSessionId: string` 추가 (기존 `content` 유지)
- "AI 세션 생성" 버튼 — 초안 하단에 표시
- 버튼 클릭 → `POST /preview` 호출(로딩) → 모달 오픈
- 모달: 편집 가능한 title + 문항 목록(정답 표시)
- "확인" → `POST /from-draft` → `router.push('/teacher/sessions/{id}/edit')`
- 로딩/에러 상태, 중복 클릭 방지

**Acceptance:**
- 버튼이 초안 하단에 표시됨
- 모달에 문항 3~5개 렌더됨
- 확인 후 편집 페이지 이동
- 에러 시 사용자에게 메시지 표시

---

### Step 4. 호출처 업데이트

**파일:**
- `ClassDraftPanel` 사용처 (insights/teacher 페이지) — `sourceSessionId` prop 전달

**동작:**
- 부모 컴포넌트에서 `session.id` → `sourceSessionId`로 전달
- 타입 체크/린트 통과 확인

---

## 변경 파일 목록

| 파일 | 작업 |
|------|------|
| `apps/web/src/app/api/sessions/from-draft/preview/route.ts` | 신규 |
| `apps/web/src/app/api/sessions/from-draft/route.ts` | 신규 |
| `apps/web/src/lib/prompts/draft-questions.ts` | 신규 |
| `apps/web/src/components/dashboard/ClassDraftPanel.tsx` | 수정 |
| `apps/web/src/components/dashboard/DraftSessionConfirmModal.tsx` | 신규 |
| `ClassDraftPanel` 사용처 (insights 페이지) | 수정 |
