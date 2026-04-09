# feat: 세션 활성화·종료 API + QR 코드 생성 (IU-05)

## 사용자 관점 목표
교사가 "세션 시작" 버튼을 누르면 QR 코드와 참여 URL 이 표시되고, 수업이 끝나면 "종료" 버튼으로 세션을 마감할 수 있다.

## 배경
dev-spec §4.1 — `POST /api/sessions/[id]/activate`, `POST /api/sessions/[id]/end` 두 엔드포인트가 `sessions.status` 를 `draft → active → ended` 로 전이시킨다. 상태 변경은 학생 클라이언트에 Realtime 으로 전파된다 (dev-spec §4.3 `session:{id}:status`).

## 완료 기준 (AC)
- [ ] `POST /api/sessions/[id]/activate` — status `draft → active`, `started_at = now()`, 소유권 체크
- [ ] `POST /api/sessions/[id]/end` — status `active → ended`, `ended_at = now()`
- [ ] QR 코드 생성 (`qrcode` 패키지) — `${BASE_URL}/join/${join_code}` 기준
- [ ] QR 이미지 다운로드 버튼 (PNG)
- [ ] `apps/web/src/app/(teacher)/sessions/[id]/live/page.tsx` — QR + join_code + 시작/종료 버튼
- [ ] 통합 테스트 TEST-IU5-I04: activate 호출 → status 변경
- [ ] 통합 테스트: end 호출 → `ended_at` 저장

## 구현 플랜
1. RED: `apps/web/tests/integration/api/session-lifecycle.test.ts`
2. GREEN: 2개 Route 핸들러 구현 + 상태 전이 검증 로직
3. `apps/web/src/components/shared/QRCodeDisplay.tsx` — `qrcode.toDataURL()`
4. Live 페이지 UI

## 환경 세팅
- `NEXT_PUBLIC_BASE_URL` 환경변수 추가 (`apps/web/.env.local`):
  ```
  NEXT_PUBLIC_BASE_URL=http://localhost:3000
  ```
- `npm i qrcode @types/qrcode`

## 의존성
- 선행: #28, #29
- 병렬 가능: #32, #36

## 참고
- dev-spec §4.1 활성화/종료 API
- dev-spec §5 IU-05 QR 생성 로직
- dev-spec §4.3 session:{id}:status Realtime 채널

## 개발 체크리스트
- [ ] 통합 테스트 코드 작성 (Vitest)
- [ ] `apps/web/src/components/shared/.ai.md`, `apps/web/src/app/(teacher)/sessions/.ai.md` 최신화
- [ ] `docs/ai-report/daily-log.md` 기록 (불변식 1)
- [ ] AI 생성 코드 인간 검토 후 커밋 (불변식 2)
- [ ] 불변식 위반 없음



## 작업 내역

### 구현 완료 (2026-04-09)

#### 추가된 파일
- `apps/web/src/app/api/sessions/[id]/activate/route.ts` — POST 핸들러: draft→active 상태 전이, started_at 저장, 소유권 체크
- `apps/web/src/app/api/sessions/[id]/end/route.ts` — POST 핸들러: active→ended 상태 전이, ended_at 저장
- `apps/web/src/components/shared/QRCodeDisplay.tsx` — qrcode 패키지로 QR 생성, PNG 다운로드 버튼 포함
- `apps/web/src/app/teacher/sessions/[id]/live/page.tsx` — LiveSessionClient: QR + join_code + 세션 종료 버튼
- `apps/web/tests/integration/api/session-lifecycle.test.ts` — 통합 테스트 (TEST-IU5-I04: activate→status, end→ended_at)

#### 수정된 파일
- `apps/web/src/app/teacher/sessions/[id]/edit/page.tsx` — live 페이지 링크 추가
- `apps/web/package.json` — qrcode, @types/qrcode 의존성 추가
- `docs/ai-report/daily-log.md` — AI 활용 내역 기록 (불변식 1)

#### 완료된 AC
- [x] POST /api/sessions/[id]/activate — status draft→active, started_at, 소유권 체크
- [x] POST /api/sessions/[id]/end — status active→ended, ended_at
- [x] QR 코드 생성 (qrcode 패키지)
- [x] QR 이미지 다운로드 버튼 (PNG)
- [x] /teacher/sessions/[id]/live 페이지
- [x] 통합 테스트 TEST-IU5-I04
- [x] 통합 테스트: end 호출 → ended_at 저장
