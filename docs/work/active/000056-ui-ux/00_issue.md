# feat: 전체 UI/UX 디자인 고도화 — 학생 퀴즈 게이미피케이션 + 교사/학생 화면 리뉴얼

## 사용자 관점 목표
학생은 퀴즈에 참여하면서 정답/오답 피드백을 즉각적·시각적으로 느끼고, 교사는 세련된 UI로 수업을 운영할 수 있다.

## 배경
현재 UI는 기능 구현 중심으로 만들어졌으며, 디자인 완성도가 낮다. 학생 퀴즈 화면에 게이미피케이션 요소(정답/오답 애니메이션, 점수 증가 효과 등)가 없어 몰입감이 부족하다. 전체 화면에 걸쳐 일관된 컬러 시스템과 모던 카드 UI가 필요하다.

## 완료 기준
- [x] 학생 퀴즈 화면: 정답 선택 시 초록 burst 애니메이션 + "정답!" 텍스트, 오답 시 빨간 shake + "오답" 표시
- [x] 학생 퀴즈 화면: 점수 획득 시 +100 숫자가 위로 떠오르는 float-up 효과
- [x] 학생 결과 화면: confetti 또는 별 애니메이션으로 완료 축하
- [x] 교사/학생 전체 화면: Tailwind 기반 컬러 시스템 정비 (primary/accent 변수화)
- [x] 공통 컴포넌트(버튼, 카드, 배지) 디자인 통일
- [x] 모바일 반응형 확인

## 구현 플랜
1. `tailwind.config.ts` — primary/secondary/accent 커스텀 색상 정의
2. 학생 퀴즈 `(student)/quiz/[sessionId]/page.tsx` — 정답/오답 애니메이션, 점수 float-up 효과
3. 학생 결과 화면 — confetti 라이브러리(canvas-confetti) 또는 CSS 애니메이션
4. 학생 대기/참여 화면 (`waiting`, `join`) — 디자인 리뉴얼
5. 교사 live/dashboard 화면 — 카드 UI, 컬러 통일
6. `globals.css` — 공통 애니메이션 keyframe 추가

## 개발 체크리스트
- [ ] 테스트 코드 포함
- [ ] 해당 디렉토리 .ai.md 최신화
- [ ] 불변식 위반 없음


## 작업 내역

### 2026-04-10

**현황**: 6/6 완료

**완료된 항목**:
- [x] 학생 퀴즈 화면: 정답 burst 애니메이션 + 오답 shake 효과
- [x] 점수 획득 시 float-up (+100) 효과
- [x] 결과 화면 canvas-confetti (dynamic import, SSR 안전)
- [x] Tailwind 컬러 시스템 정비 (brand/correct/wrong/student-bg + Pretendard/Space Grotesk)
- [x] 공통 컴포넌트 디자인 통일 (Kahoot 4색 답안 블록, Duolingo 버튼)
- [x] 모바일 반응형 확인 (min-h-[56px] 터치 타겟)

**추가 구현**:
- 대시보드 SPA 패턴: `?session=<id>&view=<view>` 쿼리 파라미터로 사이드바 유지
- 학생 피드백 RLS 우회: `/api/thumbs` 라우트 (service role key)
- AI 세션 생성 기능 복원: from-draft/preview + from-draft/route + DraftSessionConfirmModal
- 학생 피드백 패널 교사 대시보드에 인라인 표시
- 수업 초안 생성 후 자동 스크롤 (draftRef + scrollIntoView)
- InsightsContent 컴포넌트 추출 (대시보드 내 인사이트 뷰 지원)

**변경 파일**: 26개 수정 + 7개 신규
- `tailwind.config.ts`, `globals.css`, `package.json` (canvas-confetti)
- `(student)/quiz/[sessionId]/page.tsx`, `layout.tsx`, `join/page.tsx`, `join/[code]/page.tsx`, `waiting/[sessionId]/page.tsx`
- `teacher/dashboard/page.tsx`, `teacher/sessions/[id]/live/LiveSessionClient.tsx`
- `components/dashboard/SessionDetailClient.tsx`, `SessionSidebar.tsx`, `ClassDraftPanel.tsx`
- 신규: `api/thumbs/route.ts`, `api/sessions/from-draft/route.ts`, `api/sessions/from-draft/preview/route.ts`
- 신규: `InsightsContent.tsx`, `DraftSessionConfirmModal.tsx`, `ThumbsFeedbackPanel.tsx`, `lib/prompts/draft-questions.ts`
