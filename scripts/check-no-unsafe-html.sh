#!/usr/bin/env bash
set -euo pipefail

# Guardrail: `dangerouslySetInnerHTML` is only allowed inside the central SafeHtml component.
# This keeps the XSS surface area small and auditable.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"

ALLOW_FILE="resources/js/components/safe-html.tsx"

# Search only in app-controlled frontend code.
MATCHES="$(
  rg --no-heading --line-number "dangerouslySetInnerHTML" resources/js src \
    --glob "!$ALLOW_FILE" \
    --glob "!**/node_modules/**" \
    --glob "!**/vendor/**" \
    --glob "!**/dist/**" \
    --glob "!**/build/**" \
    --glob "!**/.next/**" \
    --glob "!**/docs/**" \
    || true
)"

if [[ -n "$MATCHES" ]]; then
  echo "ERROR: Found forbidden 'dangerouslySetInnerHTML' usages outside '$ALLOW_FILE':"
  echo "$MATCHES"
  echo
  echo "Fix: use the SafeHtml component (and the SanitizedHtml boundary) instead."
  exit 1
fi

echo "OK: No forbidden 'dangerouslySetInnerHTML' usages found."

