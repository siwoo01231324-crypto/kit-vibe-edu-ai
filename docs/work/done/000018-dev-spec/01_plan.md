# [#18] 기술 개발 명세 및 MVP 구현 계획 — 구현 계획

> 작성일: 2026-04-08
> Ralplan 컨센서스: Planner 초안 → Architect ITERATE → 피드백 반영 확정

---

## 완료 기준

- [ ] `docs/specs/dev-spec.md`에 기술 개발 명세가 작성되어 있다 (기술 스택, 아키텍처, API 설계, DB 스키마 포함)
- [ ] MVP 구현 계획이 구현 단위별 명확한 스펙(입력/출력/테스트 기준)과 함께 정의되어 있다
- [ ] 일론 머스크 5단계 원칙이 각 구현 단위에 적용되어 불필요한 복잡성이 사전 제거되어 있다
- [ ] TDD 테스트 전략(단위/통합/E2E)이 구현 단위별로 명시되어 있다
- [ ] MVP → 고도화 로드맵(Phase 1: MVP, Phase 2+: 확장)이 정의되어 있다
- [ ] `docs/specs/.ai.md`가 최신화되어 있다

---

## 구현 계획

### 핵심 원칙

1. **What→How 변환**: project-plan.md에 이미 있는 내용(기능 설명, 사용자 스토리, 데모 시나리오)을 반복하지 않는다. DDL, TypeScript 타입, API 스키마, 프롬프트 템플릿, RLS 정책, 테스트 케이스 등 **구현자가 바로 코딩에 들어갈 수 있는 수준의 상세**만 추가한다.
2. **일론 머스크 5단계**: 각 구현 단위에서 "의심한 요구사항 → 삭제한 것 → 단순화한 것"을 명시. 특히 F-01/F-02 통합 판단을 여기서 수행한다.
3. **TDD-first**: 테스트 목록이 구현보다 먼저 정의되어 executor가 Red-Green-Refactor를 따를 수 있어야 한다.
4. **1주 데드라인 현실성**: 04/13 마감 내 구현 가능한 수준으로만 명세. 과도한 명세 자체가 시간 낭비.
5. **상충 시 본 문서 우선**: project-plan.md 내 불일치(예: Next.js 14 vs 15)를 dev-spec에서 확정하며, 상충 시 dev-spec이 구현 기준이 된다.

### Guardrails

**Must Have:**
- DB 스키마 DDL (Supabase PostgreSQL) — 테이블, 컬럼, 타입, RLS 정책
- API 엔드포인트 — 경로, 메서드, Request/Response TypeScript 인터페이스
- 구현 단위별 입력/처리/출력/테스트 기준
- 일론 머스크 5단계 적용 결과 ("삭제한 것", "단순화한 것")
- AI 프롬프트 템플릿 (시스템 프롬프트 + 입출력 JSON 스키마)
- Supabase Realtime 채널 설계 (어떤 테이블의 어떤 이벤트를 누가 구독)
- TDD 테스트 전략 (단위/통합/E2E 목록)
- MVP → Phase 2+ 로드맵
- D1~D7 일별 구현 일정

**Must NOT Have:**
- 코드 구현 (이 이슈는 명세서 작성만)
- 기획서에 없는 새로운 기능 추가
- 오버엔지니어링 (마이크로서비스, GraphQL, Redis, 별도 WebSocket 서버 등)
- project-plan.md 내용의 단순 복사 — 링크로 참조

### 사전 결정 사항 (Architect 피드백 반영)

1. **Next.js 버전 확정: 15** — project-plan.md에서 14/15가 혼용되어 있으나, dev-spec에서 Next.js 15 (App Router)로 확정
2. **학생 엔티티 없음 (의도적)**: MVP에서 학생은 닉네임 기반 익명 참여. 별도 accounts 테이블 없음. 세션 간 학생 추적 불가 (Phase 2 로드맵에 마이그레이션 경로 포함)
3. **F-01(피드백 수집) + F-02(게이미피케이션) 통합**: 같은 화면의 같은 기능이므로 dev-spec에서는 하나의 구현 단위(IU-01)로 통합 — Elon 5-step "삭제" 원칙
4. **API Route vs Supabase Direct 경계**: 쓰기(INSERT/UPDATE)는 Supabase client SDK 직접, 읽기(실시간 구독)도 Supabase Realtime 직접. API Route는 AI 호출 + 복합 로직에만 사용

---

### Step 1: 프로젝트 구조 + 기술 스택 상세 명세

**대상 섹션**: dev-spec.md §1~§2

**작업 내용**:
- Next.js 15 App Router 기반 디렉토리 구조 정의
  ```
  app/
    (student)/    — 학생 퀴즈 게임 페이지
    (teacher)/    — 교사 대시보드
    api/          — AI 호출 등 서버 로직
  components/     — 공유 UI 컴포넌트
  lib/            — Supabase 클라이언트, 유틸리티
  types/          — TypeScript 타입 정의
  ```
- 의존성 목록 (npm 패키지 + 버전)
- 환경변수 `.env.local` 템플릿
- **"삭제한 기술" 목록** (5단계 원칙 적용):
  - Redux/Zustand → React useState + Supabase Realtime으로 충분
  - 별도 WebSocket 서버 → Supabase Realtime 내장
  - 별도 인증 서버 → Supabase Auth 내장
  - ORM(Prisma/Drizzle) → Supabase JS SDK로 충분 (30명 규모)
  - 별도 테스트 DB → Supabase 로컬 개발 환경

**완료 확인**:
- [ ] 디렉토리 구조가 라우트별로 정의됨
- [ ] 모든 npm 패키지가 버전과 함께 나열됨
- [ ] .env.local 템플릿 제공됨
- [ ] "삭제한 기술" 목록이 이유와 함께 명시됨

---

### Step 2: DB 스키마 DDL + API 엔드포인트 설계

**대상 섹션**: dev-spec.md §3~§4

**작업 내용 — DB 스키마**:

7개 테이블 DDL 작성 (Supabase PostgreSQL):

| 테이블 | 역할 | 핵심 컬럼 |
|--------|------|-----------|
| `teachers` | 교사 계정 (Supabase Auth profiles) | id (auth.uid FK), name, email, school |
| `sessions` | 수업/퀴즈 세션 | id, teacher_id, title, subject, grade, status, join_code |
| `questions` | 퀴즈 문항 | id, session_id, content, options (jsonb), correct_answer, order |
| `responses` | 학생 응답 | id, question_id, session_id, nickname, answer, is_correct, response_time_ms, score |
| `ai_insights` | AI 분석 결과 캐시 | id, session_id, insights (jsonb), created_at |
| `class_drafts` | AI 수업 초안 | id, session_id, content (markdown), created_at |
| `thumbs_feedback` | 따봉 피드백 | id, session_id, nickname, type (up/down), comment |

각 테이블에 RLS 정책 정의:
- teachers: 본인 row만 접근
- sessions/questions: 생성한 교사만 수정, 학생은 active 세션만 읽기
- responses: 학생은 본인 세션에 INSERT만, 교사는 자기 세션 전체 읽기
- ai_insights/class_drafts: 생성한 교사만 접근

**학생 엔티티 결정 (Architect 피드백)**:
- MVP에서 학생은 `responses.nickname`으로만 식별. 별도 테이블 없음.
- 리더보드는 세션 내 nickname 기준 집계. 세션 간 추적 불가 (의도적 제한).
- Phase 2 마이그레이션: `students` 테이블 추가 + `responses.student_id` FK 추가

**작업 내용 — API 엔드포인트**:

| 메서드 | 경로 | 용도 | 인증 |
|--------|------|------|------|
| POST | `/api/sessions` | 세션 생성 | 교사 |
| GET | `/api/sessions/[id]` | 세션 상세 조회 | 교사 |
| POST | `/api/sessions/[id]/activate` | 세션 활성화 (학생 참여 개시) | 교사 |
| POST | `/api/insights/generate` | AI 인사이트 생성 (Claude API 호출) | 교사 |
| POST | `/api/class-draft/generate` | 수업 초안 생성 (Claude API 호출) | 교사 |

**Supabase Direct (API Route 불필요)**:
- 퀴즈 문항 CRUD → Supabase client SDK + RLS
- 학생 응답 제출 → Supabase client SDK INSERT
- 따봉 피드백 제출 → Supabase client SDK INSERT
- 리더보드/대시보드 실시간 → Supabase Realtime 구독
- 세션 참여 (join_code로 세션 조회) → Supabase client SDK SELECT

**Supabase Realtime 채널 설계 (Architect 피드백)**:

| 채널 | 테이블 | 이벤트 | 구독자 | 용도 |
|------|--------|--------|--------|------|
| `session:{id}:responses` | responses | INSERT | 교사 + 학생 | 실시간 리더보드 업데이트 |
| `session:{id}:status` | sessions | UPDATE | 학생 | 세션 상태 변경 (시작/종료) 감지 |

**완료 확인**:
- [ ] 7개 테이블 CREATE TABLE DDL 작성됨
- [ ] RLS 정책이 테이블별로 정의됨
- [ ] API 엔드포인트별 Request/Response TypeScript 인터페이스 정의됨
- [ ] API Route vs Supabase Direct 경계가 명확함
- [ ] Realtime 채널·이벤트·구독자 매트릭스 작성됨

---

### Step 3: 구현 단위별 상세 명세

**대상 섹션**: dev-spec.md §5

5개 구현 단위(IU)로 재편 (F-01+F-02 통합):

| IU | PRD 매핑 | 명칭 |
|----|----------|------|
| IU-01 | F-01 + F-02 | 실시간 퀴즈 게임 (피드백 수집 + 게이미피케이션) |
| IU-02 | F-03 | AI 이해도 분석 |
| IU-03 | F-05 | 교사 대시보드 (실시간 집계 + 인사이트 표시) |
| IU-04 | F-04 | 다음 수업 초안 자동 생성 |
| IU-05 | F-06 | 수업/퀴즈 생성·관리 |
| IU-06 | F-10 | 따봉 업/다운 피드백 (부가) |

**각 IU에 포함할 내용**:
1. **입력(Input)**: 사용자 액션, API 요청 형태
2. **처리(Process)**: 핵심 로직 흐름 (의사코드 수준)
3. **출력(Output)**: UI 렌더링 결과 또는 API 응답
4. **5단계 원칙 적용**: "의심한 요구사항", "삭제한 것", "단순화한 것"
5. **테스트 기준**: 단위/통합 테스트 목록

**AI 프롬프트 설계 (IU-02, IU-04)**:
- 시스템 프롬프트 템플릿 (한국어, 교육 도메인 맥락)
- 입력 데이터 형식 (문항별 정답률, 응답시간, 오답 패턴)
- 출력 JSON 스키마 (구조화된 인사이트)
- 프롬프트 엔지니어링 원칙: 수치 중심, 교육 맥락 결합, 행동 가능한 제안, 검수 부담 최소화

**5단계 원칙 주요 적용 결과 (예상)**:
- F-01+F-02 통합 → 1개 구현 단위로 단순화 (삭제)
- 퀴즈 유형: MVP에서는 객관식만 (주관식, OX, 순서맞추기는 Phase 2) (단순화)
- 리더보드: 세션 내 단순 점수 순위만 (누적 랭킹은 Phase 2) (단순화)
- AI 분석: 세션 단위만 (학생 개인 분석은 Phase 2) (삭제)
- 수업 초안: 마크다운 텍스트만 (PPT/슬라이드 직접 생성은 삭제) (삭제)

**완료 확인**:
- [ ] IU-01~IU-06 각각에 입력/처리/출력/테스트 기준 명시됨
- [ ] AI 프롬프트 템플릿이 시스템 프롬프트 + 입출력 스키마까지 구체적임
- [ ] 각 IU에 5단계 "삭제/단순화" 결과가 명시됨

---

### Step 4: TDD 테스트 전략 + MVP→고도화 로드맵

**대상 섹션**: dev-spec.md §6~§7

**TDD 테스트 전략**:

| 레벨 | 도구 | 대상 | 우선순위 |
|------|------|------|---------|
| 단위 | Vitest | 점수 계산, 데이터 변환, 프롬프트 생성 함수 | P0 |
| 통합 | Vitest + Supabase 로컬 | API Route → Supabase → 응답 검증 | P0 (핵심 경로만) |
| E2E | Playwright | 퀴즈 참여 → 응답 → 인사이트 생성 전체 흐름 | P1 (데모 시나리오) |

- 7일 제약 하 테스트 커버리지 목표: P0 기능 핵심 경로 80%+
- 각 IU별 테스트 케이스 ID 목록 작성

**MVP → 고도화 로드맵**:

| Phase | 기간 | 핵심 기능 | 비즈니스 |
|-------|------|-----------|---------|
| 1 (MVP) | 7일 | F-01~F-06 핵심 | 공모전 제출 |
| 2 (PMF) | 1-6개월 | 스트릭, 배지, AI 퀴즈 자동생성, 학생 계정, 수업 이력 비교 | 교사 개인 무료 |
| 3 (B2B) | 6-12개월 | 멀티테넌시, 운영자 대시보드, 학원/기관 관리 | B2B SaaS |
| 4 (B2G) | 12개월+ | 학교/교육청 연동, 기업교육 | B2G |

**D1~D7 일별 구현 일정** (project-plan.md ch1.5 기반, IU 매핑):

| 일차 | 작업 | IU 매핑 |
|------|------|---------|
| D1 | DB 스키마 + Supabase Auth + 프로젝트 구조 | 인프라 |
| D2 | 실시간 퀴즈 게임 (학생 참여 + 리더보드) | IU-01 |
| D3 | AI 인사이트 생성 (프롬프트 엔지니어링) | IU-02 |
| D4 | 교사 대시보드 (실시간 집계 + 인사이트 표시) | IU-03 |
| D5 | 수업 초안 생성 + 따봉 피드백 + 수업 관리 UI | IU-04, IU-05, IU-06 |
| D6 | 통합 테스트 + 배포 + 데모 데이터 | 검증 |
| D7 | 발표 자료 + 데모 시나리오 리허설 | 발표 |

**완료 확인**:
- [ ] 단위/통합/E2E 테스트 목록이 IU별로 정리됨
- [ ] Phase 1~4 로드맵이 기능 단위로 정리됨
- [ ] D1~D7 일별 일정이 IU와 매핑됨

---

### Step 5: 문서 마무리 + .ai.md 최신화

**대상 파일**: `docs/specs/dev-spec.md` (전체), `docs/specs/.ai.md`

**작업 내용**:
- dev-spec.md 전체 일관성 검토
  - project-plan.md ch7-ch8과 용어/기능명 일치 확인
  - API 엔드포인트와 DB 스키마 간 정합성
  - 테스트 기준과 수용 기준 간 정합성
- dev-spec.md 상단에 명시: "본 문서는 project-plan.md의 설계를 구현 수준으로 구체화한 것이며, 상충 시 본 문서가 우선한다"
- `docs/specs/.ai.md` 최신화: dev-spec.md 파일 추가, 목적·구조·참조 관계 기술

**완료 확인**:
- [ ] 문서 내 용어 일관성 확인됨
- [ ] .ai.md에 dev-spec.md 기록됨

---

## 변경/생성 대상 파일

| 파일 | 동작 |
|------|------|
| `docs/specs/dev-spec.md` | 신규 생성 |
| `docs/specs/.ai.md` | 수정 (dev-spec.md 추가) |

## ADR (Architecture Decision Record)

**Decision**: `docs/specs/dev-spec.md` 단일 파일로 기술 명세 작성
**Drivers**: 7일 MVP 규모, 기획서 완성도 높음, executor 참조 편의성
**Alternatives**: 기능별 분리 명세서 → 7일 프로젝트에 과도한 문서 관리 비용으로 기각
**Consequences**: (+) 전체 아키텍처 한 눈에 파악 (-) 500줄+ 길이 예상, 목차로 해결
