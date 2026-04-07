# [#11] MIRAI 프로젝트에서 스킬 4종 + 훅 1종 이식 — 구현 계획

> 작성: 2026-04-07

---

## 완료 기준

- [ ] skill-activation-prompt 훅이 UserPromptSubmit에 등록되어 키워드 감지 시 스킬 자동 제안됨
- [ ] 스킬 4종이 `.claude/skills/`에 존재하고 정상 동작
  - database-schema-design (Snowflake SQL 문법에 맞게 커스터마이징)
  - git-commit (Conventional Commits 자동 분석·생성)
  - test-driven-development (TDD Red-Green-Refactor 강제)
  - security-best-practices (Snowflake RBAC/네트워크 정책 반영)
- [ ] skill-rules.json 생성 (Snowflake 도메인에 맞는 트리거 키워드 정의)
- [ ] 각 스킬 디렉토리에 .ai.md 파일 존재
- [ ] .claude/hooks/.ai.md 최신화

---

## 구현 계획

> Ralplan 합의 완료 (Planner → Architect → Critic). 2026-04-07

### RALPLAN-DR Summary

**Principles**
1. 최소 변경 원칙 — 원본 범용 부분은 그대로, Snowflake 전용만 커스터마이징
2. 자기 설명적 구조 — 모든 디렉토리에 `.ai.md` 포함
3. 점진적 활성화 — 훅과 스킬을 독립 단위로 포팅, 기존 기능 영향 없음
4. 도메인 정합성 — Snowflake SQL/보안 모델에 맞지 않는 내용 제거·대체

**Decision Drivers**
1. tsx v4.21.0 + Node v25.6.0 확인됨 → TS 훅 그대로 사용 가능
2. 커스터마이징 범위: database-schema-design, security-best-practices 2종은 **신규 저작** (원본은 구조 템플릿으로만 참고)
3. settings.json 병합: 기존 PostToolUse 유지 + UserPromptSubmit 추가 (충돌 없음)

**ADR**: TS 훅(Option A) 채택. Bash-only(Option B)는 JSON 파싱 불안정·regex 매칭 난이도로 배제. Python3 하이브리드는 검토했으나, 검증된 TS 코드 재사용이 더 효율적.

---

### Step 1: 스킬 디렉토리 구조 생성

```
.claude/skills/
  database-schema-design/
  git-commit/
  test-driven-development/
  security-best-practices/
```

- AC: `ls .claude/skills/` → 4개 디렉토리

---

### Step 2: As-is 스킬 포팅 (git-commit, test-driven-development)

| 소스 (MIRAI) | 대상 |
|------|------|
| `.claude/skills/git-commit/SKILL.md` (125줄) | `.claude/skills/git-commit/SKILL.md` |
| `.claude/skills/test-driven-development/SKILL.md` (372줄) | `.claude/skills/test-driven-development/SKILL.md` |
| `.claude/skills/test-driven-development/testing-anti-patterns.md` (300줄) | `.claude/skills/test-driven-development/testing-anti-patterns.md` |

- 내용 변경 없이 복사
- SKILL.toon 파일은 포팅하지 않음
- 각 디렉토리에 `.ai.md` 작성
- AC: 원본과 내용 동일 + .ai.md 존재

---

### Step 3: Snowflake 커스터마이징 — database-schema-design ⚠️ 신규 저작

> 원본(694줄)에 PostgreSQL/MySQL/MongoDB 참조 18건, Snowflake 0건 → 단순 편집이 아닌 **Snowflake 전용 신규 저작**. 원본은 구조 템플릿(섹션 헤더, 포맷)으로만 참고.

**제거**: PostgreSQL/MySQL/MongoDB/SQLite/ORM(Prisma) 전용 내용
**추가**:
- 데이터 타입: `VARIANT`, `OBJECT`, `ARRAY`, `GEOGRAPHY`, `TIMESTAMP_LTZ/NTZ/TZ`
- 테이블 설계: `CLUSTER BY`, `TRANSIENT TABLE`, `TEMPORARY TABLE`
- 데이터 로딩: `COPY INTO`, `STAGE`, `FILE FORMAT`, `PIPE`
- 고급 기능: `Time Travel`, `Streams`, `Tasks`, `Dynamic Tables`
- 스키마 구조: `DATABASE > SCHEMA > TABLE` 3-tier 네임스페이스
- 성능: `RESULT_USE_CACHING`, Micro-partition pruning, Materialized Views

- AC: Snowflake 키워드 10+ 포함, PostgreSQL/MySQL/MongoDB 코드 블록 없음, .ai.md 존재

---

### Step 4: Snowflake 커스터마이징 — security-best-practices ⚠️ 신규 저작

> 원본(288줄)에 Express/Helmet/CORS/XSS/CSRF 참조 19건 → 웹 보안과 Snowflake 데이터 플랫폼 보안은 완전히 다른 도메인. **Snowflake 전용 신규 저작**.

**제거**: Express.js/Helmet/CORS/CSP/XSS/CSRF 웹 보안 섹션
**추가**:
- RBAC: `ROLE`, `GRANT`, `REVOKE`, 역할 계층, `SECURITYADMIN`/`SYSADMIN` 분리
- Network Policies: IP 화이트리스트, `CREATE NETWORK POLICY`
- Data Masking: `CREATE MASKING POLICY`, 동적 데이터 마스킹
- Row Access Policies: `CREATE ROW ACCESS POLICY`
- MFA: `ALTER USER ... SET REQUIRE_MFA = TRUE`
- 암호화: AES-256, Tri-Secret Secure
- 감사: `ACCOUNT_USAGE`, `ACCESS_HISTORY`, `LOGIN_HISTORY`
- 세션: `SESSION_POLICY`, 유휴 타임아웃

- AC: Snowflake 보안 키워드 10+ 포함, Express.js/Helmet/CORS 없음, .ai.md 존재

---

### Step 5: skill-activation-prompt 훅 + skill-rules.json + settings.json

**5-1. 훅 파일 복사**

| 소스 (MIRAI) | 대상 |
|------|------|
| `.claude/hooks/skill-activation-prompt.sh` | `.claude/hooks/skill-activation-prompt.sh` |
| `.claude/hooks/skill-activation-prompt.ts` | `.claude/hooks/skill-activation-prompt.ts` |

- `.sh`에 **tsx 가드 추가** (Architect 조건):
  ```bash
  command -v npx >/dev/null 2>&1 && npx tsx --version >/dev/null 2>&1 || { echo "tsx not found, skipping skill activation"; exit 0; }
  ```
- `.ts`의 `findRulesPath()`는 `CLAUDE_PROJECT_DIR` 기반 — 변경 불필요

**5-2. skill-rules.json 생성** (`.claude/skills/skill-rules.json`)

4개 스킬만 정의 (MIRAI 잔여 트리거 포함 금지 — Express, MUI, Prisma 등 절대 불포함):
- `database-schema-design`: type=domain, priority=high, 키워드=["스키마","schema","snowflake","variant","cluster by","copy into","stage","time travel","데이터 모델링","ERD"]
- `git-commit`: type=domain, priority=medium, 키워드=["commit","커밋","conventional commit"]
- `test-driven-development`: type=guardrail, priority=high, 키워드=["tdd","test first","테스트 먼저","red green refactor"]
- `security-best-practices`: type=domain, priority=high, 키워드=["보안","security","rbac","masking","network policy","row access","권한","role","grant"]

**5-3. settings.json 업데이트** — UserPromptSubmit 훅 추가 (permissions/enabledPlugins 변경 금지)

- AC: .sh+.ts 존재, skill-rules.json 유효 JSON, settings.json에 UserPromptSubmit 등록, 기존 PostToolUse 유지

---

### Step 6: 문서 최신화

| 파일 | 작업 |
|------|------|
| `.claude/skills/.ai.md` | 신규 — skills 디렉토리 설명 |
| `.claude/skills/database-schema-design/.ai.md` | 신규 |
| `.claude/skills/git-commit/.ai.md` | 신규 |
| `.claude/skills/test-driven-development/.ai.md` | 신규 |
| `.claude/skills/security-best-practices/.ai.md` | 신규 |
| `.claude/hooks/.ai.md` | 수정 — skill-activation-prompt 훅 추가 기술 |

- AC: 6개 .ai.md (5 신규 + 1 수정), 모두 한국어

---

### Guardrails

**Must Have**
- 기존 secret-filter.sh PostToolUse 훅 동작 유지
- settings.json의 permissions 섹션 변경 없음
- 모든 스킬 디렉토리에 .ai.md 파일 존재
- database-schema-design에 Snowflake 전용 내용 (VARIANT, CLUSTER BY, Time Travel 등)
- security-best-practices에 Snowflake 보안 내용 (RBAC, Network Policies 등)
- skill-rules.json에 Snowflake 도메인 키워드만 반영
- skill-activation-prompt.sh에 tsx 가드 코드 포함

**Must NOT Have**
- PostgreSQL/MySQL/MongoDB 전용 내용을 database-schema-design에 남김
- Express.js/Helmet/CORS 전용 내용을 security-best-practices에 남김
- settings.json의 permissions 또는 enabledPlugins 변경
- 원본 MIRAI 프로젝트 파일 수정
- skill-rules.json에 MIRAI 전용 트리거 (Express, MUI, Prisma 등) 포함

---

### 실행 순서 (의존성)

```
Step 1 (디렉토리 생성)
  ├── Step 2 (as-is 포팅) ─── 병렬 가능
  ├── Step 3 (DB 스킬 신규 저작) ── 병렬 가능
  └── Step 4 (보안 스킬 신규 저작) ── 병렬 가능
       └── Step 5 (훅 + rules + settings) ── Step 2,3,4 완료 후
            └── Step 6 (문서) ── Step 5 완료 후
```
