# feat: 새 세션 만들기 — 자연어 입력으로 AI가 세션 제목·문항 생성

## 사용자 관점 목표
선생이 \"고1 수학, 피타고라스 정리 퀴즈 5문제 만들어줘\" 처럼 자연어로 입력하면 AI가 세션 제목·과목·학년·문항을 자동으로 채워주고, 선생이 확인·수정 후 세션을 생성할 수 있다.

## 배경
현재 `/teacher/sessions/new` 는 제목·과목·학년을 수동으로 입력해야 한다. 자연어 입력 → AI 파싱 흐름을 추가해 세션 생성 마찰을 줄인다.

## 완료 기준
- [x] 자연어 textarea에 입력 후 "AI로 채우기" 버튼 클릭 시, AI가 세션 제목·과목·학년·문항(선택)을 파싱해 폼 필드를 자동으로 채운다
- [x] AI가 생성한 결과를 선생이 직접 수정할 수 있는 편집 가능한 폼으로 표시된다 (확인 후 세션 생성)
- [x] AI가 입력을 충분히 파악하지 못한 필드(예: 학년 불분명)에 대해 "이 부분을 좀 더 구체적으로 설명해 주세요" fallback 메시지를 해당 필드 옆에 인라인으로 표시한다
- [x] 기존 수동 입력 폼도 그대로 사용 가능하다 (하위 호환)

## 구현 플랜
1. **`POST /api/sessions/parse-prompt`** 신규 엔드포인트
   - 입력: `{ prompt: string }`
   - Claude API(`callClaude`) 호출 → JSON 구조화 응답 `{ title, subject, grade, questions[], missing[] }` 반환
   - `missing` 배열: AI가 파악 못한 필드 목록 (예: `["grade"]`)
2. **`new/page.tsx`** UI 변경
   - 자연어 textarea + "AI로 채우기" 버튼 추가 (로딩 스피너 포함)
   - AI 응답으로 title/subject/grade 필드 자동 채움 (편집 가능)
   - `missing` 필드에 fallback 안내 메시지 인라인 표시
   - 문항 제안이 있으면 세션 생성 후 QuestionEditor 초기값으로 전달
3. **프롬프트 템플릿** `@/lib/prompts/session-parse.ts` 신규 작성
   - 출력 스키마를 JSON으로 고정, missing 필드 판단 로직 포함

## 개발 체크리스트
- [ ] 테스트 코드 포함
- [ ] 해당 디렉토리 .ai.md 최신화
- [ ] 불변식 위반 없음

## 작업 내역

### 2026-04-11

**현황**: 4/4 완료 (구현 완료, 커밋 대기)
**완료된 항목**:
- 자연어 textarea + "AI로 채우기" 버튼 → 폼(제목/과목/학년) + 문항 자동 채움
- AI 결과 편집 가능한 폼으로 표시 (문항 미리보기 포함)
- missing 필드 fallback 메시지 인라인 표시
- 기존 수동 입력 폼 하위 호환
**변경 파일**: 6개 (session-parse.ts, anthropic.ts, parse-prompt/route.ts, create-with-content/route.ts, new/page.tsx, session-parse.test.ts)
**테스트**: vitest 10/10 통과
