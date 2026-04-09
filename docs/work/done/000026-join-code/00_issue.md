# feat: join_code 생성기 + 충돌 재시도 (lib/join-code)

## 사용자 관점 목표
교사가 세션을 활성화하면 중복되지 않는 6자리 참여 코드가 자동 생성되어 학생에게 공유할 수 있다.

## 배경
dev-spec §5 IU-05 — `join_code` 는 6자리 영숫자 대문자, 활성 세션 내 고유. 충돌 시 5회 재시도 후 실패 throw.

## 완료 기준 (AC)
- [ ] `apps/web/src/lib/join-code.ts` — `generateJoinCode(): string` (순수: 6자리 영숫자 대문자)
- [ ] `generateUniqueJoinCode(supabase): Promise<string>` — 활성 세션 대상 중복 검사 + 5회 재시도
- [ ] 단위 테스트:
  - [ ] 길이 6, 영숫자 대문자만 포함 (100회 샘플링)
  - [ ] `/^[A-Z0-9]{6}$/` 정규식 매칭
- [ ] 통합 테스트:
  - [ ] 빈 DB → 성공 반환
  - [ ] 충돌 1회 → 재시도 후 다른 코드 반환 (mock supabase)
  - [ ] 5회 모두 충돌 → Error throw

## 의존성
- 선행: #22, #23 (Supabase 연결 필요)
- 병렬 가능: #25, #27

## 작업 내역
