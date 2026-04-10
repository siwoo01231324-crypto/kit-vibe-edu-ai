# feat: 브랜딩 문서 기반 앱 네이밍 가이드라인 적용

## 사용자 관점 목표
교사/학생이 앱에 접속했을 때 일관된 브랜드 이름과 메시지를 경험한다.

## 배경
`docs/branding/branding-strategy.md` Section 4에서 네이밍 전략을 수립했으나, 현재 앱 UI에는 "Kit Vibe Edu"가 그대로 사용 중이다.

네이밍 평가 매트릭스 Top 3:
- **Seeya (시야)** — 29/30: See+시야(視野)+See ya, 교사의 시야를 넓혀주는 AI
- **Lumi (루미)** — 27/30: Lumen(빛)/Illuminate, 수업의 보이지 않는 것을 밝혀줌
- **Echoo (에쿠)** — 26/30: Echo+oo, 수업의 메아리·피드백 루프 본질과 직결
- 현행 MirAI — 24/30: 유사 이름 다수, 기술적 느낌 강함

브랜딩 문서 기반 네이밍 결정 및 UI 일괄 적용이 필요하다.

## 완료 기준
- [x] `docs/branding/branding-strategy.md` Section 4 기준으로 최종 브랜드명 1개 확정 → **Seeya(시야)** 선택
- [x] 랜딩 페이지(`apps/web/src/app/page.tsx`) h1, 서브타이틀 → 확정 브랜드명 + 브랜딩 문서 기반 태그라인 적용
- [x] 로그인 페이지(`apps/web/src/app/login/page.tsx`), 교사 레이아웃(`apps/web/src/app/teacher/layout.tsx`) 앱명 통일
- [x] `<head>` 메타 title/description 브랜드명 반영 (`apps/web/src/app/layout.tsx`)
- [x] `docs/branding/naming-decision.md` 작성 — 최종 선택 이유, 탈락 후보 이유 포함

## 구현 플랜
1. 브랜드명 최종 확정 (이슈 코멘트 또는 PR에서 결정)
2. `apps/web/src/app/layout.tsx` metadata title/description 수정
3. `apps/web/src/app/page.tsx` h1 + 서브타이틀 수정
4. `apps/web/src/app/login/page.tsx` 앱명 수정
5. `apps/web/src/app/teacher/layout.tsx` 앱명 수정
6. `docs/branding/naming-decision.md` 작성

## 개발 체크리스트
- [x] 테스트 코드 포함 (smoke.spec.ts 앱명 정규식 업데이트)
- [x] 해당 디렉토리 .ai.md 최신화
- [ ] 불변식 위반 없음

## 작업 내역

### 2026-04-10

**현황**: 5/5 완료
**완료된 항목**:
- branding-strategy.md Section 4 기준 최종 브랜드명 Seeya(시야) 확정
- 랜딩 페이지 h1/서브타이틀 → "Seeya" / "교사의 시야를 넓혀주는 AI" 적용
- 로그인 페이지 + 교사 레이아웃 앱명 "Seeya"로 통일
- layout.tsx 메타 title/description 브랜드명 반영
- docs/branding/naming-decision.md 작성
- smoke.spec.ts 정규식 /Seeya/i 업데이트
- apps/web/src/app/.ai.md, docs/branding/.ai.md 최신화
**미완료 항목**: 없음
**변경 파일**: 7개
