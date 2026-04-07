# chore: MIRAI 프로젝트에서 스킬 4종 + 훅 1종 이식

## 목적
MIRAI 프로젝트의 .claude/skills와 .claude/hooks에서 유용한 스킬 4종과 훅 1종을 이식하여 개발 품질과 자동화를 강화한다.

## 배경
MIRAI에는 41개 스킬이 있으나, 본 프로젝트 도메인에 맞는 범용 스킬만 선별했다. 프론트엔드/마케팅/MIRAI 전용 스킬은 제외.

## 완료 기준
- [x] skill-activation-prompt 훅이 UserPromptSubmit에 등록되어 키워드 감지 시 스킬 자동 제안됨
- [x] 스킬 4종이 `.claude/skills/`에 존재하고 정상 동작
  - database-schema-design (Snowflake SQL 문법에 맞게 커스터마이징)
  - git-commit (Conventional Commits 자동 분석·생성)
  - test-driven-development (TDD Red-Green-Refactor 강제)
  - security-best-practices (Snowflake RBAC/네트워크 정책 반영)
- [x] skill-rules.json 생성 (Snowflake 도메인에 맞는 트리거 키워드 정의)
- [x] 각 스킬 디렉토리에 .ai.md 파일 존재
- [x] .claude/hooks/.ai.md 최신화

## 구현 플랜
1. `.claude/skills/` 디렉토리 생성 + `skill-rules.json` 작성
2. skill-activation-prompt 훅 이식 (.sh + .ts) + settings.json에 UserPromptSubmit 훅 등록
3. 스킬 4종 이식 및 커스터마이징
   - database-schema-design → Snowflake SQL 반영 (VARIANT, CLUSTER BY, COPY INTO 등)
   - git-commit → 그대로 이식
   - test-driven-development → 그대로 이식
   - security-best-practices → Snowflake 보안 맥락 반영 (RBAC, 네트워크 정책, 데이터 마스킹 등)
4. 각 스킬 디렉토리에 .ai.md 작성 + .claude/hooks/.ai.md 업데이트

## 참고
- 원본 위치: `D:\project\T아카데미\MIRAI\MIRAI\.claude\skills\`
- secret-filter.sh는 이미 동일하므로 제외
- 프론트엔드/마케팅 관련 스킬은 도메인 불일치로 제외

## 개발 체크리스트
- [x] 해당 디렉토리 .ai.md 최신화


## 작업 내역

### 2026-04-07

**현황**: 5/5 완료
**완료된 항목**:
- skill-activation-prompt 훅 이식 (.sh + .ts) + settings.json UserPromptSubmit 등록
- 스킬 4종 포팅: git-commit, tdd as-is / database-schema-design, security-best-practices Snowflake 전용 신규 저작
- skill-rules.json 생성 (4개 스킬 Snowflake 도메인 트리거 정의)
- 각 스킬 디렉토리 + skills 루트 .ai.md 작성 (5개 신규)
- .claude/hooks/.ai.md 최신화 (skill-activation-prompt 설명 추가)
**미완료 항목**:
- (없음)
**변경 파일**: 16개
- 신규: 스킬 4종 SKILL.md + testing-anti-patterns.md + .ai.md 5개 + skill-rules.json + skill-activation-prompt.sh/.ts
- 수정: settings.json, hooks/.ai.md
- 문서: 00_issue.md, 01_plan.md (ralplan 합의 완료)
