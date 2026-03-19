# AI Runtime Setup

Operational guide for enabling and running editorial AI safely in `c41.ch-be`.

---

## 1) What is already implemented

- Backend endpoint: `POST /posts/editorial-suggestions`
- Frontend integration: post create/edit pages
- Guardrails:
  - Global feature flag (`AI_ENABLED`)
  - Admin-only rollout toggle (`AI_EDITORIAL_ADMIN_ONLY`)
  - Dedicated throttle (`AI_EDITORIAL_RATE_LIMIT_ATTEMPTS`)
  - Structured logs without prompt/body persistence
  - Fallback to local deterministic suggestions when provider is unavailable

---

## 2) Environment variables

Add these variables in your runtime environment:

```ini
AI_ENABLED=false
AI_EDITORIAL_ADMIN_ONLY=true
AI_EDITORIAL_RATE_LIMIT_ATTEMPTS=6
AI_PROVIDER=openai
AI_MODEL=gpt-4o-mini
OPENAI_API_KEY=
```

Notes:
- Keep `AI_ENABLED=false` by default until credentials and rollout checks are complete.
- `AI_PROVIDER` / `AI_MODEL` are runtime-configurable and allow provider/model swap without code changes.

---

## 3) Recommended rollout plan

1. **Local smoke (safe mode)**
   - `AI_ENABLED=false`
   - Validate endpoint returns controlled `503` and UI fallback behavior.
2. **Credential validation**
   - Set `OPENAI_API_KEY`
   - Keep `AI_EDITORIAL_ADMIN_ONLY=true`
3. **Limited production rollout**
   - Enable only for admin/editor users
   - Monitor logs and latency
4. **Scale cautiously**
   - Tune `AI_EDITORIAL_RATE_LIMIT_ATTEMPTS`
   - Re-evaluate model/cost monthly

---

## 4) Security and privacy checklist

- Never commit `.env` or real API keys.
- Keep prompts free of secrets/credentials.
- Log metadata only:
  - `request_id`
  - `user_id`
  - `latency_ms`
  - estimated token/cost metadata
- Keep fallback path active to avoid editorial downtime.

---

## 5) Verification commands

```bash
npm run lint
npm run types
php artisan test --filter=Post
php artisan test
```

Manual endpoint checks:

- With `AI_ENABLED=false`:
  - Expect `503` with safe message.
- With `AI_ENABLED=true` and admin user:
  - Expect `200` with `{ excerpt, tags }`.
- With non-admin and admin-only enabled:
  - Expect `403`.
- Exceed throttle:
  - Expect `429`.

---

## 6) Troubleshooting

- **Always returning fallback suggestions**
  - Verify `AI_ENABLED=true`
  - Verify provider key exists (e.g., `OPENAI_API_KEY`)
  - Verify `AI_PROVIDER` / `AI_MODEL` values are valid
- **403 on editorial suggestions**
  - Check `AI_EDITORIAL_ADMIN_ONLY`
  - Check user has `is_admin=true`
- **429 too frequently**
  - Increase `AI_EDITORIAL_RATE_LIMIT_ATTEMPTS` carefully
- **Unexpected provider failures**
  - Keep feature enabled only for admin users while investigating logs

