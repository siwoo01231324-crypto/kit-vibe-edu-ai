---
description: 새 이슈를 Backlog에 생성한다. 인수: [type: feat|chore] ["제목"] ["설명"] (모두 선택). 정보가 부족하면 Claude가 질문한다.
---

당신은 프로젝트의 워크플로우 커맨드 `/backlog-issue`를 실행하고 있습니다.

## 인수 파싱

`$ARGUMENTS`에서 다음을 추출한다:
- **type** (선택): `feat` 또는 `chore`
- **제목** (선택): 이슈 제목
- **설명** (선택): 한 줄 배경 설명

## 정보 수집 (대화형)

부족한 정보를 아래 순서로 질문한다:
1. type이 없으면: "feature(feat) 이슈인가요, chore 이슈인가요?"
2. 제목이 없으면: "이슈 제목을 입력해주세요."
3. 설명이 없으면: "배경을 한 줄로 설명해주세요."
4. 구현 플랜이 없으면: "어떻게 구현할 생각인가요? (간단히 한 줄로, 모르면 생략 가능)"

## 구현 플랜 초안 작성

수집한 정보를 바탕으로, 관련 코드·문서를 탐색한 뒤 대략적인 구현 플랜을 작성한다:
- 관련 디렉토리·파일의 `.ai.md` 확인
- 변경 대상 파일 목록 파악
- 작업 순서를 2~5단계로 정리

## 완료 기준 초안 제안

구현 플랜과 수집한 정보를 바탕으로 완료 기준 초안 2~3개를 제안한다.
사용자 확인 또는 수정 후 진행한다.

## 이슈 생성

### type이 feat인 경우

gh issue create 명령으로 다음 본문의 이슈를 생성한다:

```
## 사용자 관점 목표
{제목에서 유추한 사용자 가치}

## 배경
{설명}

## 완료 기준
- [ ] {완료 기준 1}
- [ ] {완료 기준 2}

## 구현 플랜
{구현 접근 방식 — 수집한 내용, 없으면 생략}

## 개발 체크리스트
- [ ] 테스트 코드 포함
- [ ] 해당 디렉토리 .ai.md 최신화
- [ ] 불변식 위반 없음
```

### type이 chore인 경우

gh issue create 명령으로 다음 본문의 이슈를 생성한다:

```
## 목적
{제목에서 유추}

## 배경
{설명}

## 완료 기준
- [ ] {완료 기준 1}
- [ ] {완료 기준 2}

## 구현 플랜
{구현 접근 방식 — 수집한 내용, 없으면 생략}

## 개발 체크리스트
- [ ] 해당 디렉토리 .ai.md 최신화
```

## 프로젝트 보드 → Backlog 이동

이슈 생성 후, 프로젝트 보드에서 "Backlog" 상태로 이동한다:

```bash
# 1. 이슈의 프로젝트 아이템 ID 조회
ITEM_ID=$(gh api graphql -f query='
  query($owner:String!, $repo:String!, $number:Int!) {
    repository(owner:$owner, name:$repo) {
      issue(number:$number) {
        projectItems(first:10) { nodes { id project { id title } } }
      }
    }
  }' -f owner="{OWNER}" -f repo="{REPO}" -F number={이슈번호} \
  --jq '.data.repository.issue.projectItems.nodes[0].id')

PROJECT_ID=$(# 위 쿼리에서 project.id 추출)

# 2. Status 필드 ID 조회
FIELD_ID=$(gh api graphql -f query='
  query($projectId:ID!) {
    node(id:$projectId) {
      ... on ProjectV2 {
        fields(first:20) {
          nodes { ... on ProjectV2SingleSelectField { id name options { id name } } }
        }
      }
    }
  }' -f projectId="$PROJECT_ID" \
  --jq '.data.node.fields.nodes[] | select(.name=="Status") | .id')

BACKLOG_ID=$(# 위 쿼리에서 options[] | select(.name=="Backlog") | .id)

# 3. Backlog으로 이동
gh api graphql -f query='
  mutation($projectId:ID!, $itemId:ID!, $fieldId:ID!, $optionId:String!) {
    updateProjectV2ItemFieldValue(input:{
      projectId:$projectId, itemId:$itemId, fieldId:$fieldId,
      value:{singleSelectOptionId:$optionId}
    }) { projectV2Item { id } }
  }' -f projectId="$PROJECT_ID" -f itemId="$ITEM_ID" \
     -f fieldId="$FIELD_ID" -f optionId="$BACKLOG_ID"
```

실패 시 경고만 출력하고 계속 진행한다.

## 완료 후

생성된 이슈 번호와 URL을 출력한다.
