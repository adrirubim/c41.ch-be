# Security Policy

## Supported Versions

We release security updates for the following versions:

| Version | Supported |
| ------- | --------- |
| main    | ✅         |

---

## Reporting a Vulnerability

If you discover a security issue in this backend, please report it **privately**.

**Do not** open a public GitHub issue for security-sensitive topics.

### How to report

1. **Email:** [adrianmorillasperez@gmail.com](mailto:adrianmorillasperez@gmail.com)  
   Suggested subject: `[Security] c41.ch-be – short description`.
2. **Include:**
   - Description of the vulnerability
   - Steps to reproduce (requests, payloads, environment)
   - Impact and affected endpoints or components
   - Suggested fix or workaround (optional)

### What to expect

- You will receive an acknowledgement as soon as possible.
- We will work on a fix and keep you updated.
- After resolution, we may publish a security advisory (with credit if you agree).

---

## Do Not Commit Secrets

- Never commit `.env` files or any file containing real credentials.
- Use `.env.example` as a template; set `APP_KEY`, `DB_*`, and other secrets in your environment only.
- Do not commit API keys, database passwords, access tokens, or private keys.

---

## Secure Setup

- **Production**
  - Use `APP_DEBUG=false`.
  - Use a strong `APP_KEY`.
  - Change or remove default seeded users.
- Restrict access to admin panels, logs, and monitoring tools.

---

## Dependency Hygiene

- Run `composer update` and `npm update` periodically in development and review security advisories.
- Prefer security patches and minor updates; test thoroughly before major version upgrades.
