# chore: 테스트 이슈 생성

## 목적
이슈 생성 및 Project Board 자동화가 정상 동작하는지 검증

## 배경
이슈 생성 잘 되나 테스트. 잘 되면 바로 finish.

## 완료 기준
- [x] GitHub Issue가 정상 생성되고 Project Board의 Backlog에 자동 배치된다
- [ ] 이슈 생성 후 바로 close 처리한다 (테스트 완료) → PR 머지 시 자동 close

## 개발 체크리스트
- [ ] 해당 디렉토리 .ai.md 최신화
## 작업 내역
- GitHub Issue #1 정상 생성 확인 (Project Board "In Progress" 상태)
- 이슈 작업 문서(`00_issue.md`, `01_plan.md`) 작성
- PR 머지 시 `Closes #1`로 자동 close 처리 예정
