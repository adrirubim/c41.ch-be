# Technical Guide — c41.ch-be

Single **Flat Master Docs** technical guide for this repository.
If this guide disagrees with the code, **the code wins**.

> This file exists to match the shared “Triton Gold Standard” across the suite.
> Detailed implementation docs live under `docs/` and are linked from here.

---

## Table of Contents

- [Architecture](#architecture)
- [Security](#security)
- [Resilience](#resilience)
- [Observability](#observability)
- [Deployment Guardrails](#deployment-guardrails)
- [Key Files](#key-files)
- [Authorship & Maintenance](#authorship--maintenance)

---

## Architecture

### High-level request/response path

This is a Laravel + Inertia (React) application. The end-to-end flow is documented here:

- `docs/ARCHITECTURE.md`

### Key references

- Development guide: `docs/DEVELOPMENT_GUIDE.md`
- API: `docs/API.md`

---

## Security

Security model details (CSP, headers, rate limiting, policies) live here:

- `docs/SECURITY_MODEL.md`
- `SECURITY.md` (reporting + secrets policy)

---

## Resilience

Key topics (caching + invalidation and safe fallbacks):

- `docs/CACHING_AND_INVALIDATION.md`

---

## Observability

Operational troubleshooting and diagnostics:

- `docs/TROUBLESHOOTING.md`

---

## Deployment Guardrails

Production deployment guidance:

- `docs/deployment/README.md`
- `docs/PRODUCTION_CHECKLIST.md`

Local CI-parity guidance:

- `scripts/dev-verify.sh`

---

## Key Files

- Runtime entrypoints: see `README.md` → Operational Quickstart
- Security headers middleware: `app/Http/Middleware/SecurityHeadersMiddleware.php`

---

## Authorship & Maintenance

Stack: [VERSION_STACK.md](VERSION_STACK.md)

