#!/usr/bin/env bash
# Pre-commit hook: bloqueia commit de credenciais e paths absolutos.
# Para instalar: ln -s ../../scripts/pre-commit.sh .git/hooks/pre-commit
# (ou use core.hooksPath). O hook e no-op se rg nao estiver instalado.

set -euo pipefail

if ! command -v rg >/dev/null 2>&1; then
  exit 0
fi

# Padrões bloqueados:
PATTERNS=(
  'npg_[A-Za-z0-9]{20,}'
  'sk_live_[A-Za-z0-9]{16,}'
  'sk_test_[A-Za-z0-9]{20,}'
  'ghp_[A-Za-z0-9]{36,}'
  'github_pat_[A-Za-z0-9_]{30,}'
  'gho_[A-Za-z0-9]{36,}'
  'xox[baprs]-[A-Za-z0-9-]{10,}'
  'AKIA[A-Z0-9]{14,}'
  'AIzaSy[A-Za-z0-9_\-]{33}'
  'whsec_[A-Za-z0-9]{20,}'
  'Bearer eyJ[A-Za-z0-9_\-]+\.eyJ[A-Za-z0-9_\-]+\.'
  'postgresql://[^:/@\s]+:[^/@\s]+@[a-z0-9.-]+\.neon\.tech'
  'mongodb(\+srv)?://[^:/@\s]+:[^/@\s]+@'
  '^-----BEGIN [A-Z ]*PRIVATE KEY-----'
)

# Paths absolutos que vazam ambient local:
PATH_PATTERNS=(
  '/Users/[a-z_]+/'
  '/home/[a-z_]+/'
  'C:\\\\Users\\\\'
)

staged=$(git diff --cached --name-only --diff-filter=ACM | grep -vE '\.gitmodules$' || true)
if [ -z "$staged" ]; then
  exit 0
fi

content=$(git diff --cached --unified=0 | grep '^+[^+]' | sed 's/^+//' || true)

exit_code=0
for pat in "${PATTERNS[@]}"; do
  if echo "$content" | rg --no-heading -i "$pat" >/dev/null 2>&1; then
    echo "❌ Commit bloqueado: padrão de credencial detectado -> $pat"
    echo "$content" | rg --no-heading -i "$pat" | head -3
    exit_code=1
  fi
done

for pat in "${PATH_PATTERNS[@]}"; do
  if echo "$content" | rg --no-heading "$pat" >/dev/null 2>&1; then
    echo "⚠️  Aviso: caminho absoluto detectado -> $pat"
    echo "$content" | rg --no-heading "$pat" | head -3
    exit_code=1
  fi
done

exit $exit_code
