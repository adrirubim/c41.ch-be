# Architecture Guidelines

This document defines the architectural standards and guardrails for the C41.ch Backend project. It is the primary reference for senior engineers and architects when making structural or cross-cutting decisions.

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

**Components (`resources/js/components/`)**
- Reusable, presentation-focused components.
- React components use `PascalCase.tsx` naming.
- Do not contain routing or data-fetch responsibilities.

**Layouts (`resources/js/layouts/`)**
- Define shared page structure (navigation, shell, theming).
- Wrap pages to provide consistent UX and state containers.

**Hooks (`resources/js/hooks/`)**
- Encapsulate reusable stateful logic (e.g. filters, command palette, wayfinder).
- Are pure TypeScript/React logic with strong typing, no `any`.

**Types (`resources/js/types/`)**
- Central location for shared TypeScript interfaces and type aliases.
- All API contracts used in the frontend must be represented here.

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

- **Directories and non-React files**: `kebab-case` naming (e.g. `post-repository.php`, `html-purifier-service.php`) except where Laravel conventions require `StudlyCase` class names.
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

## C41.ch Backend – Architecture Guidelines (2026)

This document defines the frontend architecture rules for `c41.ch-be`.  
All new code **must** follow these guidelines. The CI "Quality Gate" enforces them via `npm run lint` and `npm run types`.

---

## 1. Directory Layout & Responsibilities

### 1.1 `src/modules/*` – Domain Modules

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

### 1.2 `src/shared/*` – Cross-cutting Concerns

- **Purpose**: Reusable, app-wide primitives:
  - Shared React components (forms, editors, UI primitives, etc.)
  - Shared hooks (`use-*`) used by multiple domains
  - Shared utilities (`utils`, formatting helpers, etc.)
  - Shared types that are not tied to a single domain
- Rules:
  - Code here must be **domain-agnostic**. If it requires knowledge of a specific domain, move it to `src/modules/<domain>`.
  - Keep APIs stable and well typed; `resources/js` should consume these via aliases, never via deep relative imports.

### 1.3 `src/core/*` – Application Core

- **Purpose**: Global, app-level infrastructure for the frontend:
  - Root server/bootstrap logic (e.g. Node server, SSR bridge)
  - Global layouts and shells that wrap multiple domains
  - Global constants (e.g. API endpoints, routes metadata)
  - Global types that truly apply to the entire app
- `src/core` should **not** contain domain logic or domain-specific UI.

### 1.4 `resources/js/*` – View Layer Only

- **Purpose**: **View composition** for the Laravel/Inertia entrypoints.
- Contains:
  - Page components (Inertia pages)
  - Layouts wired to Laravel routes
  - Thin wrappers that re-export hooks/utils/components from `src/modules` and `src/shared`
- Rules:
  - **No heavy business logic** lives in `resources/js`. Logic must live in `src/modules` or `src/shared` and be imported via aliases.
  - `resources/js/hooks/*` and `resources/js/lib/*` must remain **thin re-export wrappers** only.

---

## 2. Naming Conventions

### 2.1 React Components – `PascalCase.tsx`

- Files that **export React components** must be named in **PascalCase** with `.tsx`:
  - ✅ `DashboardStatsGrid.tsx`
  - ✅ `PostsShowLayout.tsx`
  - ✅ `RichTextEditor.tsx`
- Inside a file, the **default/exported component name** must match the file name.

### 2.2 Logic, Hooks, Utilities – `kebab-case.ts` / `kebab-case.tsx`

- Non-component files (logic, hooks, services, utils, types) must use **kebab-case**:
  - Hooks: `use-posts-index-page.ts`, `use-filter-presets.ts`, `use-autosave.ts`
  - Utils: `format-date.ts`, `api-endpoints.ts`
  - Types: `filter-presets.ts`, `editor.types.ts`
- When a hook returns JSX/components and must be `.tsx`, it **still uses kebab-case** in the filename:
  - ✅ `use-keyboard-shortcuts.tsx`

### 2.3 Directories – `kebab-case`

- All directories must use **kebab-case**:
  - ✅ `rich-text-editor/`, `two-factor/`, `post-integration/`
  - ❌ `RichTextEditor/`, ❌ `TwoFactor/`

---

## 3. Typing Policy – Zero `any`

- **Global policy**: **`any` is not allowed**.
  - The ESLint rule `@typescript-eslint/no-explicit-any` is enabled and enforced in CI.
- When you need a flexible type:
  - Prefer **`unknown`** over `any` for untrusted or generic values.
  - Define **interfaces / type aliases** for structured data:
    - ✅ `interface FilterPreset { id: string; name: string; filters: Record<string, unknown>; createdAt: Date }`
- Use `unknown` at the boundaries (e.g. API responses), then **narrow and validate** before use.

---

## 4. Boolean Expressions – Be Explicit

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

## 5. Import Aliases – No Deep Relative Paths

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

## 6. CI/CD Quality Gate

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

## 8. 2026 Enterprise Quality Checklist

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

