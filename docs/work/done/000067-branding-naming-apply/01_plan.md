# 01_plan — feat: 브랜딩 문서 기반 앱 네이밍 가이드라인 적용

## AC 체크리스트

- [ ] `docs/branding/branding-strategy.md` Section 4 기준으로 최종 브랜드명 1개 확정 (Seeya / Lumi / Echoo 중 선택, 또는 현행 유지 이유 명시)
- [ ] 랜딩 페이지(`apps/web/src/app/page.tsx`) h1, 서브타이틀 → 확정 브랜드명 + 브랜딩 문서 기반 태그라인 적용
- [ ] 로그인 페이지(`apps/web/src/app/login/page.tsx`), 교사 레이아웃(`apps/web/src/app/teacher/layout.tsx`) 앱명 통일
- [ ] `<head>` 메타 title/description 브랜드명 반영 (`apps/web/src/app/layout.tsx`)
- [ ] `docs/branding/naming-decision.md` 작성 — 최종 선택 이유, 탈락 후보 이유 포함

## 개발 체크리스트

- [ ] 테스트 코드 포함 (smoke.spec.ts 앱명 정규식 업데이트)
- [ ] 해당 디렉토리 .ai.md 최신화
- [ ] 불변식 위반 없음

---

## 구현 계획

### 브랜드명 결정: **Seeya (시야)**

`docs/branding/branding-strategy.md` Section 4.3 네이밍 평가 매트릭스 기준:

| 후보 | 점수 | 탈락/선택 이유 |
|------|------|---------------|
| **Seeya** | 29/30 | ✅ **선택** — 한국어 "시야(視野)" + "See ya" + "See+AI" 3중 의미. 서비스 본질("교사의 시야를 넓혀주는 AI")과 정확히 일치. 발음성·기억가용성 모두 최고점 |
| Lumi | 27/30 | 탈락 — 도메인 ★3, lumi.app 일부 사용 중. 의미 레이어가 "빛"에 한정 |
| Echoo | 26/30 | 탈락 — 피드백 루프 메타포는 강하나 "에쿠" 한국어 발음이 어색. 기억가용성 ★4 |

**태그라인**: `교사의 시야를 넓혀주는 AI` (branding-strategy.md Section 4.4 1위 설명 기반)

---

### 변경 대상 파일 목록

| 파일 | 변경 내용 | 현재 값 → 변경 값 |
|------|-----------|------------------|
| `apps/web/src/app/layout.tsx` | metadata title | `'kit-vibe-edu-ai'` → `'Seeya'` |
| `apps/web/src/app/layout.tsx` | metadata description 추가 | (없음) → `'교사의 시야를 넓혀주는 AI'` |
| `apps/web/src/app/page.tsx` | h1 텍스트 (line 41-47) | `Kit Vibe Edu` → `Seeya` |
| `apps/web/src/app/page.tsx` | 서브타이틀 (line 49) | `AI가 만드는 실시간 퀴즈 수업 플랫폼` → `교사의 시야를 넓혀주는 AI` |
| `apps/web/src/app/login/page.tsx` | h1 (line 19) | `Kit Vibe Edu` → `Seeya` |
| `apps/web/src/app/teacher/layout.tsx` | 헤더 앱명 (line 27) | `Kit Vibe Edu` → `Seeya` |
| `apps/web/tests/e2e/smoke.spec.ts` | 정규식 (line 5) | `/Kit Vibe/i` → `/Seeya/i` |
| `docs/branding/naming-decision.md` | 신규 작성 | — |

---

### 단계별 실행 순서

**Step 1 — 브랜드명 문서 확정**
- `docs/branding/naming-decision.md` 작성
  - 최종 선택: Seeya, 선택 이유
  - 탈락 후보(Lumi, Echoo) 이유
  - branding-strategy.md Section 4 참조 명시

**Step 2 — 메타 태그 수정**
- `apps/web/src/app/layout.tsx`
  - `title: 'Seeya'`
  - `description: '교사의 시야를 넓혀주는 AI'` 추가

**Step 3 — 랜딩 페이지 h1 + 서브타이틀**
- `apps/web/src/app/page.tsx` line 41-47
  - h1: `Seeya` (단어 분리 없이 단일 단어로 교체)
  - line 49: 서브타이틀 `교사의 시야를 넓혀주는 AI`

**Step 4 — 로그인 페이지**
- `apps/web/src/app/login/page.tsx` line 19
  - h1: `Seeya`

**Step 5 — 교사 레이아웃 헤더**
- `apps/web/src/app/teacher/layout.tsx` line 27
  - `Kit Vibe Edu` → `Seeya`

**Step 6 — E2E 테스트 업데이트**
- `apps/web/tests/e2e/smoke.spec.ts` line 5
  - `/Kit Vibe/i` → `/Seeya/i`

**Step 7 — .ai.md 최신화**
- `apps/web/src/app/.ai.md` (또는 상위 디렉토리) 업데이트
- `docs/branding/.ai.md` 업데이트

---

### Guardrails

**Must Have**
- 모든 UI에서 "Kit Vibe Edu" → "Seeya" 완전 교체 (grep으로 잔존 여부 확인)
- 태그라인은 반드시 branding-strategy.md Section 4.4 기반 문구 사용
- smoke.spec.ts 정규식 업데이트 필수 (미반영 시 CI 실패)
- naming-decision.md 작성 완료 후 커밋 (문서 없이 코드만 변경 금지)

**Must NOT Have**
- "Kit Vibe Edu", "MirAI", "kit-vibe-edu-ai" 문자열 UI에 잔존
- 임의로 만든 태그라인 (문서 근거 없는 카피)
- 앱명 변경 외 컴포넌트 리팩토링이나 UI 구조 변경
- 테스트 삭제 또는 skip

**주의사항**
- `page.tsx`의 h1은 현재 `Kit{' '}Vibe Edu` 형태로 분리되어 있음 — `Seeya`로 교체 시 불필요한 span/공백 구조 정리 가능하나, 최소 변경 원칙 준수
- smoke.spec.ts는 `getByRole('heading', { name: /Kit Vibe/i })` 구조 — 정규식만 교체
