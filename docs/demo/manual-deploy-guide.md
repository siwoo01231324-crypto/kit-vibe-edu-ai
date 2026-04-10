# 배포 가이드 — Supabase 원격 + Vercel (이슈 #41)

> 이 가이드는 사용자가 직접 수행해야 하는 클라우드 설정 단계를 안내합니다.
> AI가 자동화할 수 없는 계정 생성, 환경변수 입력, OAuth 설정을 다룹니다.

---

## 전체 흐름

```
1. Supabase 원격 프로젝트 생성
   ↓
2. 마이그레이션 + 시드 적용
   (교사 로그인 → UUID 확인 → seed.sql 실행)
   ↓
3. Vercel 프로젝트 생성 + 환경변수 등록
   ↓
4. Google OAuth 리디렉션 URI 추가
   ↓
5. Smoke test (3분 플로우 검증)
```

---

## 1단계: Supabase 원격 프로젝트 생성

1. [https://supabase.com/dashboard](https://supabase.com/dashboard) 접속 후 **New project** 클릭
2. 설정:
   - **Project name**: `kit-vibe-edu-ai` (또는 원하는 이름)
   - **Database password**: 안전한 비밀번호 저장 (나중에 필요)
   - **Region**: `Northeast Asia (Tokyo)` 권장
3. 프로젝트 생성 완료 후 **Project Settings > API** 에서 아래 값 복사:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

---

## 2단계: 마이그레이션 적용

로컬 터미널에서 실행:

```bash
# Supabase CLI 로그인 (최초 1회)
supabase login

# 원격 프로젝트 연결 (Project ref는 Dashboard URL에서 확인)
# 예: https://app.supabase.com/project/abcdefghijkl → ref=abcdefghijkl
supabase link --project-ref <project-ref>

# 마이그레이션 적용 (8개 파일 순서대로 실행됨)
supabase db push
```

성공 메시지: `Finished supabase db push.`

---

## 3단계: 교사 계정 생성 + seed.sql 실행

> ⚠️ seed.sql은 반드시 교사 로그인 이후에 실행해야 합니다.
> `handle_new_user` 트리거가 로그인 시 teachers row를 자동 생성하며,
> seed.sql은 그 row에 school 정보만 UPDATE 합니다.

### 3-1. 교사 계정 생성

**방법 A: Google OAuth (운영 권장)**
1. Supabase Dashboard > **Authentication > Providers > Google** 활성화
2. Google OAuth 클라이언트 ID / Secret 입력 (5단계 참고)
3. 앱에서 Google 로그인 수행

**방법 B: 이메일 Magic Link (빠른 테스트용)**
1. Supabase Dashboard > **Authentication > Users > Invite user**
2. 교사 이메일로 초대 링크 발송 → 링크 클릭으로 로그인

### 3-2. 교사 UUID 확인

로그인 완료 후:
1. Supabase Dashboard > **Authentication > Users**
2. 교사 계정의 UUID 복사 (예: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

### 3-3. seed.sql 실행

**방법 1: psql CLI (권장)**

```bash
# DATABASE_URL은 Supabase Dashboard > Settings > Database > Connection string (URI)
psql "$DATABASE_URL" \
  -v teacher_uuid="'여기에-교사-UUID-입력'" \
  -f supabase/seed.sql
```

예시:
```bash
psql "postgresql://postgres:비밀번호@db.abcdef.supabase.co:5432/postgres" \
  -v teacher_uuid="'a1b2c3d4-e5f6-7890-abcd-ef1234567890'" \
  -f supabase/seed.sql
```

예상 출력:
```
 항목 | 개수
------+------
 세션 | 1
 문항 | 5
 응답 | 25
```

**방법 2: Supabase SQL Editor**

1. `supabase/seed.sql` 전체 내용 복사
2. 모든 `:'teacher_uuid'` → `'실제-교사-UUID'` 로 Find & Replace
3. SQL Editor에서 실행

> ⚠️ SQL Editor는 psql `\set` 명령을 지원하지 않으므로 직접 치환이 필요합니다.

---

## 4단계: Vercel 프로젝트 생성

1. [https://vercel.com/new](https://vercel.com/new) 접속 → **Import Git Repository**
2. `kit-vibe-edu-ai` 레포 선택
3. **Configure Project** 설정:
   - **Framework Preset**: `Next.js` (자동 감지)
   - **Root Directory**: `apps/web` ← **반드시 설정**
   - **Build Command**: `npm run build` (기본값)
   - **Output Directory**: `.next` (기본값)

4. **Environment Variables** (아래 5개 모두 입력):

   | 변수명 | 값 | 설명 |
   |--------|-----|------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Supabase Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Supabase anon key |
   | `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Supabase service_role key |
   | `ANTHROPIC_API_KEY` | `sk-ant-...` | Anthropic API key |
   | `NEXT_PUBLIC_BASE_URL` | `https://your-app.vercel.app` | Vercel 배포 URL |

   > ⚠️ `NEXT_PUBLIC_BASE_URL`은 첫 배포 전에는 URL이 미확정입니다.
   > 임시로 `https://placeholder.vercel.app` 입력 후 첫 배포 완료 후 실제 URL로 업데이트하세요.

5. **Deploy** 클릭 → 빌드 완료 후 라이브 URL 확인

6. `NEXT_PUBLIC_BASE_URL` 업데이트:
   - Vercel Dashboard > **Settings > Environment Variables**
   - `NEXT_PUBLIC_BASE_URL` 값을 실제 배포 URL로 수정
   - **Deployments** 탭에서 **Redeploy** (새 값 반영)

### `master` 브랜치 자동 배포 확인

- Vercel Dashboard > **Settings > Git**
- **Production Branch**: `master` 확인
- 이후 `master` 에 push 시 자동 배포됩니다.

---

## 5단계: Google OAuth 설정 (운영용)

> 이메일 Magic Link로 데모할 경우 건너뛸 수 있습니다.

### Google Cloud Console 설정

1. [Google Cloud Console](https://console.cloud.google.com) > **APIs & Services > Credentials**
2. **OAuth 2.0 Client IDs** 생성 (Web Application)
3. **Authorized redirect URIs** 에 아래 두 URI 추가:
   ```
   https://<supabase-project-ref>.supabase.co/auth/v1/callback
   https://your-app.vercel.app/auth/callback
   ```
4. Client ID, Client Secret 복사

### Supabase 설정

1. Supabase Dashboard > **Authentication > Providers > Google**
2. **Enable Sign in with Google** 활성화
3. Client ID, Client Secret 입력 후 저장

---

## 6단계: Smoke Test

배포 완료 후 아래 플로우를 3분 이내에 검증합니다:

```
✅ 라이브 URL 접속 → 랜딩 페이지 표시
✅ Google 로그인 → 교사 대시보드 진입
✅ 'DEMO-001' 세션 확인 (분수의 덧셈과 뺄셈 퀴즈)
✅ 응답 현황 탭 → 학생 5명, 응답 25개 표시
✅ AI 인사이트 생성 클릭 → 30초 내 결과 표시
✅ 수업 초안 생성 클릭 → 30초 내 결과 표시
✅ join_code 'DEMO-001' 학생 입장 URL → 퀴즈 화면 표시
```

---

## 트러블슈팅

### seed.sql 실행 시 FK 위반 오류
```
ERROR: insert or update on table "teachers" violates foreign key constraint
```
→ 원인: 교사가 아직 로그인하지 않아 `auth.users`에 row가 없음  
→ 해결: 교사 로그인 완료 후 seed.sql 재실행

### seed.sql 변수 미주입 오류
```
ERROR: syntax error at or near ":"
```
→ 원인: `-v teacher_uuid=...` 옵션 누락  
→ 해결: `psql "$DATABASE_URL" -v teacher_uuid="'UUID'" -f supabase/seed.sql`

### RLS로 인한 데이터 미표시
→ 교사 로그인 상태에서 Dashboard 접속 확인  
→ Supabase Dashboard > Table Editor 에서 데이터 존재 여부 직접 확인

### OAuth 리디렉션 오류 (redirect_uri_mismatch)
→ Google Cloud Console에서 Supabase + Vercel 콜백 URI 모두 등록 확인  
→ URI 끝에 슬래시(`/`) 불일치 주의

### AI 인사이트 생성 실패
→ `ANTHROPIC_API_KEY` 환경변수 정상 설정 확인  
→ 실패 시 `supabase/fallback-ai-seed.sql` 실행하여 폴백 데이터 삽입
