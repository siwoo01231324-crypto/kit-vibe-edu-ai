#!/bin/bash
set -e

# tsx 가드: npx 또는 tsx가 없으면 graceful exit (프로세스 스폰 없이 경로 체크만)
command -v npx >/dev/null 2>&1 || { echo "npx not found, skipping skill activation"; exit 0; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"
cat | npx tsx skill-activation-prompt.ts
