# Architecture Guidelines

This document defines the architectural standards and guardrails for **c41.ch-be** (Laravel + Inertia + React). It is the primary reference for senior engineers when making structural or cross-cutting decisions.

---

## 1. Core Principles

- **Layered architecture**: Request → Controller → Service → Repository → Model, with Events/Listeners for cross-cutting concerns.
- **Single Responsibility**: Each class and function has one primary reason to change.
- **Explicit boundaries**: Clear separation between HTTP layer, domain logic, persistence, and presentation.
- **Type safety**: TypeScript first for all frontend code; no `any` and strict boolean expressions.
- **English-only documentation**: All comments, docblocks, and documentation are written in professional English.
- **Testability**: Business logic must be unit- or integration-testable without HTTP or UI concerns.

---

## 2. Backend Architecture (Laravel)

**Controllers (`app/Http/Controllers/`)**
- Thin orchestration layer.
- Accept requests, delegate to Services, enforce authorization via Policies, and return Inertia responses.
- Contain no domain or persistence logic.

**Services (`app/Services/`)**
- Encapsulate business workflows and cross-aggregate operations.
- Coordinate Repositories, dispatch domain Events, and handle transactions where needed.
- Are framework-aware but avoid direct HTTP concerns.

**Repositories (`app/Repositories/`)**
- Provide an abstraction over Eloquent queries.
- Expose intent-revealing methods (e.g. `findPublishedBySlug`, `getDashboardStats`) instead of ad-hoc query building in controllers.
- Own all complex querying, eager loading, and pagination logic.

**Models (`app/Models/`)**
- Define relationships, attribute casting, accessors/mutators, and small query scopes.
- Do not contain orchestration or cross-aggregate workflows.

**Policies (`app/Policies/`)**
- Centralize authorization rules per aggregate (e.g. `PostPolicy`, `CategoryPolicy`).
- Never mix policy checks with validation or persistence logic.

**Events and Listeners (`app/Events/`, `app/Listeners/`)**
- Capture important domain events (e.g. post created/updated, category deleted).
- Drive side effects such as activity logging and notifications without coupling controllers to those concerns.

---

## 3. Frontend Architecture (React + Inertia + TypeScript)

**Pages (`resources/js/pages/`)**
- One Inertia page component per route-level screen.
- Compose layout, fetch data via props, and wire user interactions to HTTP actions.

**Components**
- **Wrappers** live in `resources/js/components/` (stable `@/components/*` imports).
- **Implementations** live in `src/shared` and `src/modules` (source of truth).
- Wrappers may forward Laravel/Inertia-specific concerns (for example, upload URLs), but must remain thin.

**Layouts (`resources/js/layouts/`)**
- Define shared page structure (navigation, shell, theming).
- Wrap pages to provide consistent UX and state containers.

**Hooks**
- **Wrappers** live in `resources/js/hooks/` (stable `@/hooks/*` imports).
- **Implementations** live in `src/shared` and `src/modules`.

**Types**
- Domain types live with the domain (for example `src/modules/*/types`).
- Shared types live under `src/shared`.
- `resources/js/types/` is reserved for Laravel/Vite/Inertia entrypoint typing needs and thin re-exports.

---

## 4. Cross-Cutting Concerns

**Validation**
- Always use Form Request classes for HTTP validation.
- Keep validation messages and rules consistent and expressive.

**Security**
- Use Policies for authorization, never authorization logic in controllers or views.
- All incoming HTML content is sanitized via `HtmlPurifierService` or equivalent.

**Error Handling**
- Controllers surface domain errors in a user-friendly way, while Services and Repositories throw rich exceptions where appropriate.
- Frontend surfaces errors with consistent toast and inline messaging patterns.

---

## 5. Naming and Structure

- **TypeScript files and directories**: use `kebab-case` for non-component files and folders (see the frontend conventions below).
- **PHP (PSR-4) files**: follow Laravel/PSR-4 conventions — file names match the `StudlyCase` class name (for example `PostRepository.php`, `HtmlPurifierService.php`). Do not use `kebab-case` for PHP class files.
- **React components**: `PascalCase.tsx` (e.g. `PostEditor.tsx`).
- **Scripts**: All utility or maintenance scripts live under `scripts/` with `kebab-case` filenames.
- **Configuration**: Keep framework configuration in `config/` and frontend configuration in the root (e.g. `vite.config.ts`, `eslint.config.js`).

---

## 6. Testing Expectations

- New features must include tests at the appropriate layer (Feature, Integration, or Unit).
- Repositories should have tests that cover query behavior and edge cases.
- Critical business workflows implemented in Services must be exercised end-to-end.

---

## 7. Documentation Expectations

- This file, `README.md`, and `docs/DEVELOPMENT_GUIDE.md` together define the **authoritative architecture contract**.
- Any deviation from these guidelines must be documented with rationale and, where possible, refactored back towards the standard.

---

## 8. Frontend Architecture (2026)

This section defines the **frontend architecture rules** for `c41.ch-be`.

### 8.1 Source of truth: `src/*`, composition: `resources/js/*`

- **`src/*` is the implementation source of truth** for domain logic, shared UI primitives, hooks, and infrastructure.
- **`resources/js/*` is the Laravel/Inertia view layer**:
  - Inertia pages and Laravel-wired layouts live here.
  - Wrappers and re-exports are allowed here to keep Laravel entrypoints stable.
  - Heavy logic must not live here; it must be implemented in `src/*` and consumed via aliases.

CI enforces key rules via `npm run lint` and `npm run types`.

---

## 9. Directory Layout & Responsibilities

### 9.1 `src/modules/*` – Domain Modules

- **Purpose**: Own **feature/domain-specific** logic and components.
- Each top-level folder under `src/modules` represents a **business domain** (e.g. `auth`, `dashboard`, `posts`, `settings`).
- Allowed contents:
  - Domain React components (`PascalCase.tsx`)
  - Domain hooks (`kebab-case.ts` / `kebab-case.tsx`)
  - Domain types and DTOs (`kebab-case.ts`)
  - Domain-specific utilities and services (`kebab-case.ts`)
- What does **not** belong here:
  - Cross-cutting utilities used by many domains → `src/shared`
  - Global app shell, layouts, or composition → `src/core`

### 9.2 `src/shared/*` – Cross-cutting Concerns

- **Purpose**: Reusable, app-wide primitives:
  - Shared React components (forms, editors, UI primitives, etc.)
  - Shared hooks (`use-*`) used by multiple domains
  - Shared utilities (`utils`, formatting helpers, etc.)
  - Shared types that are not tied to a single domain
- Rules:
  - Code here must be **domain-agnostic**. If it requires knowledge of a specific domain, move it to `src/modules/<domain>`.
  - Keep APIs stable and well typed; `resources/js` should consume these via aliases, never via deep relative imports.

### 9.3 `src/core/*` – Application Core

- **Purpose**: Global, app-level infrastructure for the frontend:
  - Root server/bootstrap logic (e.g. Node server, SSR bridge)
  - Global layouts and shells that wrap multiple domains
  - Global constants (e.g. API endpoints, routes metadata)
  - Global types that truly apply to the entire app
- `src/core` should **not** contain domain logic or domain-specific UI.

### 9.4 `resources/js/*` – View Layer Only

- **Purpose**: **View composition** for the Laravel/Inertia entrypoints.
- Contains:
  - Page components (Inertia pages)
  - Layouts wired to Laravel routes
  - Thin wrappers that re-export hooks/utils/components from `src/modules`, `src/shared`, and `src/core`
- Rules:
  - **No heavy business logic** lives in `resources/js`. Logic must live in `src/modules` or `src/shared` and be imported via aliases.
  - `resources/js/hooks/*` and `resources/js/lib/*` must remain **thin re-export wrappers** only.

---

## 10. Naming Conventions

### 10.1 React Components – `PascalCase.tsx` (implementation)

- In `src/*`, files that **implement React components** must be named in **PascalCase** with `.tsx`:
  - ✅ `DashboardStatsGrid.tsx`
  - ✅ `PostsShowLayout.tsx`
  - ✅ `RichTextEditor.tsx`
- Inside a file, the **default/exported component name** must match the file name.

### 10.2 Logic, Hooks, Utilities – `kebab-case.ts` / `kebab-case.tsx`

- Non-component files (logic, hooks, services, utils, types) must use **kebab-case**:
  - Hooks: `use-posts-index-page.ts`, `use-filter-presets.ts`, `use-autosave.ts`
  - Utils: `format-date.ts`, `api-endpoints.ts`
  - Types: `filter-presets.ts`, `editor.types.ts`
- When a hook returns JSX/components and must be `.tsx`, it **still uses kebab-case** in the filename:
  - ✅ `use-keyboard-shortcuts.tsx`

### 10.3 Directories – `kebab-case`

- All directories must use **kebab-case**:
  - ✅ `rich-text-editor/`, `two-factor/`, `post-integration/`
  - ❌ `RichTextEditor/`, ❌ `TwoFactor/`

### 10.4 Wrappers in `resources/js/*`

- In `resources/js/*`, wrappers and re-exports may use legacy naming (including `kebab-case`) as long as:
  - They stay **thin** (no business logic).
  - They forward to `src/*` implementations via aliases (`@shared`, `@modules`, `@core`, `@infra`).
  - New substantial implementations are added to `src/*`, not `resources/js/*`.

---

## 11. Typing Policy – Zero `any`

- **Global policy**: **`any` is not allowed**.
  - The ESLint rule `@typescript-eslint/no-explicit-any` is enabled and enforced in CI.
- When you need a flexible type:
  - Prefer **`unknown`** over `any` for untrusted or generic values.
  - Define **interfaces / type aliases** for structured data:
    - ✅ `interface FilterPreset { id: string; name: string; filters: Record<string, unknown>; createdAt: Date }`
- Use `unknown` at the boundaries (e.g. API responses), then **narrow and validate** before use.

---

## 12. Boolean Expressions – Be Explicit

The project enforces `@typescript-eslint/strict-boolean-expressions`.  
This means **every conditional must be explicit** about what is being checked.

- **Do not** rely on truthiness of arbitrary values:
  - ❌ `if (value) { ... }` when `value` can be a string/number/object.
- Instead, be explicit:
  - ✅ `if (value !== null && value !== undefined) { ... }`
  - ✅ `if (Array.isArray(items) && items.length > 0) { ... }`
  - ✅ `if (flag === true) { ... }`
- When filtering or validating objects, avoid patterns that implicitly treat non-boolean values as conditions:
  - ❌ `optional.filter((key) => args?.[key])`
  - ✅ `optional.filter((key) => args !== undefined && args[key] !== undefined)`

Any new code that violates these rules will fail ESLint and be rejected by CI.

---

## 13. Import Aliases – No Deep Relative Paths

Always use the configured **path aliases** instead of long relative imports.

- **Allowed aliases**:
  - `@` → `resources/js`
  - `@core` → `src/core`
  - `@modules` → `src/modules`
  - `@shared` → `src/shared`
  - `@infra` → `src/infrastructure`

### 5.1 Rules

- **Do not** use deep relative imports like:
  - ❌ `import { something } from '../../../shared/hooks/use-toast';`
- Instead:
  - ✅ `import { useToast } from '@shared/hooks/use-toast';`
  - ✅ `import { useFilterPresets } from '@modules/posts/hooks/use-filter-presets';`
  - ✅ `import { apiGet } from '@infra/api-client';`
- Within `resources/js`, prefer:
  - ✅ `import { useAppearance } from '@/hooks/use-appearance';`
  - ✅ `import { DashboardStatsGrid } from '@modules/dashboard/components/DashboardStatsGrid';`

If you catch yourself counting `../`, you are probably breaking this rule. Reach for an alias instead.

---

## 14. CI/CD Quality Gate

All contributions must pass the **Quality Gate** before they can be merged.

- The GitHub Actions workflow in `.github/workflows/lint.yml` enforces:
  - **`npm run lint`** – ESLint with strict TypeScript rules (no `any`, strict boolean expressions, etc.).
  - **`npm run types`** – TypeScript type-check (`tsc --noEmit`) with `strict: true`.
  - **`npm run build:frontend`** – Production Vite build verification.
- A pull request that fails any of these commands is considered **non-compliant** and must be fixed before merging.

**Summary**:  
Follow the directory responsibilities, naming conventions, typing rules, explicit boolean checks, and alias usage described above.  
The CI pipeline is configured to enforce these guidelines so that the `c41.ch-be` codebase remains clean, predictable, and enterprise-ready in 2026 and beyond.

---

## 15. 2026 Enterprise Quality Checklist

This checklist is **mandatory** for all future commits and pull requests. Any violation is considered a **blocking issue**.

### 8.1 Source Purity

- **Rule**: No `.js` files are allowed under `resources/js/` or `src/`.
  - All source files in these trees **must** use `.ts` or `.tsx` extensions.
  - Existing `.js` files must be migrated to `.ts`/`.tsx` or removed as part of ongoing refactors.

### 8.2 Language Policy

- **Rule**: All comments, JSDoc/docblocks, commit messages, and project documentation **must be written in professional English**.
  - Spanish and any other non-English languages are **forbidden** inside the codebase and documentation.
  - Variable names, function names, and class names must also use English.

### 8.3 Boolean Expressions

- **Rule**: All conditionals **must be explicit**.
  - Do **not** use generic truthiness checks.
  - Prefer explicit null/undefined checks:
    - ✅ `if (value !== null && value !== undefined) { ... }`
    - ✅ `if (flag === true) { ... }`
    - ✅ `if (items !== null && items !== undefined && items.length > 0) { ... }`
  - Patterns like `if (value)`, `!!value`, or relying on falsy coercion are **forbidden** except when the type is a strict boolean and explicitly documented.

### 8.4 Type Safety – Zero `any`

- **Rule**: The project enforces a **zero `any` policy**.
  - `any` is **forbidden** in all TypeScript code (including generics and type assertions).
  - Use `unknown` for untrusted or generic values and **narrow** them before use.
  - Prefer specific interfaces and type aliases that model the domain instead of loose shapes.

### 8.5 Architecture Boundaries

- **Rule**: All **business and domain logic** must live in:
  - `src/modules`
  - `src/shared`
  - `src/core`
- `resources/js` is strictly the **View Layer**:
  - Inertia page components, layouts, and thin composition wrappers only.
  - No domain rules, persistence logic, or complex workflows are allowed in `resources/js`.
  - View-layer code should consume logic from `src/modules`, `src/shared`, or `src/core` via path aliases.

### 8.6 CI/CD Enforcement

- **Rule**: Any pull request that fails **either** of the following commands is **automatically rejected**:
  - `npm run lint`
  - `npm run types`
- CI must be green before merge:
  - No manual overrides or "force merges" are allowed for lint or type-check failures.
  - Engineers are responsible for running these commands locally before opening or updating a PR.

---

## 16. Data Contracts & Immutability

Data exchange between architectural layers must be explicit, immutable, and intention-revealing.

- **No untyped array handoff for business workflows**:
  - Controllers, Services, and Repositories must not pass ad-hoc associative arrays for core domain operations.
  - Use dedicated DTOs per use case (for example filter DTOs, upsert DTOs, and command-style input DTOs).
- **Immutable DTO standard**:
  - DTOs in backend domain/application boundaries must be implemented as `readonly` value objects whenever applicable.
  - DTO constructors and named factories must normalize and validate shape assumptions early (for example booleans, IDs, sort options, and nullable dates).
- **Contract ownership**:
  - Each DTO must expose explicit conversion methods (for example persistence mapping or view payload mapping) instead of leaking internal shape assumptions to callers.
  - Cross-layer contracts must be stable and versioned through code review; breaking changes require coordinated updates across all consuming layers.

This rule ensures predictable refactoring, minimizes hidden coupling, and improves static-analysis quality at PHPStan Level 8+.

---

## 17. Strict Typing Standards

The backend codebase follows a strict typing baseline aligned with enterprise static analysis.

- **`declare(strict_types=1)` is mandatory** in new and refactored PHP classes (Controllers, Services, Repositories, DTOs, domain utilities).
- **Typed APIs by default**:
  - Public methods must define precise parameter and return types.
  - Iterable parameters and return values must declare value types via PHPDoc generics where native PHP typing is insufficient.
- **Collection and paginator generics are required**:
  - Use explicit PHPDoc templates for Eloquent collections and paginators (for example `Collection<int, Category>` and `LengthAwarePaginator<int, Post>`).
- **Eloquent interoperability for static analysis**:
  - Models must expose analyzer-friendly metadata (`@mixin` and typed relationships) so static tools can safely resolve query methods and static model factories.
- **Nullability is explicit**:
  - Methods returning framework values that may be nullable (for example model refresh operations) must normalize before downstream usage.
  - Event dispatch payloads must never rely on nullable model states.

Strict typing is a non-negotiable quality gate and must be preserved in every incremental refactor.

---

## 18. Modern Stack (Laravel 13 & AI)

The project must use native Laravel 13 capabilities before introducing custom alternatives.

- **Caching strategy**:
  - Prefer Laravel-native stale-while-revalidate semantics through `Cache::flexible(...)` for read-heavy datasets where eventual freshness is acceptable.
  - Reserve manual cache orchestration patterns for exceptional cases that cannot be expressed by framework primitives.
- **Framework-first approach**:
  - Prefer native Eloquent, validation, policy, queue, event, and caching features over hand-rolled implementations.
  - Any custom implementation that replaces an available Laravel 13 primitive requires documented architectural rationale.
- **AI integration guardrails**:
  - AI-assisted workflows must remain behind explicit service boundaries with typed input/output contracts.
  - Fallback behavior must be deterministic and safe when providers are unavailable.
  - Configuration values must come from `config(...)` accessors (never direct `env(...)` calls in services).
- **Operational reliability**:
  - New AI and cache paths must be observable, testable, and safe under static analysis constraints.
  - Refactors that introduce modern stack features must preserve compatibility with CI checks and quality gates.
- **Model attribute metadata (Laravel 13 analyzer support)**:
  - Avoid legacy `protected $fillable` / `protected $casts` in `app/Models`.
  - Prefer the attribute-based configuration via:
    - `#[Fillable([...])]` and `#[Cast([...])]` (implemented in `app/Infrastructure/Eloquent/Attributes/*`)
    - `HasModelAttributes` trait (implemented in `app/Infrastructure/Eloquent/Concerns/HasModelAttributes.php`) to apply those attributes to Eloquent mass-assignment and casting metadata.
  - This keeps model intent explicit and aligned with PHPStan Level 8 static-analysis expectations.

These rules ensure that c41.ch-be maximizes Laravel 13 and AI capabilities without sacrificing maintainability, type safety, or production reliability.

