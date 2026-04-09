# 01_plan — #26 join-code

## AC 체크리스트
- [ ] `apps/web/src/lib/join-code.ts` — `generateJoinCode(): string`
- [ ] `generateUniqueJoinCode(supabase): Promise<string>`
- [ ] 단위 테스트: 길이6, /^[A-Z0-9]{6}$/ 매칭 (100회 샘플링)
- [ ] 통합 테스트: 빈DB→성공, 충돌1회→재시도, 5회충돌→Error throw

## 구현 명세

```typescript
const CODE_LENGTH = 6;
const MAX_RETRY = 5;
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export function generateJoinCode(): string
// Math.random() + CHARS 매핑, CODE_LENGTH개 문자 조합

export async function generateUniqueJoinCode(supabase: SupabaseClient): Promise<string>
// active 세션 대상 중복 검사 루프
// supabase.from('sessions').select('id').eq('join_code', code).eq('status', 'active').maybeSingle()
// MAX_RETRY 초과 시 throw new Error('join_code 생성 실패')
```

## 파일 경로
- `apps/web/src/lib/join-code.ts`
- `apps/web/tests/unit/join-code.test.ts`
- `apps/web/src/lib/.ai.md` (최신화)

## 호환성
- #28 세션 생성 API에서 `generateUniqueJoinCode(supabase)` 직접 import
- `SupabaseClient` 타입은 `@supabase/supabase-js` 에서 import
- DB: `sessions.join_code` UNIQUE 제약 + `idx_sessions_join_code` 인덱스 존재 (#23 완료)
