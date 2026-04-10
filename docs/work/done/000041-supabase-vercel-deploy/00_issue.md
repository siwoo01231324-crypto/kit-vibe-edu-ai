# chore: 시드 데이터 + Supabase 원격 + Vercel 배포 + 데모 준비

## 목적
공모전 제출을 위한 Vercel 라이브 데모 URL, 시드 데이터, 데모 스크립트를 최종 패키징한다.

## 배경
dev-spec §7.3 D6~D7 — 배포 + 데모 시나리오 리허설. dev-spec §7.4 공모전 제출 체크리스트. 7일 MVP 완성의 마지막 관문.

## 완료 기준 (AC)
- [x] `supabase/seed.sql` — 테스트 교사 + 데모 세션 1개 + 문항 5개 + 응답 20개 이상
- [x] 원격 Supabase 프로젝트 생성 + `supabase db push` 로 마이그레이션 적용
- [x] Vercel 프로젝트 생성 + 자동 배포 연결
- [x] Vercel 환경변수 등록 (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_BASE_URL`)
- [ ] Vercel 라이브 URL 에서 교사 로그인 → 데모 세션 진행 → AI 인사이트 생성 → 수업 초안 생성 3분 이내 완료 검증
- [ ] 백업 영상 녹화 (네트워크 장애 대비)
- [x] `docs/demo/demo-script.md` — 3분 데모 스크립트
- [x] `README.md` 에 라이브 URL + 실행 방법 추가

## 구현 플랜
1. `supabase/seed.sql` 작성 (기존 seed 확장)
2. Supabase 원격 프로젝트 생성 → 키 발급 → `supabase link` → `supabase db push`
3. Vercel 프로젝트 import → 환경변수 세팅 → deploy
4. 라이브 URL smoke test (교사/학생/AI 3플로우)
5. 데모 스크립트 + 백업 영상

## 환경 세팅 (사용자 수동 작업 포함)
- **Supabase 원격 프로젝트 생성** (https://supabase.com/dashboard)
  - Project Name: `kit-vibe-edu-ai`
  - DB 비밀번호 안전하게 저장
  - Auth → Google Provider 활성화 + Client ID/Secret 등록 (운영용)
  - API → anon/service_role 키 복사
- **Google OAuth (운영용)** 승인 리디렉션 URI 에 `https://<ref>.supabase.co/auth/v1/callback` 및 Vercel 도메인 추가
- **Vercel 계정** + 프로젝트 생성 + GitHub 연동
- Vercel Environment Variables (Production) 에 위 5개 키 입력

## 의존성
- 선행: #39, #40 (테스트 통과 확인 후 배포)
- 병렬 가능: 없음 (최종 단계)

## 참고
- dev-spec §7.3 D1~D7 일정
- dev-spec §7.4 공모전 제출 체크리스트
- dev-spec §2.3 환경변수 템플릿

## 개발 체크리스트
- [ ] 라이브 URL smoke test 통과 확인 (수동)
- [x] `docs/demo/.ai.md` 작성
- [x] `docs/ai-report/daily-log.md` 기록 (불변식 1)
- [ ] AI 생성 데모 스크립트 인간 검토 후 커밋 (불변식 2)
- [ ] 불변식 위반 없음

## 작업 내역

### 2026-04-10

**현황**: 3/8 AC 완료
**완료된 항목**:
- `supabase/seed.sql` (세션 1 + 문항 5 + 응답 25)
- `docs/demo/demo-script.md` (3분 타임라인 + 폴백)
- `README.md` 라이브 URL + 실행 방법

**미완료 항목** (사용자 수동 작업):
- Supabase 원격 프로젝트 생성 + db push
- Vercel 프로젝트 생성 + 환경변수 등록
- 라이브 URL smoke test
- 백업 영상 녹화

**변경 파일**: 7개
- `supabase/seed.sql` (전면 교체)
- `supabase/fallback-ai-seed.sql` (신규)
- `docs/demo/manual-deploy-guide.md` (신규)
- `docs/demo/demo-script.md` (신규)
- `docs/demo/.ai.md` (신규)
- `README.md` (라이브 데모 섹션 추가)
- `apps/web/.env.example` (`NEXT_PUBLIC_BASE_URL` 추가)
