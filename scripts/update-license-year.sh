#!/usr/bin/env bash
# Updates the copyright year in the root LICENSE file.
# Usage: from repo root, run: ./scripts/update-license-year.sh
# Safe to run multiple times; keeps first year, sets end year to current.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LICENSE_FILE="$REPO_ROOT/LICENSE"
CURRENT_YEAR=$(date +%Y)

if [[ ! -f "$LICENSE_FILE" ]]; then
  echo "LICENSE not found at $LICENSE_FILE" >&2
  exit 1
fi

LINE=$(grep -E '^Copyright \(c\) [0-9]{4}(–[0-9]{4})? .+$' "$LICENSE_FILE" || true)
if [[ -z "$LINE" ]]; then
  echo "No copyright line found in LICENSE; nothing updated." >&2
  exit 1
fi

# First year: 2026 from "Copyright (c) 2026 ..." or 2025 from "Copyright (c) 2025–2026 ..."
FIRST_YEAR=$(echo "$LINE" | sed -nE 's/^Copyright \(c\) ([0-9]{4}).*/\1/p')

if [[ "$FIRST_YEAR" == "$CURRENT_YEAR" ]]; then
  # Single year, already current
  NEW_YEAR_STR="$CURRENT_YEAR"
else
  NEW_YEAR_STR="${FIRST_YEAR}–${CURRENT_YEAR}"
fi

# Replace year or range on the copyright line only (match first occurrence of year or year–year)
if [[ "$(uname -s)" == "Darwin" ]]; then
  sed -i '' -E "s/^(Copyright \\(c\\) )[0-9]{4}(–[0-9]{4})?(.*)/\\1${NEW_YEAR_STR}\\3/" "$LICENSE_FILE"
else
  sed -i -E "s/^(Copyright \\(c\\) )[0-9]{4}(–[0-9]{4})?(.*)/\\1${NEW_YEAR_STR}\\3/" "$LICENSE_FILE"
fi

echo "Updated LICENSE copyright year to: $NEW_YEAR_STR"
