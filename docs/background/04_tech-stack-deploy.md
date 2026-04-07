# 1주 MVP 기술 스택 및 무료 배포 인프라 선정

> 작성일: 2026-04-07 | 개발기간: 1주 (04/06~04/13) | 조건: 라이브 배포 URL 필수, API Key 노출 금지

---

## 1. 프론트엔드 프레임워크 비교

| 항목 | Next.js 15 | Remix v2 | Vite + React |
|------|-----------|---------|--------------|
| **렌더링** | SSR, SSG, ISR, CSR 모두 지원 | SSR 중심 (loader/action 패턴) | CSR 기본, SSR 별도 설정 필요 |
| **API Routes** | 내장 (app/api/route.ts) | 내장 (loader/action) | 별도 백엔드 서버 필요 |
| **학습 곡선** | 보통 (App Router 이후 중간 수준) | 보통 (React Router v7 통합) | 낮음 (순수 React 경험 활용) |
| **Vercel 최적화** | 최고 (Vercel 제작사) | 좋음 | 좋음 |
| **AI API 서버사이드 처리** | Server Actions, API Routes | loader/action에서 처리 | 별도 서버 없이는 불가 |
| **풀스택 MVP 적합성** | ★★★★★ | ★★★★ | ★★★ |
| **생태계·문서** | 매우 풍부 | 풍부 | 풍부 |
| **1주 개발 현실성** | 높음 | 중간 | 낮음 (백엔드 추가 필요) |

**결론:** Next.js 15 App Router가 AI API 서버사이드 처리 + Vercel 배포 + 풀스택 MVP에 최적.

출처: nextjs.org/docs, v2.remix.run/docs (2026.04.07 접근)

---

## 2. 백엔드/서버리스 후보 비교

| 항목 | Next.js API Routes | Supabase | Firebase |
|------|-------------------|----------|----------|
| **성격** | 서버리스 함수 (Vercel Edge/Node) | BaaS (PostgreSQL + Auth + Storage + Realtime) | BaaS (NoSQL + Auth + Hosting + Realtime) |
| **데이터베이스** | 별도 DB 필요 | PostgreSQL 내장 | Firestore (NoSQL) 내장 |
| **인증** | 별도 구현 필요 | Auth 내장 (OAuth, Email) | Auth 내장 (OAuth, Email) |
| **실시간** | 별도 구현 | Realtime 채널 내장 | Realtime DB 내장 |
| **AI API 처리** | 서버사이드에서 직접 호출 | Edge Functions에서 처리 | Cloud Functions에서 처리 |
| **무료 한도** | Vercel Hobby 플랜 포함 (함수 1M회/월) | PostgreSQL 500MB, 월 50MB 파일 | Spark: 1GB Firestore, 10GB 호스팅 |
| **설정 복잡도** | 매우 낮음 | 낮음 | 낮음~중간 |
| **1주 MVP 적합성** | ★★★★★ | ★★★★ | ★★★★ |

**결론:**
- **단순 AI 기능 MVP**: Next.js API Routes만으로 충분 (DB 필요 없을 경우)
- **사용자 인증 + 데이터 저장 필요 시**: Next.js + Supabase 조합 추천

출처: supabase.com/docs (2026.04.07 접근), firebase.google.com/pricing (2026.04.07 접근)

---

## 3. AI API 연동 방식 비교

| 항목 | OpenAI API (GPT-4o) | Anthropic Claude API | Google Gemini API |
|------|---------------------|---------------------|------------------|
| **최신 모델** | GPT-4o, GPT-4o-mini | Claude Sonnet 4.6, Haiku 4.5 | Gemini 3 Flash, 3.1 Pro |
| **가격 (입력/출력 per 1M tokens)** | GPT-4o-mini: ~$0.15/$0.60 | Haiku 4.5: $1/$5, Sonnet 4.6: $3/$15 | Flash 계열: 매우 저렴 |
| **한국어 성능** | 우수 | 우수 | 우수 |
| **무료 크레딧** | 신규 가입 시 제한적 | 없음 (유료) | 무료 티어 있음 (분당 요청 제한) |
| **응답 속도** | 빠름 (mini 모델) | 빠름 (Haiku) | 빠름 (Flash) |
| **스트리밍** | 지원 | 지원 | 지원 |
| **멀티모달** | 지원 (이미지 입력) | 지원 (이미지 입력) | 지원 (이미지, 동영상) |
| **SDK** | openai npm 패키지 | @anthropic-ai/sdk | @google/generative-ai |
| **1주 MVP 추천** | ★★★★★ | ★★★★ | ★★★★ |

### API Key 보안 처리 방안

**핵심 원칙: API Key는 절대 클라이언트(브라우저)에 노출하지 않는다.**

| 방법 | 설명 | 적용 위치 |
|------|------|-----------|
| **환경변수 (.env.local)** | `OPENAI_API_KEY=sk-...` 를 .env.local에 저장, .gitignore에 포함 | 로컬 개발 |
| **Vercel 환경변수 설정** | Vercel 대시보드 > Settings > Environment Variables에 키 등록 | 프로덕션 배포 |
| **서버사이드 프록시** | Next.js API Route(`/api/chat`)에서만 AI API 호출, 클라이언트는 내부 API만 호출 | 서버 코드 |
| **Edge Runtime** | Vercel Edge Functions에서 처리 (지연 최소화) | 고성능 필요 시 |

```
// 올바른 패턴 (server-side only)
// app/api/chat/route.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // 서버에서만 접근
});

export async function POST(req: Request) {
  const { message } = await req.json();
  const response = await openai.chat.completions.create({ ... });
  return Response.json(response);
}
```

출처: platform.claude.com/docs/en/docs/about-claude/models/overview (2026.04.07 접근), ai.google.dev/gemini-api/docs/models (2026.04.07 접근)

---

## 4. 무료 배포 플랫폼 비교

| 항목 | Vercel | Netlify | Cloudflare Pages | Railway | Render |
|------|--------|---------|-----------------|---------|--------|
| **무료 플랜명** | Hobby | Starter | Free | Free (크레딧) | Hobby |
| **월 대역폭** | 100GB | 제한적 (크레딧) | **무제한** | 제한적 | 제한적 |
| **빌드 횟수** | 제한 없음 | 300 크레딧/월 | 500회/월 | $5 크레딧 포함 | 무제한 |
| **서버리스 함수** | 1M 호출/월 | Functions 포함 | Workers 통합 | 없음 (컨테이너) | 없음 |
| **Next.js 지원** | 최고 (공식 지원) | 좋음 | 좋음 | 좋음 | 좋음 |
| **커스텀 도메인** | 무료 지원 | 무료 지원 | 무료 지원 | 유료 플랜 | 무료 지원 |
| **자동 HTTPS** | 지원 | 지원 | 지원 | 지원 | 지원 |
| **GitHub CI/CD** | 자동 연동 | 자동 연동 | 자동 연동 | 자동 연동 | 자동 연동 |
| **슬립 모드** | 없음 | 없음 | 없음 | 없음 | 15분 비활성 시 슬립 |
| **1주 MVP 적합성** | ★★★★★ | ★★★★ | ★★★★ | ★★★ | ★★★ |

**주요 제한 사항:**
- **Railway Free**: 30일 무료 후 월 $1 최소 청구, 0.5GB RAM — 지속 운영에 부적합
- **Render Free**: 15분 비활성 시 슬립 → 첫 요청 응답 지연 (~30초) — 데모 시 불리
- **Cloudflare Pages**: 정적 배포 + Workers 최고, Next.js SSR 일부 제한 가능성

출처: vercel.com/pricing, netlify.com/pricing, pages.cloudflare.com, railway.com/pricing, render.com/pricing (2026.04.07 접근)

---

## 5. 최종 추천 스택 조합

### 추천 스택 A: 빠른 AI 기능 MVP (인증 불필요)

```
프론트엔드:  Next.js 15 (App Router, TypeScript)
백엔드:      Next.js API Routes (서버리스)
AI API:      OpenAI GPT-4o-mini 또는 Anthropic Claude Haiku 4.5
배포:        Vercel (Hobby 무료)
스타일링:    Tailwind CSS
상태 관리:   React useState / useReducer (단순 로직)
```

**장점:** 단일 레포, 최소 설정, Vercel 최적화, AI API 서버사이드 보안 처리 용이

---

### 추천 스택 B: 사용자 계정 + 데이터 저장 MVP

```
프론트엔드:  Next.js 15 (App Router, TypeScript)
백엔드:      Next.js API Routes + Supabase
데이터베이스: Supabase PostgreSQL (무료 500MB)
인증:        Supabase Auth (OAuth + Email)
AI API:      OpenAI GPT-4o-mini
배포:        Vercel (Hobby 무료)
스타일링:    Tailwind CSS + shadcn/ui
```

**장점:** 완전한 풀스택 MVP, 사용자 학습 이력 저장, 소셜 로그인 즉시 지원

---

### 스택 선택 기준

| 조건 | 추천 |
|------|------|
| 1주 내 빠른 데모 | 스택 A |
| 사용자 가입·로그인 필요 | 스택 B |
| AI 대화 이력 저장 필요 | 스택 B |
| 팀원이 Next.js 경험 없음 | 스택 A (학습 곡선 최소화) |
| 공모전 심사 시 확장성 어필 | 스택 B |

---

## 6. 1주 개발 일정 예시 (스택 A 기준)

| 일차 | 작업 |
|------|------|
| Day 1 (04/06) | 프로젝트 셋업, Next.js 초기화, Vercel 배포 연결, 환경변수 설정 |
| Day 2 (04/07) | 핵심 UI 설계, AI API Route 구현, 기본 프롬프트 테스트 |
| Day 3 (04/08) | 메인 기능 구현 (AI 튜터/콘텐츠 생성/분석 등) |
| Day 4 (04/09) | 기능 완성, 스트리밍 응답 처리, 에러 핸들링 |
| Day 5 (04/10) | UI 다듬기, 모바일 반응형, 접근성 |
| Day 6 (04/11) | 테스트, 버그 수정, 성능 최적화 |
| Day 7 (04/12~13) | 최종 배포, README 작성, 발표 자료 준비 |

---

## 7. API Key 보안 체크리스트

- [ ] `.env.local` 파일이 `.gitignore`에 포함되어 있는가
- [ ] GitHub 레포에 API Key 관련 파일이 커밋되지 않았는가
- [ ] 모든 AI API 호출이 서버사이드(`/api/` 라우트 또는 Server Actions)에서만 이루어지는가
- [ ] 클라이언트 코드(`'use client'` 컴포넌트)에 `process.env.OPENAI_API_KEY` 참조가 없는가
- [ ] Vercel 환경변수 대시보드에 키가 등록되어 있는가
- [ ] Rate limiting 또는 요청 수 제한 로직이 있는가 (남용 방지)

---

## 출처

| 출처 | 내용 |
|------|------|
| nextjs.org/docs (2026.04.07 접근) | Next.js 15 App Router, API Routes 기능 |
| v2.remix.run/docs/ (2026.04.07 접근) | Remix v2 프레임워크 특징 |
| supabase.com/docs (2026.04.07 접근) | Supabase 기능 및 무료 플랜 |
| platform.claude.com/docs/en/docs/about-claude/models/overview (2026.04.07 접근) | Claude API 모델 및 가격 |
| ai.google.dev/gemini-api/docs/models (2026.04.07 접근) | Gemini API 모델 목록 |
| vercel.com/pricing (2026.04.07 접근) | Vercel Hobby 플랜 상세 (100GB 대역폭, 1M 함수 호출) |
| netlify.com/pricing (2026.04.07 접근) | Netlify 무료 플랜 (300 크레딧/월) |
| pages.cloudflare.com (2026.04.07 접근) | Cloudflare Pages 무료 플랜 (무제한 대역폭, 500 빌드/월) |
| railway.com/pricing (2026.04.07 접근) | Railway 무료/$5 Hobby 플랜 |
| render.com/pricing (2026.04.07 접근) | Render 무료 플랜 (슬립 모드 주의) |
