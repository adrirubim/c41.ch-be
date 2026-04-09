# Documentation Index

Public entry point for the project's technical documentation.

## Development & Reference

- **[DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md)** — Architecture, conventions, best practices
- **[API.md](API.md)** — Endpoints, parameters, authentication
- **[AI_RUNTIME_SETUP.md](AI_RUNTIME_SETUP.md)** — AI runtime configuration, rollout, and guardrails
- **[FRONTEND_COMPONENTS.md](FRONTEND_COMPONENTS.md)** — React components
- **[CUSTOM_HOOKS.md](CUSTOM_HOOKS.md)** — Custom hooks
- **[ARCHITECTURE.md](ARCHITECTURE.md)** — End-to-end request/response flow (middleware → controllers → services → repos), Inertia/SSR, traceability (`request_id`)
- **[CACHING_AND_INVALIDATION.md](CACHING_AND_INVALIDATION.md)** — Cache keys/tags, keyset fallback, and Observer-driven invalidation
- **[SECURITY_MODEL.md](SECURITY_MODEL.md)** — CSP/headers, rate limiting, policies (deny-by-default), and sanitization

## Reference

- **[../VERSION_STACK.md](../VERSION_STACK.md)** — Stack versions (PHP, Laravel, React, etc.)
- **[ARCHITECTURE_GUIDELINES.md](ARCHITECTURE_GUIDELINES.md#15-2026-enterprise-quality-checklist)** — 2026 Enterprise Architecture Checklist
- **[testing/TEST_DATABASE.md](testing/TEST_DATABASE.md)** — Test database setup (SQLite vs PostgreSQL)

> Suite note: the canonical version stack lives at the repository root:
> see [`../VERSION_STACK.md`](../VERSION_STACK.md).

## Deployment

- **[deployment/README.md](deployment/README.md)** — Production deployment (SSH servers and shared hosting/CDMON)
- **[PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md)** — Production ops checklist (health checks, scheduler, backups, media cleanup)

## Support

- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** — Common errors and troubleshooting

## Governance

- **[../CONTRIBUTING.md](../CONTRIBUTING.md)** — Contribution workflow and standards
- **[../SECURITY.md](../SECURITY.md)** — Security policy and vulnerability reporting
