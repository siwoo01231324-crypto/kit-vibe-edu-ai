#!/usr/bin/env python3
"""
금지 파일 형식 커밋 차단
*.pdf, *.csv, *.pkl, *.parquet 는 커밋 금지 (레포 규칙)

pre-commit 훅 또는 CI에서 실행:
  python scripts/check_forbidden_files.py

CI 모드 (GitHub Actions 자동 감지):
  - CI 환경변수가 설정된 경우 git ls-files 로 트래킹된 전체 파일 검사
  - pre-commit 훅에서는 git diff --cached 로 staged 파일만 검사
"""

import os
import subprocess
import sys

FORBIDDEN_EXTENSIONS = (".pdf", ".csv", ".pkl", ".parquet")

# GitHub Actions 등 CI 환경에서는 staged 파일이 없으므로 전체 트래킹 파일 검사
if os.environ.get("CI"):
    result = subprocess.run(
        ["git", "ls-files"],
        capture_output=True,
        text=True,
    )
else:
    result = subprocess.run(
        ["git", "diff", "--cached", "--name-only"],
        capture_output=True,
        text=True,
    )

violations = [
    f for f in result.stdout.splitlines()
    if f.lower().endswith(FORBIDDEN_EXTENSIONS)
]

if violations:
    print("\n❌ [레포 규칙 위반] 금지 파일 형식 커밋 감지")
    print("   수정 방법: git reset HEAD <파일> 로 스테이징을 취소하세요")
    print("   규칙: *.pdf, *.csv, *.pkl, *.parquet 는 커밋 금지\n")
    for f in violations:
        print(f"   - {f}")
    sys.exit(1)

print("✅ 금지 파일 형식 검사 통과")
