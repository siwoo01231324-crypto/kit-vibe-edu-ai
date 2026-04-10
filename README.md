# kit-vibe-edu-ai

교사의 수업 피드백 루프를 AI로 자동화하는 서비스.
퀴즈 수집 → AI 분석 → 수업 초안 생성까지 한 번에.

## 라이브 데모

> **URL**: `https://<your-vercel-url>.vercel.app`  
> 배포 후 실제 URL로 업데이트 예정

3분 데모 플로우: 교사 로그인 → 세션 확인 → AI 인사이트 생성 → 수업 초안 생성

- 데모 스크립트: [`docs/demo/demo-script.md`](docs/demo/demo-script.md)
- 배포 가이드: [`docs/demo/manual-deploy-guide.md`](docs/demo/manual-deploy-guide.md)

---

## 핵심 기능

| 기능 | 설명 |
|------|------|
| 실시간 퀴즈 | join 코드로 학생 입장, 응답 실시간 집계 |
| AI 인사이트 | 응답 데이터 분석 → 약점 개념 자동 탐지 |
| 수업 초안 | 인사이트 기반 다음 수업 계획 자동 생성 |
| 교사 대시보드 | 세션·문항·응답 현황 한눈에 확인 |

## 기술 스택

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Realtime + Auth)
- **AI**: Anthropic Claude Haiku
- **Deploy**: Vercel

---

## 로컬 실행

```bash
# 1. 의존성 설치
cd apps/web && npm install

# 2. 환경변수 설정
cp .env.example .env.local
# .env.local 에 실제 값 입력

# 3. Supabase 로컬 시작
supabase start

# 4. 개발 서버
npm run dev
```

자세한 배포 가이드: [`docs/demo/manual-deploy-guide.md`](docs/demo/manual-deploy-guide.md)

---

## 개발 워크플로우

Claude Code + GitHub Issues 기반.
이슈 생성 → 워크트리 분기 → 구현 → PR → 정리까지 슬래시 커맨드로 자동화합니다.

---

## 포함 내용

| 범주 | 내용 |
|------|------|
| **슬래시 커맨드** | `/bi` `/si` `/ri` `/plan` `/fi` `/ci` `/drop-issue` `/update-changelog` |
| **서브에이전트** | plan-reviewer, code-architecture-reviewer, documentation-architect, refactor-planner, code-refactor-master, frontend-error-fixer, web-research-specialist |
| **보안 훅** | PostToolUse 시크릿 필터 (API키·토큰 자동 탐지) |
| **CI 스크립트** | 불변식 검사, 금지 파일 형식 커밋 차단 |
| **GitHub 자동화** | 이슈→칸반 보드 자동 이동 (Backlog→InProgress→InReview) |
| **이슈·PR 템플릿** | feature / bug / chore |

---

## 빠른 시작

```bash
# 1. 이 템플릿으로 새 레포 생성 (GitHub UI 또는 gh CLI)
gh repo create my-project --private --template siw/siw-claude-template --clone
cd my-project

# 2. 초기화 스크립트 실행
bash setup.sh

# 3. GitHub Project 보드 연결 (docs/onboarding/getting-started.md 참고)
```

자세한 설정은 **`docs/onboarding/getting-started.md`** 를 참고하세요.

---

## 커맨드 치트시트

| 커맨드 | 역할 |
|--------|------|
| `/bi` | 새 이슈 Backlog 생성 |
| `/si <이슈번호>` | 이슈 작업 시작 (워크트리·브랜치 생성) |
| `/ri` | 세션 재시작 시 현황 복구 |
| `/plan` | 구현 계획 작성 |
| `/fi` | 완료 커밋·PR 생성 |
| `/ci` | PR 머지 후 정리 |
| `/drop-issue` | 이슈 중도 포기 |
| `/update-changelog` | CHANGELOG 업데이트 |
