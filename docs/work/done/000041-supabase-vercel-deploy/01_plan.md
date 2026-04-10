# [#41] 시드 데이터 + Supabase 원격 + Vercel 배포 + 데모 준비 — 구현 계획

> 작성: 2026-04-10 | 버전: v2 (Critic ITERATE 피드백 5건 전부 반영)

---

## Principles

1. **Option B 원칙 (AI 호출은 실시간)** — `ai_insights`, `class_drafts`는 시드하지 않는다. 데모 당일 실제 AI API 호출이 INSERT를 수행한다. 시드는 세션/문항/응답까지만.
2. **handle_new_user 트리거 존중** — `teachers` 테이블에 직접 INSERT하지 않는다. 교사는 로그인 시 트리거가 자동 생성하며, 시드에서는 로그인 후 `UPDATE`로 school 등 추가 필드만 설정한다.
3. **psql 변수 템플릿화** — 고정 UUID를 하드코딩하지 않는다. `:teacher_uuid` 등 psql 변수(`\set` / `-v`)를 사용하여 환경별 재사용 가능하게 한다.
4. **데모 재현성** — seed.sql + manual-deploy-guide.md + demo-script.md 3종 세트로 누구든 동일한 데모를 재현할 수 있어야 한다.
5. **최소 변경 원칙** — 기존 스키마/마이그레이션/앱 코드는 건드리지 않는다. 추가 파일만 생성한다.

---

## Options 비교

| 옵션 | 설명 | Pros | Cons | 판정 |
|------|------|------|------|------|
| **A: 전체 시드 (AI 포함)** | sessions + questions + responses + ai_insights + class_drafts 모두 시드 | 데모 시 AI 호출 불필요, 빠름 | `ai_insights.session_id UNIQUE` / `class_drafts.session_id UNIQUE` 제약으로 실제 AI 호출 시 충돌; 실제 AI 기능 시연 불가 | **기각** — UNIQUE 충돌 + AI 기능 미시연 |
| **B: 부분 시드 (AI 제외)** | sessions + questions + responses만 시드, AI는 데모 당일 실시간 호출 | UNIQUE 제약 충돌 없음; 실제 AI 기능 시연 가능; 제품 가치 입증 | AI 호출 실패 시 데모 중단 리스크 | **채택** — 폴백 스크립트로 리스크 완화 |
| **C: 시드 없음 (전부 실시간)** | 데모 시 교사가 처음부터 세션 생성 + 문항 입력 + 학생 응답 | 완전한 리얼 플로우 | 3분 데모 시간 초과 확실; 학생 응답 20개 수동 입력 비현실적 | **기각** — 시간 제약 위반 |

---

## Risks

| 리스크 | 영향도 | 완화책 |
|--------|--------|--------|
| AI API 호출 실패 (Anthropic 장애/할당 초과) | 높음 | `demo-script.md`에 폴백 시나리오 포함 + `supabase/fallback-ai-seed.sql` 스크립트 준비 |
| Supabase 원격 프로젝트 연결 실패 | 중간 | `manual-deploy-guide.md`에 트러블슈팅 섹션 포함; 로컬 Supabase로 폴백 |
| Google OAuth 리디렉션 미설정 | 중간 | 가이드에 OAuth 콜백 URL 설정 단계 명시; Magic Link 폴백 안내 |
| 데모 세션 status가 'active'가 아님 | 높음 | seed.sql에서 `status='active'` 명시 (responses_anon_insert_active RLS 정책 충족) |
| psql 변수 미주입으로 seed 실패 | 중간 | seed.sql 상단에 변수 미설정 시 에러 메시지 출력하는 가드 코드 추가 |

---

## 구현 계획

### Phase 0: 스키마 확인 (완료)

이미 확인된 사항:
- `teachers.id REFERENCES auth.users(id) ON DELETE CASCADE` — teachers는 auth.users에 종속
- `handle_new_user` 트리거: 로그인 시 `ON CONFLICT (id) DO NOTHING`으로 teacher row 자동 생성
- `ai_insights.session_id UNIQUE` — 시드 후 AI 호출 시 충돌
- `class_drafts.session_id UNIQUE` — 동일
- `responses_anon_insert_active` RLS: `sessions.status='active'`일 때만 anon INSERT 허용

### Phase 1: seed.sql 작성 — 세션 + 문항 + 응답만 (AI 구현)

**변경 파일:** `supabase/seed.sql` (기존 플레이스홀더 전면 교체)

**구체적 단계:**

1. **psql 변수 가드 추가**
   - 파일 상단에 `:teacher_uuid` 변수가 설정되었는지 검증하는 `DO $$ ... $$` 블록 작성
   - 미설정 시 명확한 에러 메시지 (`RAISE EXCEPTION 'teacher_uuid 변수를 설정하세요'`)

2. **teachers INSERT 하지 않음** (Critic 수정 #4)
   - `handle_new_user` 트리거가 로그인 시 자동 생성하므로 seed에서 INSERT 불필요
   - 대신: `UPDATE public.teachers SET school = '서울시 OO초등학교' WHERE id = :'teacher_uuid';`
   - 주석으로 "로그인 후 실행하세요" 명시

3. **데모 세션 1개 생성**
   - `INSERT INTO public.sessions` — `teacher_id = :'teacher_uuid'`, `status = 'active'`, `join_code = 'DEMO-001'`
   - session UUID는 `gen_random_uuid()` 사용 후 `RETURNING id`로 변수 바인딩 (CTE 활용)

4. **문항 5개 생성**
   - 초등 수학/과학 주제 (데모에 적합한 쉬운 문항)
   - `question_order` 1~5, `correct_answer` 인덱스 지정
   - CTE로 session_id 참조

5. **응답 25개 생성** (학생 5명 x 문항 5개)
   - 닉네임 5명 (예: '지민', '서연', '민준', '하윤', '도현')
   - 정답률 60~80% 분포 (AI 인사이트가 의미 있는 분석을 생성하도록)
   - `response_time_ms` 1000~8000 범위
   - `score` 계산 포함

6. **ai_insights, class_drafts INSERT 없음** (Critic 수정 #1)
   - 주석으로 "AI 호출이 실시간 생성합니다" 명시

**AC 연결:** `supabase/seed.sql` — 데모 세션 1개 + 문항 5개 + 응답 25개

**주의사항:**
- 고정 UUID 사용 금지 — 모든 참조는 `:teacher_uuid` psql 변수 또는 CTE `RETURNING` 활용 (Critic 수정 #2)
- `sessions.status = 'active'` 필수 — RLS 정책 충족

---

### Phase 2: 사용자 수동 작업 가이드 (AI 구현)

**생성 파일:** `docs/demo/manual-deploy-guide.md`

**구체적 단계:**

1. **Supabase 원격 프로젝트 설정 가이드**
   - 프로젝트 생성 (이름, 리전, DB 비밀번호)
   - `supabase link --project-ref <ref>`
   - `supabase db push` (마이그레이션 적용)
   - Auth > Google Provider 활성화 + OAuth 클라이언트 ID/Secret 등록
   - OAuth 리디렉션 URI 설정: `https://<ref>.supabase.co/auth/v1/callback`

2. **psql 변수를 사용한 seed.sql 실행 방법** (Critic 수정 #2)
   - 방법 1: `psql "$DATABASE_URL" -v teacher_uuid="'실제-교사-auth-uuid'" -f supabase/seed.sql`
   - 방법 2: Supabase SQL Editor에서 `\set teacher_uuid '''실제-교사-auth-uuid'''` 후 `\i supabase/seed.sql`
   - teacher_uuid 얻는 방법: Supabase Dashboard > Auth > Users 에서 교사 계정 UUID 복사

3. **handle_new_user 트리거 상호작용 설명** (Critic 수정 #4)
   - 순서 명시: (1) 교사가 Google OAuth로 첫 로그인 -> (2) `handle_new_user` 트리거가 teachers row 자동 생성 (`ON CONFLICT DO NOTHING`) -> (3) seed.sql 실행 시 `UPDATE teachers SET school=... WHERE id=:'teacher_uuid'`로 추가 정보 설정
   - seed.sql은 teachers INSERT를 하지 않으며, 반드시 교사 로그인 이후 실행해야 함을 강조

4. **Vercel 배포 가이드**
   - `vercel` CLI 또는 GitHub 연동 import
   - 환경변수 5개 등록: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_BASE_URL`
   - `NEXT_PUBLIC_BASE_URL`은 Vercel 배포 후 할당된 URL로 설정
   - `master` 브랜치 자동 배포 설정

5. **트러블슈팅 섹션**
   - RLS 정책으로 인한 INSERT 실패 시 대응
   - OAuth 리디렉션 오류 시 대응
   - seed.sql 변수 미주입 오류 시 대응

**AC 연결:** Supabase 원격 + Vercel 배포 + 환경변수

---

### Phase 3: docs/demo/demo-script.md + 폴백 스크립트 (AI 구현)

**생성 파일:**
- `docs/demo/demo-script.md`
- `supabase/fallback-ai-seed.sql`

**구체적 단계:**

1. **3분 데모 타임라인** (Critic 수정 #5)

   | 시간 | 단계 | 행위 | 예상 소요 |
   |------|------|------|-----------|
   | 0:00~0:20 | 인트로 | 프로젝트 소개 + 라이브 URL 접속 | 20초 |
   | 0:20~0:50 | 교사 로그인 | Google OAuth 로그인 + 대시보드 확인 | 30초 |
   | 0:50~1:20 | 세션 확인 | 시드된 데모 세션 선택 + 문항/응답 확인 | 30초 |
   | 1:20~1:50 | AI 인사이트 | "AI 분석 생성" 클릭 + 결과 확인 | 30초 |
   | 1:50~2:20 | 수업 초안 | "수업 초안 생성" 클릭 + 결과 확인 | 30초 |
   | 2:20~2:50 | 학생 플로우 | 새 탭에서 join_code로 학생 입장 시연 | 30초 |
   | 2:50~3:00 | 마무리 | 핵심 가치 요약 + Q&A 안내 | 10초 |

2. **각 단계별 상세 스크립트**
   - 화면에서 클릭할 위치, 예상 결과, 말할 멘트 포함
   - 스크린샷 캡처 포인트 표시

3. **폴백 시나리오** (Critic 수정 #5)
   - **AI 호출 실패 시:** `supabase/fallback-ai-seed.sql` 실행하여 사전 준비된 ai_insights + class_drafts INSERT
   - **네트워크 장애 시:** 사전 녹화된 백업 영상으로 전환
   - **OAuth 실패 시:** Magic Link 이메일 로그인으로 전환

4. **폴백 SQL 스크립트 생성** (`supabase/fallback-ai-seed.sql`)
   - ai_insights 샘플 JSON + class_drafts 샘플 마크다운
   - `:teacher_uuid` psql 변수 사용 (일관성)
   - session_id는 seed.sql에서 생성한 세션의 join_code로 조회하여 참조
   - 주석: "정상 플로우에서는 사용하지 않음. AI API 장애 시에만 실행"

**AC 연결:** `docs/demo/demo-script.md` — 3분 데모 스크립트 + 타임라인 + 폴백

---

### Phase 4: README.md + .env.example 업데이트 (AI 구현)

**변경 파일:**
- `README.md` (루트)
- `apps/web/.env.example`

**구체적 단계:**

1. **README.md에 라이브 데모 섹션 추가**
   - 라이브 URL 플레이스홀더: `https://<your-vercel-url>.vercel.app`
   - 로컬 실행 방법 (기존 내용 보존 + 보강)
   - 배포 가이드 링크: `docs/demo/manual-deploy-guide.md`
   - 데모 스크립트 링크: `docs/demo/demo-script.md`

2. **apps/web/.env.example 보강**
   - `NEXT_PUBLIC_BASE_URL` 추가 (현재 누락)
   - 운영 환경용 주석 추가 (Supabase 원격 URL 형식 안내)

**AC 연결:** `README.md`에 라이브 URL + 실행 방법 추가

---

### Phase 5: docs/demo/.ai.md (AI 구현)

**생성 파일:** `docs/demo/.ai.md`

**구체적 단계:**

1. **디렉토리 목적/구조/역할 기술**
   - 목적: 공모전 제출용 데모 자산 (스크립트, 배포 가이드)
   - 구조: `demo-script.md`, `manual-deploy-guide.md`
   - 역할: 데모 재현성 보장, 배포 절차 문서화

**AC 연결:** `docs/demo/.ai.md` 작성 (레포 규칙 4)

---

## Guardrails

### Must Have
- [ ] seed.sql에 `ai_insights`, `class_drafts` INSERT 없음 (Option B)
- [ ] seed.sql이 psql 변수 (`:teacher_uuid`)를 사용하며 고정 UUID 없음
- [ ] seed.sql에 `teachers` INSERT 없음 (handle_new_user 트리거 존중)
- [ ] 데모 세션 `status = 'active'` (RLS 정책 충족)
- [ ] 응답 20개 이상, 정답률 60~80% 분포
- [ ] manual-deploy-guide.md에 psql 변수 주입 방법 명시
- [ ] manual-deploy-guide.md에 handle_new_user 트리거 상호작용 순서 명시
- [ ] demo-script.md에 단계별 타임라인 (예상 소요시간) 포함
- [ ] demo-script.md에 폴백 시나리오 + 폴백 SQL 스크립트 포함
- [ ] `NEXT_PUBLIC_BASE_URL` 환경변수가 .env.example에 추가

### Must NOT Have
- [ ] seed.sql에 ai_insights/class_drafts 행 (UNIQUE 충돌 방지)
- [ ] seed.sql에 하드코딩된 UUID (재사용성 파괴)
- [ ] seed.sql에 teachers INSERT (트리거 중복)
- [ ] 기존 마이그레이션 파일 수정
- [ ] 기존 앱 코드 (.ts, .tsx) 수정
- [ ] .env.local 또는 실제 키 커밋

---

## Verification

| 검증 항목 | 방법 | 기대 결과 |
|-----------|------|-----------|
| seed.sql 문법 | `psql -v teacher_uuid="'test-uuid'" -f supabase/seed.sql` (로컬 Supabase) | 에러 없이 완료 |
| ai_insights/class_drafts 부재 | `grep -c 'INSERT.*ai_insights\|INSERT.*class_drafts' supabase/seed.sql` | 0건 |
| 고정 UUID 부재 | `grep -cP '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}' supabase/seed.sql` | 0건 |
| psql 변수 사용 | `grep -c 'teacher_uuid' supabase/seed.sql` | 1건 이상 |
| teachers INSERT 부재 | `grep -c 'INSERT INTO.*teachers' supabase/seed.sql` | 0건 |
| 데모 세션 status | `grep 'active' supabase/seed.sql` | 'active' 포함 |
| 응답 개수 | seed.sql 내 responses INSERT 행 수 카운트 | 20개 이상 |
| 타임라인 존재 | demo-script.md 내 시간/소요 테이블 존재 | 7개 행 이상 |
| 폴백 스크립트 존재 | `ls supabase/fallback-ai-seed.sql` | 파일 존재 |
| .env.example 보강 | `grep 'NEXT_PUBLIC_BASE_URL' apps/web/.env.example` | 1건 |
| .ai.md 존재 | `ls docs/demo/.ai.md` | 파일 존재 |

---

## Critic 수정 지시 반영 추적

| # | 수정 지시 | 반영 위치 | 상태 |
|---|-----------|-----------|------|
| 1 | seed.sql에서 ai_insights/class_drafts 제거 | Phase 1 단계 6, Guardrails Must NOT Have, Verification | 반영 완료 |
| 2 | seed.sql을 psql 변수 템플릿화 | Phase 1 단계 1-2, Phase 2 단계 2, Principles #3 | 반영 완료 |
| 3 | 01_plan.md 보강 (Principles, Options, Risks, Verification) | Principles, Options 비교, Risks, Verification 섹션 | 반영 완료 |
| 4 | handle_new_user 트리거 상호작용 명시 | Phase 1 단계 2, Phase 2 단계 3, Principles #2 | 반영 완료 |
| 5 | 검증 AC 구체화 (타임라인 + 폴백) | Phase 3 단계 1-4, Guardrails | 반영 완료 |

---

## RALPLAN-DR 요약

### Principles (5)
1. Option B (AI 제외 시드) — UNIQUE 제약 충돌 방지 + 실제 AI 시연
2. handle_new_user 트리거 존중 — teachers 직접 INSERT 금지
3. psql 변수 템플릿화 — 환경별 재사용성
4. 데모 재현성 — 3종 세트 (seed + guide + script)
5. 최소 변경 — 기존 코드 불변

### Decision Drivers (3)
1. `ai_insights.session_id UNIQUE` / `class_drafts.session_id UNIQUE` 제약 -> AI 시드 불가
2. `handle_new_user` 트리거 존재 -> teachers 직접 INSERT 불필요 및 위험
3. 3분 데모 시간 제약 -> 사전 시드된 응답 데이터 필수

### Options
- **Option A (전체 시드):** 기각 — UNIQUE 제약 충돌 + AI 미시연
- **Option B (부분 시드):** 채택 — 충돌 없음 + AI 실시연 + 폴백으로 리스크 완화
- **Option C (시드 없음):** 기각 — 3분 데모 시간 초과

### ADR

- **Decision:** Option B (세션/문항/응답만 시드, AI는 실시간 호출)
- **Drivers:** UNIQUE 제약, 트리거 존재, 데모 시간 제약
- **Alternatives considered:** Option A (전체 시드), Option C (시드 없음)
- **Why chosen:** UNIQUE 충돌 없이 실제 AI 기능을 시연할 수 있는 유일한 방법. 폴백 스크립트로 AI 장애 리스크 완화.
- **Consequences:** 데모 시 AI API 호출 필요 (30초 소요 예상). 네트워크/API 장애 시 폴백 SQL 실행 필요.
- **Follow-ups:** 데모 리허설에서 AI 호출 시간 측정 -> 30초 초과 시 타임라인 조정 검토.

---

## 생성/변경 파일 요약

| 파일 | 작업 | Phase |
|------|------|-------|
| `supabase/seed.sql` | 전면 교체 | 1 |
| `supabase/fallback-ai-seed.sql` | 신규 생성 | 3 |
| `docs/demo/manual-deploy-guide.md` | 신규 생성 | 2 |
| `docs/demo/demo-script.md` | 신규 생성 | 3 |
| `README.md` | 라이브 데모 섹션 추가 | 4 |
| `apps/web/.env.example` | `NEXT_PUBLIC_BASE_URL` 추가 | 4 |
| `docs/demo/.ai.md` | 신규 생성 | 5 |
