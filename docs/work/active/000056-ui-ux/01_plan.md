# 구현 계획 — #56 feat: 전체 UI/UX 디자인 고도화

## 디자인 시스템 (AI slop 방지 기반)

### 왜 기존 ui-ux-pro-max 출력을 버렸나

`ui-ux-pro-max` 스킬이 추천한 결과:
- `#4F46E5` indigo primary → Tailwind 기본 버튼 색. AI가 학습한 데이터의 80%가 이 색. **가장 강한 AI 냄새**
- Claymorphism → 2023 피크, 지금은 "다음 글라스모피즘" 취급
- Baloo 2 + Comic Neue → AI가 "교육 앱"에 항상 쌍으로 추천하는 조합

**레퍼런스 분석 (실제 성공한 앱)**:
- Kahoot: 배경 `#46178F` 다크 퍼플 + 볼드 단색 블록(빨/파/노/초) + 윤곽선 없음
- Duolingo: 커스텀 chartreuse `#8EE000` + 윤곽선 버튼에 4px 바닥 그림자 (눌리는 느낌)

### 확정 디자인 시스템

**스타일**: Bold Flat Gamification — Kahoot/Duolingo 계열 (그라디언트 없음, 글라스/클레이 없음)

**컬러**:
| 역할 | Hex | 근거 |
|------|-----|------|
| Brand primary | `#F97316` (vivid orange) | 인디고 완전 탈피, 에너지감, 비교적 미사용 |
| Correct (정답) | `#4ADE80` (lime green) | 기능적 의미 명확, Duolingo 계열 |
| Wrong (오답) | `#F43F5E` (rose red) | 기능적 의미 명확 |
| Answer A | `#F43F5E` rose | Kahoot 방식 — 색으로 위치 기억 |
| Answer B | `#38BDF8` sky | |
| Answer C | `#FACC15` amber | |
| Answer D | `#4ADE80` lime | |
| Student BG | `#0F172A` (slate-900) | 몰입감, 교실 환경 가독성 |
| Teacher BG | `#F8FAFC` (slate-50) | 교사 UI는 깔끔하게 |
| Score/XP text | `#FACC15` amber | 숫자 강조 |

**폰트**:
- **Pretendard** (한국 웹 표준, 한글+라틴 균형, AI 추천 목록에 없음)
- **Space Grotesk** (점수판 숫자 전용 — 모노스페이스 감성, 게임 느낌)
- 설치: CDN 또는 `@fontsource/pretendard` (Google Fonts 아님)

**버튼/카드 스타일**:
```
/* Duolingo 스타일 — 눌리는 느낌 */
.btn-clay-free {
  border-bottom: 4px solid {darken 20%};
  active: border-bottom-width: 0; transform: translateY(4px);
  transition: 100ms;
}
/* Kahoot 스타일 — 답안 블록 */
.answer-block {
  background: {answer-color};
  border-radius: 12px;
  box-shadow: 0 4px 0 {darken 30%};
  no-gradient, no-glassmorphism;
}
```

---

## AC 항목별 구현 단계

### AC1. 정답 burst + 오답 shake 피드백
**파일**: `apps/web/src/app/globals.css` + `quiz/[sessionId]/page.tsx`

1. `globals.css`에 keyframe 추가:
   - `@keyframes burst-scale`: `scale(1) → scale(1.08) → scale(1)` + brightness 증가 (200ms)
   - `@keyframes shake-x`: `-6px → 6px → -4px → 4px → 0` (300ms)
   - `@media (prefers-reduced-motion: reduce)` 블록에서 비활성화
2. `tailwind.config.ts`에 `animate-burst`, `animate-shake-x` 등록
3. `quiz/page.tsx` 피드백 상태:
   - 정답: 답안 블록 `animate-burst` + `bg-lime-400 shadow-[0_4px_0_#16a34a]` + 상단 "정답!" 배지 (absolute)
   - 오답: `animate-shake-x` + `bg-rose-500 shadow-[0_4px_0_#be123c]`

### AC2. 점수 float-up 효과
**파일**: `apps/web/src/app/globals.css` + `quiz/[sessionId]/page.tsx`

1. `globals.css`: `@keyframes float-up` — `translateY(0) opacity(1) → translateY(-60px) opacity(0)` (1000ms ease-out)
2. `quiz/page.tsx`에 `scoreFloat: { value: number; key: number } | null` 상태 추가
3. 정답 판정 직후 상태 세팅 → 1초 후 null
4. 렌더: `+{score}` 텍스트, `position: absolute`, `font-family: Space Grotesk`, `color: #FACC15`

### AC3. 결과 화면 confetti
**파일**: `quiz/[sessionId]/page.tsx`

1. `canvas-confetti` 동적 import (SSR 방지):
   ```ts
   const confetti = (await import('canvas-confetti')).default;
   ```
2. `useEffect` — `status === 'ended'` && 정답 3개 이상 → confetti 실행
3. 결과 카드 스타일 (현재 flat gray → Bold Flat):
   - 배경: `bg-slate-900` (학생 화면 다크)
   - 카드: `bg-slate-800 rounded-2xl border border-slate-700`
   - 점수 배지: Kahoot 방식 단색 블록 (blue/green/purple) + `font-Space-Grotesk`
4. confetti 색상: `['#F97316', '#4ADE80', '#38BDF8', '#FACC15']` (브랜드 팔레트)

### AC4. Tailwind 컬러 시스템 정비
**파일**: `apps/web/tailwind.config.ts` + `apps/web/src/app/globals.css`

```ts
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      brand: '#F97316',
      'brand-dark': '#C2410C',
      correct: '#4ADE80',
      'correct-dark': '#16A34A',
      wrong: '#F43F5E',
      'wrong-dark': '#BE123C',
      'score-text': '#FACC15',
      'student-bg': '#0F172A',
      'teacher-bg': '#F8FAFC',
    },
    fontFamily: {
      pretendard: ['Pretendard', 'sans-serif'],
      'space-grotesk': ['Space Grotesk', 'sans-serif'],
    },
    animation: {
      'burst': 'burst-scale 200ms ease-out',
      'shake-x': 'shake-x 300ms ease-in-out',
      'float-up': 'float-up 1000ms ease-out forwards',
    },
    keyframes: {
      'burst-scale': { ... },
      'shake-x': { ... },
      'float-up': { ... },
    },
  },
},
```

```css
/* globals.css */
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable.css');
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap');

/* 공통 */
body { font-family: 'Pretendard Variable', Pretendard, sans-serif; }
```

### AC5. 공통 컴포넌트 디자인 통일
변경 대상 파일 및 패턴:

**학생 레이아웃** (`(student)/layout.tsx`):
- `bg-student-bg` (slate-900) 다크 배경
- Pretendard 폰트 적용

**join/page.tsx** — 입력폼 + 버튼:
- 입력창: `bg-slate-800 border-slate-600 text-white placeholder-slate-400 rounded-xl`
- CTA 버튼: `bg-brand text-white rounded-xl border-b-4 border-brand-dark active:border-b-0 active:translate-y-1`

**waiting/[sessionId]/page.tsx** — 대기 카드:
- `bg-slate-800 rounded-2xl text-white` + 스피너 → pulse 애니메이션 원형 (브랜드 색)

**quiz/[sessionId]/page.tsx** — 답안 블록:
- 4색 Kahoot 방식 (`A: rose, B: sky, C: amber, D: lime`)
- `rounded-xl p-4 shadow-[0_4px_0_{darken}] font-semibold text-white cursor-pointer`
- 그리드: 모바일 `grid-cols-1`, sm+ `grid-cols-2`

**teacher/dashboard/page.tsx** + **live/LiveSessionClient.tsx**:
- `bg-teacher-bg` 라이트 배경
- 카드: `bg-white rounded-xl border border-slate-200 shadow-sm` (심플, 교사는 게임 느낌 불필요)

### AC6. 모바일 반응형 확인
- 답안 블록: `grid-cols-1` 기본, `sm:grid-cols-2`
- 폰트 크기: 모바일 `text-base` (16px) 이상 보장
- 터치 타겟: 답안 버튼 최소 `min-h-[56px]` (44px 이상)
- 학생 화면 `max-w-lg`, 교사 대시보드 `max-w-7xl` 일관 적용

---

## 실행 순서

```
Step 1 — 기반 설정 (블로킹, 나머지 전 필수)
  ├─ tailwind.config.ts: 커스텀 색상 + 폰트 + keyframe + animation
  └─ globals.css: Pretendard + Space Grotesk import + keyframe 정의

Step 2 — 핵심 게이미피케이션 (AC1 + AC2)
  └─ quiz/[sessionId]/page.tsx:
      - 다크 배경 적용
      - 4색 Kahoot 답안 블록
      - burst/shake 피드백 + float-up 점수

Step 3 — 결과 화면 (AC3)
  └─ quiz/[sessionId]/page.tsx의 ended 섹션:
      - confetti 동적 import
      - 다크 결과 카드 + Space Grotesk 점수

Step 4 — 학생 보조 화면 (AC5 일부)
  ├─ (student)/layout.tsx — 다크 베이스
  ├─ join/page.tsx — 다크 폼
  └─ waiting/[sessionId]/page.tsx — 대기 카드

Step 5 — 교사 화면 (AC5 나머지)
  ├─ teacher/dashboard/page.tsx
  └─ teacher/sessions/[id]/live/LiveSessionClient.tsx

Step 6 — 반응형 점검 (AC6)
  └─ 전체 375px / 768px 브레이크포인트 확인
```

---

## 변경/생성 대상 파일

| 파일 | 변경 유형 | AC |
|------|-----------|-----|
| `apps/web/tailwind.config.ts` | 수정 | AC4, AC1 |
| `apps/web/src/app/globals.css` | 수정 | AC4, AC1, AC2 |
| `apps/web/src/app/(student)/layout.tsx` | 수정 | AC5 |
| `apps/web/src/app/(student)/quiz/[sessionId]/page.tsx` | 수정 | AC1, AC2, AC3, AC6 |
| `apps/web/src/app/(student)/waiting/[sessionId]/page.tsx` | 수정 | AC5, AC6 |
| `apps/web/src/app/(student)/join/page.tsx` | 수정 | AC5, AC6 |
| `apps/web/src/app/(student)/join/[code]/page.tsx` | 수정 | AC5 |
| `apps/web/src/app/teacher/dashboard/page.tsx` | 수정 | AC5 |
| `apps/web/src/app/teacher/sessions/[id]/live/LiveSessionClient.tsx` | 수정 | AC5 |
| `package.json` (web) | 수정 | AC3 (canvas-confetti) |

---

## Guardrails

### Must Have
- `prefers-reduced-motion`: 모든 keyframe에 미디어 쿼리 블록 포함
- 버튼/인터랙티브 요소 모두 `cursor-pointer`
- 터치 타겟 최소 `min-h-[56px]` (44px WCAG 초과)
- 다크 배경(`#0F172A`)에서 텍스트 대비 4.5:1 이상 확인
- `canvas-confetti` 반드시 dynamic import (SSR 차단)
- 기존 로직(responses INSERT, 점수 계산, Realtime 훅) 수정 금지

### Must NOT Have
- `#4F46E5`, `#6366F1`, `#8B5CF6` (indigo/violet AI 기본색) 일절 사용 금지
- 그라디언트 배경 (linear-gradient hero 등)
- Glassmorphism / Claymorphism 효과
- Inter, Poppins, Nunito 폰트
- `width` / `height` 트랜지션 (transform/opacity만 허용)
- 기존 `@tailwindcss/typography` 플러그인 제거 금지
- 이모지를 새 UI 아이콘으로 추가 (기존 👍👎는 유지)
