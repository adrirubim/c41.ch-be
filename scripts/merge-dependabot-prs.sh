#!/usr/bin/env bash
# Merge all Dependabot PRs into main and push.
# Run from WSL: bash merge-dependabot-prs.sh

set -e
cd "$(dirname "$0")"

echo "==> Updating main..."
git checkout main
git pull origin main

# Only branches with the latest version of each package (avoid 12.50.0 and pail-1.2.5)
COMPOSER_BRANCHES=(
  "origin/dependabot/composer/laravel/framework-12.51.0"
  "origin/dependabot/composer/laravel/pail-1.2.6"
  "origin/dependabot/composer/nunomaduro/collision-8.9.0"
  "origin/dependabot/composer/inertiajs/inertia-laravel-2.0.20"
  "origin/dependabot/composer/laravel/fortify-1.34.1"
)

NPM_BRANCHES=(
  "origin/dependabot/npm_and_yarn/npm_and_yarn-446eb23a19"
  "origin/dependabot/npm_and_yarn/lucide-react-0.563.0"
  "origin/dependabot/npm_and_yarn/tiptap/extension-table-3.19.0"
  "origin/dependabot/npm_and_yarn/tiptap/extension-link-3.19.0"
  "origin/dependabot/npm_and_yarn/lightningcss-win32-x64-msvc-1.31.1"
  "origin/dependabot/npm_and_yarn/react-dom-19.2.4"
)

merge_branch() {
  local ref=$1
  echo ""
  echo "==> Merge: $ref"
  if git merge "$ref" --no-edit; then
    echo "    OK"
  else
    # Resolve conflict in composer.lock: keep our lockfile and update only the package
    if [ -f composer.lock ] && grep -q '^<<<<<<<' composer.lock; then
      echo "    Resolving conflict in composer.lock..."
      git checkout --ours composer.lock
      composer update laravel/fortify --no-interaction --no-scripts 2>/dev/null || true
      composer update laravel/fortify --no-interaction
      git add composer.lock
      git commit --no-edit
      echo "    OK (resolved)"
    else
      echo "    CONFLICT. Resolve manually, then run: git add . && git commit --no-edit"
      exit 1
    fi
  fi
}

for ref in "${COMPOSER_BRANCHES[@]}"; do
  merge_branch "$ref"
done

for ref in "${NPM_BRANCHES[@]}"; do
  merge_branch "$ref"
done

echo ""
echo "==> Installing dependencies..."
composer install --no-interaction --prefer-dist --optimize-autoloader
npm ci

echo ""
echo "==> Building assets..."
npm run build

echo ""
echo "==> Running tests..."
php artisan test

echo ""
echo "==> Pushing to origin/main..."
git push origin main

echo ""
echo "Done. All selected Dependabot PRs have been merged into main."
