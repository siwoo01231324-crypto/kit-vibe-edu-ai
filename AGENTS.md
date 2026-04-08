# kit-vibe-edu-ai AGENTS.md

> 이 파일은 레포 전체의 목차다. 백과사전이 아니다.
> 규칙·불변식은 `CLAUDE.md` 참조. 각 디렉토리 상세는 해당 `.ai.md` 참조.

---

## 레포 구조

> 루트에는 `package.json`, `node_modules` 등 Next.js 관련 파일이 없다. 모든 애플리케이션 코드와 설정은 `apps/web/` 안에 있다.

```
kit-vibe-edu-ai/
├── AGENTS.md               ← 지금 이 파일 (목차)
├── CLAUDE.md               ← 불변식·규칙·작업 흐름
├── README.md               ← 프로젝트 소개
├── apps/
│   └── web/                ← Next.js 15 앱 단독 (모든 소스·설정·의존성)
│       ├── package.json    ← 의존성 및 scripts (dev, build, test, e2e 등)
│       ├── next.config.ts  ← Next.js 설정
│       ├── tsconfig.json   ← TypeScript strict + @/* → ./src/* alias
│       ├── tailwind.config.ts ← Tailwind v3 설정
│       ├── postcss.config.mjs ← PostCSS (tailwindcss + autoprefixer)
│       ├── vitest.config.ts   ← Vitest 단위/통합 테스트 설정
│       ├── playwright.config.ts ← Playwright E2E 테스트 설정
│       ├── src/            ← 모든 애플리케이션 소스 코드
│       │   ├── app/        Next.js App Router (페이지·레이아웃·API Routes)
│       │   │   ├── (student)/  학생 퀴즈 게임 페이지
│       │   │   ├── (teacher)/  교사 대시보드 (인증 필요)
│       │   │   ├── api/        API Routes
│       │   │   ├── globals.css
│       │   │   ├── layout.tsx
│       │   │   └── page.tsx
│       │   ├── components/ 재사용 UI 컴포넌트
│       │   │   ├── ui/         shadcn/ui 기본 컴포넌트
│       │   │   ├── quiz/       퀴즈 전용 컴포넌트
│       │   │   ├── dashboard/  대시보드 컴포넌트
│       │   │   └── shared/     공통 컴포넌트
│       │   ├── lib/        비즈니스 로직·SDK 클라이언트
│       │   │   ├── supabase/   Supabase 클라이언트 (client/server/middleware)
│       │   │   ├── scoring.ts  점수 계산
│       │   │   ├── join-code.ts join_code 생성
│       │   │   └── prompts/    Claude AI 프롬프트 템플릿
│       │   ├── types/      TypeScript 타입 정의
│       │   │   ├── database.ts Supabase generated types
│       │   │   ├── api.ts      API 인터페이스
│       │   │   └── domain.ts   도메인 모델
│       │   └── middleware.ts   Next.js 미들웨어 (Auth 라우팅)
│       └── tests/          ← 테스트 루트 (apps/web/src/ 외부 유지)
│           ├── unit/       Vitest 단위 테스트
│           ├── integration/ Vitest + Supabase 로컬 통합 테스트
│           ├── e2e/        Playwright E2E 시나리오
│           └── setup.ts    Vitest setupFiles
├── .github/
│   └── workflows/          GitHub Actions (project-automation.yml)
├── .claude/
│   ├── agents/             커스텀 에이전트 정의
│   ├── commands/           슬래시 커맨드 (bi, si, fi, ci 등)
│   └── hooks/              Git 훅 스크립트
├── docs/                   ← 프로젝트 문서 (SOT)
│   ├── ai-report/          AI 리포트·지침서·일일 로그
│   │   ├── AI-REPORT.md
│   │   ├── ai-guidelines.md
│   │   ├── daily-log.md
│   │   ├── prompts/
│   │   └── screenshots/
│   ├── specs/              기능 명세 + AC
│   ├── onboarding/         환경 설정·기여 가이드
│   └── work/               이슈별 작업 내역
│       ├── active/
│       └── done/
└── scripts/                ← 유틸리티 스크립트
    ├── check_invariants.py 아키텍처 불변식 검증
    └── check_forbidden_files.py 금지 파일 검사
```

---

## 개발자 워크플로

```bash
cd apps/web && npm install    # 의존성 설치
cd apps/web && npm run dev    # 개발 서버 실행
cd apps/web && npm run build  # 프로덕션 빌드
cd apps/web && npm run test   # 단위/통합 테스트
cd apps/web && npm run e2e    # E2E 테스트
```

## 핵심 문서 링크

- 기능 명세 + AC → `docs/specs/`
- 작업 내역 → `docs/work/active/`
- 온보딩 → `docs/onboarding/getting-started.md`
