# Frontend Polish Roadmap (All Areas - Single Source)

Date: 2026-03-20

Scope: The project is already considered “finished”. This roadmap focuses on incremental
UX/UI + functional polish of what already exists (no major redesigns, no large
architecture rewrites unless required to fix a concrete UX/A11y issue).

Quality bar for all blocks:
- No nested interactive elements (e.g. `<a>` containing `<button>`) on public screens.
- Keyboard and screen-reader usability improvements must be verified with a11y tools.
- Performance improvements must reduce unnecessary re-renders or expensive computations.
- Avoid introducing security regressions (especially around HTML preview rendering).

## Estado actual (audit 2026-03-20)
- Backend already sanitizes persisted post data: `app/Models/Post.php` purifies `content` and `excerpt` on `saving()` using `HtmlPurifierService`.
- Frontend live rendering still uses raw HTML: `EditorPreview` and the public `Post` page both render with `dangerouslySetInnerHTML`, so the XSS surface depends on consistent sanitization/constraints during editing and display.
- A11y is currently not meeting the “no nested interactive elements” bar on public routes: several places render `<Link>` containing `<Button>` (e.g. `resources/js/pages/public/home.tsx` and `resources/js/components/public-header.tsx`).
- Public blog/category filtering now includes processing feedback (disabled apply button + spinner + skeleton list) and contextual empty states.
- `EmptyState` actions now avoid the invalid “Link inside Button” pattern by using `Button asChild`.
- Error announcement/association is incomplete: `InputError` renders an error `<p>` but does not provide `aria-invalid`/`aria-describedby` wiring or a live region for announcement.
- Editor performance is still a TODO: `use-rich-text-editor` calls `onChange(editor.getHTML())` and computes word/character counts on every keystroke without debounce/throttle.
- Editor security constraints are still a TODO on the client: links/images can be inserted without explicit protocol/scheme restrictions before insertion.
- Global keyboard shortcuts currently do not check focus context (`input`, `textarea`, `contenteditable`) before triggering.
- Charts currently provide mostly visual output and require additional accessible roles/names/value semantics to satisfy the chart A11y acceptance criteria.

---

## Block 1 (Editor): Posts editor (Tiptap + toolbar + preview)

Context:
- The project has a rich posts editor using Tiptap (toolbar + link/image dialogs + table editing), with a live preview in the create/edit screens.
- Current investigation highlights that the editor typing pipeline performs multiple expensive operations on each keystroke (propagating HTML into the global form state, computing word/character counts by reading the entire document text, and re-rendering preview markup when open).
- Additionally, the preview currently renders editor HTML via `dangerouslySetInnerHTML` without a visible allowlist/sanitization policy on the frontend (even though the backend sanitizes persisted `Post.content` on save). This means the live preview while typing remains a potential XSS surface.
- Accessibility review also suggests several missing ARIA labels and error-to-field associations, which can impact keyboard/screen-reader users.

Goals:
1. Improve editor typing performance and reduce unnecessary React updates.
2. Improve accessibility (ARIA names/states, error identification).
3. Reduce security risk in preview rendering and editor link/image insertion.
4. Lay groundwork for autosave/drafts at the editor layer.

Non-goals for this first block:
- Large architectural refactors that fully change editor data-flow (those may follow after Quick Wins).

Candidate approaches:
1. Quick Win & Safety (Recommended)
   - Add accessibility fixes first (low-risk, high value).
   - Add debouncing/throttling for keystroke-driven state updates (high impact, contained change).
   - After performance stabilization, implement sanitization/allowlists and URL restrictions for preview and insertion flows.
   - Deliver an autosave/drafts MVP as a later phase.
2. Security First
   - Implement sanitization/allowlist and URL/protocol restrictions before touching performance.
3. Architectural Refactor
   - Fully decouple editor internal content from the Inertia form state and re-sync only at submit/blur.

Recommended design (Block 1):

### P0 (Accessibility + Error Identification)
- Ensure every toolbar button has an accessible name (`aria-label`) when icon-only.
- Ensure toggles expose their active state (`aria-pressed` where applicable).
- Improve field error association:
  - Ensure error elements are connected to inputs via `aria-invalid` / `aria-describedby`.
  - For the rich-text editor area, expose an error anchor in the UI and connect it to the editable region.

### P1 (Performance: Reduce typing-driven work)
- Debounce the HTML propagation from Tiptap `onUpdate` to the page form state.
- Debounce word/character count calculation to reduce expensive full-document reads.
- Debounce preview rendering input when preview UI is open (split view and/or dialog).

### P2 (Security hardening)
- Implement sanitization/allowlist policy for `EditorPreview` rendering (defense-in-depth for live typing):
  - Block script execution vectors (e.g., `script` tags and `on*` handlers).
  - Restrict dangerous URL schemes (e.g., `javascript:`) in links and images.
- Validate/restrict link href before inserting into the editor.
- Restrict image URLs/protocols inserted into the editor.

### P3 (Autosave/drafts MVP)
- Add editor-layer draft saving for `content`, `excerpt`, and `tags` using localStorage.
- Restore drafts on revisit with clear user control (keep as MVP for this roadmap block).

Success metrics / acceptance criteria:
Performance:
- Reduce the number of form updates caused by typing (target: ~<= 10 updates/sec, via debounce).
- When split view or preview modal is open, limit preview DOM reinjection frequency (target: debounced updates, not per keystroke).

Accessibility:
- Keyboard navigation works end-to-end for the editor toolbar and dialogs.
- Screen readers announce toolbar controls with correct names and states.
- Field errors are announced and associated programmatically with their fields.

Security:
- Preview should not execute embedded scripts or event handlers.
- Links/images inserted from the editor must reject disallowed protocols.

### UX/UI Visual Improvements (User-Facing)
These items are intentionally scoped to visual/interaction polish for the posts editor
(toolbar, preview, dialogs, and feedback states). They should be implemented in parallel
with P0/P1 where possible to avoid UI thrash.

Visual polish for the toolbar
- Clear active-state styling consistency for all toggles (list/quote/code/link/table).
- Group related actions with consistent separators and spacing (text formatting vs media vs structure).
- Add subtle hover/focus states for icon buttons, including visible focus ring on keyboard navigation.

Better editor focus and empty state
- Ensure the editable area shows a strong focus indicator when the caret is active.
- Provide a friendly placeholder/empty state when the editor has no content (without interfering with typing).

Preview UX improvements
- Add an explicit loading/skeleton state when the preview dialog/split view is opened and content is being processed.
- Make split view toggle “active/inactive” visually distinct (not only by behavior).
- Ensure preview typography and spacing match the editor prose styling for visual WYSIWYG.

Media upload dialog UX
- Provide clearer “Uploading…” state styling, including a more readable progress indicator and final success/error state.
- When upload is successful, show immediate visual confirmation (toast + dialog close) and ensure the inserted image is visible in the preview.

Word count UX
- Keep word count placement stable (avoid layout jumps during typing).
- If we add status announcements for accessibility, ensure it remains non-intrusive (polite updates, no flicker).

Implementation plan (High level):
Block 1 will be implemented in order: P0 -> P1 -> P2 -> P3 (with P3 optional if timeboxed).

Open questions:
- What exact sanitization policy is acceptable for stored content (allowed tags/attributes)?
- Is `data:` / base64 image support required for UX, or can it be restricted for security?
- Should preview debouncing be always-on or only active when preview UI is open?

---

## Block 2 (Dashboard): polish stats, charts, and navigation feel

1. A11y for charts (High ROI)
   - Add an accessible name/summary for charts (Bar/Pie/Line).
   - For BarChart: expose per-bar value via `role="progressbar"` (or equivalent).
   - For PieChart: provide segment titles/labels or an aggregated accessible summary.
2. Focus-visible and keyboard polish
   - Ensure “card-like” dashboard links show clear `:focus-visible` rings.
   - Confirm keyboard focus order is logical (no focus loss inside cards).
3. Loading/skeleton polish
   - Add skeletons/transitions in Dashboard sections so initial load feels responsive.
   - Reuse existing skeleton components to avoid design drift.
4. Rendering performance polish
   - Memoize chart data/derived values (`useMemo`) to avoid recomputing on every render.
   - Avoid expensive work on every keystroke-like event (dashboard should be stable on navigation).
5. Consistency polish
   - Unify formatting and empty-state UI across “Recent” vs “Most popular”.

---

## Block 3 (Public pages): home/blog/post/categories — polish UX and safety

1. Critical UX/A11y fix: remove nested interactive elements (Public)
   - Replace patterns like `<Link><Button .../></Link>` with a single interactive element.
   - Ensure the DOM never has `<a>` containing `<button>` on public routes.
2. Accessible names for icon-only controls and filters
   - Add `aria-label` for mobile menu trigger buttons (PublicHeader).
   - Add accessible labeling for search input and filter `SelectTrigger` controls.
3. Filter micro-UX polish
   - Add “processing/loading” feedback while applying filters.
   - Avoid showing generic empty states during transitions (use loaders to prevent flicker).
4. Pagination accessibility polish
   - Ensure “Previous/Next” and page links have meaningful accessible labels.
   - Avoid relying on pagination HTML strings alone for screen-reader meaning.
5. Empty state polish (context-aware)
   - Show empty states that include active filter context (search term, category, sort).
   - Use consistent empty-state styling across blog/category pages.
6. Decorative background polish
   - Mark decorative neon background elements as `aria-hidden` / presentational.
   - Respect `prefers-reduced-motion` where applicable.
7. Security polish for post HTML rendering
   - Confirm backend HTML is sanitized before reaching the frontend, since public “Post” uses `dangerouslySetInnerHTML`.
   - Keep any sanitization policy consistent with editor preview rules.

---

## Block 4 (Auth + Settings): polish login/2FA/settings feedback

1. 2FA setup verification flow reliability
   - Fix any potential submit blocking logic that might prevent the confirmation request.
   - Ensure the correct request is triggered and the modal closes via `onSuccess`.
2. Avoid “stuck modal” states in 2FA setup
   - If QR fetch/setup fails (e.g. secret-key issues), allow retry/continue with clear UX.
   - Ensure refetch logic triggers on explicit retry, not only on missing QR.
3. Processing feedback unification
   - Add consistent spinners or `aria-busy` feedback on submit buttons (2FA challenge + settings).
   - Ensure status messages (e.g. “Saved”) use roles/status semantics where needed.
4. Field error accessibility polish (Auth + Settings)
   - Upgrade `InputError` to be announced by screen readers and link errors to inputs.
   - Ensure inputs set `aria-invalid` and reference `aria-describedby` IDs for errors.
5. Focus management polish
   - In 2FA challenge (OTP vs recovery), ensure focus moves predictably when switching modes.

---

## Block 5 (Navigation/Layout + Responsive): polish global UX and keyboard behavior

1. Accessible names for global icon-only controls
   - AppHeader: add `aria-label` to search icon button (icon-only).
   - Mobile header menus: ensure the menu trigger buttons have accessible names.
   - Breadcrumbs: verify semantic landmark and labeling remains correct in all routes.
2. Sidebar navigation accessibility polish
   - Ensure collapsed sidebar items still have accessible names (not only tooltips).
   - Verify `aria-current` or equivalent active-state semantics for the current route.
3. Scroll/focus management for mobile drawers/sheets
   - Improve mobile open/close behavior:
     - Better scroll lock and pointer/focus restoration when overlays open/close.
   - Ensure focus trap works correctly for mobile sheets.
4. Keyboard shortcuts conflict prevention
   - Update global shortcuts (command palette, sidebar toggle shortcuts) to not trigger while
     focus is inside `input`, `textarea`, or contenteditable elements.
5. Responsive consistency polish
   - Ensure breakpoints do not introduce layout jumps or inconsistent spacing between header/sidebar layouts.
   - Confirm consistent touch target sizes in mobile.

---

## Rollout order (suggested)
- Block 1: Editor polish (P0 -> P1 -> P2), include UX/UI visual items where possible.
- Block 2: Dashboard polish (A11y + focus-visible + skeletons + memoization).
- Block 3: Public polish (critical nested interactive fix + labels + loaders + empty states).
- Block 4: Auth/Settings polish (2FA reliability + error accessibility + consistent processing feedback).
- Block 5: Navigation/Layout polish (accessible names + focus/scroll management + shortcut conflict prevention).
- Block 6: Admin UX & Authorization Tests (admin gating in UI + admin vs user authorization tests).

## Verification plan (lightweight)
- Keyboard-only navigation walkthrough for each block (Tab order, focus-visible, no focus traps in dialogs/sheets).
- Screen reader spot-check for key flows: editor toolbar controls, preview dialog/split view, rich-text editor error announcement, public navigation (home/blog/category/post), filter controls + pagination, 2FA, settings status + error messages.
- Axe/Lighthouse checks targeting specific regressions:
  - Nested interactive elements on public routes: confirm there is no `<a>` that contains a `<button>` (and no axe “button must not be nested in…” type violations).
  - Missing accessible names on icon-only controls: confirm every icon-only button has an accessible name.
  - Error announcement wiring: confirm error elements are referenced via `aria-describedby` and inputs set `aria-invalid` when appropriate.
  - Charts: confirm chart containers/labels provide an accessible name/summary and expose per-segment/per-bar values via roles/semantics (where required by the chart type).
- Manual XSS defense-in-depth checks for HTML preview:
  - Editor preview while typing: inject common payloads (e.g. `<script>...</script>`, `onerror=...`, `javascript:` links, and disallowed image URL schemes) and confirm they render inertly (no execution, and links/images are rejected or sanitized).
  - Public “Post” rendering: repeat the same payload attempts via backend-provided content (or seeded content) to confirm the “public post” surface is safe end-to-end.
- Shortcuts + focus-context checks:
  - While focus is inside `input`, `textarea`, or `contenteditable`, verify global shortcuts do not trigger.
  - With focus outside those fields, verify expected shortcuts still trigger.
- If implementing performance work:
  - Verify reduced typing-driven updates (e.g. debounce keeps preview/form updates bounded, and word/character counters update at a controlled rate without jank).
- Admin gating + auth tests:
  - For non-admin users: confirm admin-only UI entry points are not present in DOM (e.g. dashboard/categories links + quick actions/commands).
  - For backend endpoints: confirm `PUT`/`DELETE` authorization uses expected behavior for `admin` vs `user` (403 vs redirect + DB unchanged vs changed).

---

## Tickets Listos Para Implementar (Por Bloque)

### Block 1: Posts editor (Tiptap + toolbar + preview)
1. [P0] Accessibility: add accessible names to icon-only toolbar buttons and consistent toggle states. | Files: `src/shared/components/rich-text-editor/core/EditorToolbar.tsx` | Acceptance: axe shows no “button has no name”; toggles announce active/inactive state where applicable.
2. [P0] Accessibility: make the rich-text editable area and editor-related errors announced by screen readers. | Files: `src/shared/components/rich-text-editor/core/EditorContent.tsx`, `src/shared/components/rich-text-editor/hooks/use-rich-text-editor.ts`, `resources/js/pages/posts/create.tsx`, `resources/js/pages/posts/edit.tsx` | Acceptance: when backend returns a `content` error, the editor region is marked invalid and error text is discoverable via `aria-describedby`.
3. [P0] Accessibility: improve `InputError` semantics for auth/editor forms (role + live region + optional id support). | Files: `resources/js/components/input-error.tsx` | Acceptance: error element(s) have an `id` and are referenced by `aria-describedby` from the related input; error changes are announced (via `role="alert"` or `aria-live`, whichever is chosen).
4. [P1] Performance: debounce/throttle editor `onUpdate` propagation into the page `useForm` state. | Files: `src/shared/components/rich-text-editor/hooks/use-rich-text-editor.ts` | Acceptance: typing updates `setData('content', ...)` not on every keystroke (target <= 10 updates/sec); preview and rest of UI remain stable.
5. [P1] Performance: debounce word/character count computation to avoid full-text recomputation every keypress. | Files: `src/shared/components/rich-text-editor/hooks/use-rich-text-editor.ts` | Acceptance: word count changes at a controlled rate (no noticeable lag); no excessive React rerenders while typing.
6. [P2] Security: sanitize HTML in `EditorPreview` before `dangerouslySetInnerHTML`. | Files: `resources/js/components/editor-preview.tsx` | Acceptance: common XSS payloads render inertly (no script execution); preview still renders allowed formatting.
7. [P2] Security: restrict link href schemes and image URL protocols inserted via the editor UI/upload. | Files: `src/shared/components/rich-text-editor/hooks/use-rich-text-editor.ts` | Acceptance: attempts to insert `javascript:` links (and disallowed image protocols) are rejected with a toast; valid `http(s)` links/images still work.
8. [P1] UX/UI visual polish: stable placeholder/focus styling and clearer upload feedback. | Files: `src/shared/components/rich-text-editor/core/EditorContent.tsx`, `src/shared/components/rich-text-editor/hooks/use-rich-text-editor.ts`, `src/shared/components/rich-text-editor/core/EditorToolbar.tsx`, `resources/js/components/editor-preview.tsx` | Acceptance: caret focus ring is clear; empty editor looks intentional; upload progress shows accurate state and final outcome with no confusing layout jumps.

### Block 2: Dashboard (stats, charts, and navigation feel)
1. [P0] Charts accessibility: add chart container roles/names and value summaries for Bar/Pie/Line. | Files: `resources/js/components/charts/bar-chart.tsx`, `resources/js/components/charts/pie-chart.tsx`, `resources/js/components/charts/line-chart.tsx`, `src/modules/dashboard/components/DashboardCharts.tsx` | Acceptance: screen readers announce chart container name/summary; BarChart exposes per-bar values via semantics (e.g. `role="progressbar"`/`aria-valuenow` or equivalent); PieChart and LineChart expose per-segment/point labels or an aggregated accessible alternative.
2. [P0] Focus-visible: ensure “card-like” dashboard links have visible `:focus-visible` rings. | Files: `src/modules/dashboard/components/DashboardStatsGrid.tsx`, `src/modules/dashboard/components/DashboardPostsLists.tsx` | Acceptance: keyboard Tab highlights every dashboard card link; no focus loss inside the card.
3. [P1] Loading/skeleton polish: add skeletons or stable placeholders for dashboard sections when data is missing/slow. | Files: `resources/js/pages/dashboard.tsx`, reuse `resources/js/components/skeleton-loaders/*` | Acceptance: on simulated slow load, skeletons render quickly and minimize layout shift (CLS acceptable).
4. [P2] Rendering performance: memoize chart derived data (avoid unnecessary recalculation in `DashboardCharts`). | Files: `src/modules/dashboard/components/DashboardCharts.tsx` | Acceptance: React renders remain stable while navigating; charts do not recompute derived arrays unnecessarily.
5. [P2] Consistency polish: unify formatting and empty states across “Most popular” vs “Recent”. | Files: `src/modules/dashboard/components/DashboardPostsLists.tsx` | Acceptance: consistent number formatting and consistent empty-state presentation across both lists.

### Block 3: Public pages (home/blog/post/categories)
1. [P0] UX/A11y critical: remove nested interactive elements (`<a>` containing `<button>`). | Files: `resources/js/pages/public/home.tsx`, `resources/js/components/public-header.tsx`, `resources/js/pages/public/post.tsx`, `resources/js/pages/public/category.tsx`, `resources/js/pages/public/blog.tsx` | Acceptance: DOM inspection shows no `<a>` that contains a `<button>` in public routes; Lighthouse/axe flags are cleared.
2. [P0] Accessibility: add `aria-label`/proper labels for icon-only controls and filters. | Files: `resources/js/components/public-header.tsx`, `resources/js/pages/public/blog.tsx`, `resources/js/pages/public/category.tsx` | Acceptance: axe reports no unlabeled inputs/buttons; icon-only buttons and filter triggers (e.g. `SelectTrigger`) have an accessible name; search input has an explicit label or `aria-label`.
3. [P1] Filter micro-UX: add processing/loading feedback while applying filters. | Files: `resources/js/pages/public/blog.tsx`, `resources/js/pages/public/category.tsx` | Acceptance: “Apply Filters” is disabled and a loader appears immediately; results replace empty state only after request resolves.
4. [P1] Pagination accessibility polish: add meaningful accessible labels for Previous/Next and active page. | Files: `resources/js/pages/public/blog.tsx`, `resources/js/pages/public/category.tsx` | Acceptance: pagination controls have announced names (“Previous page”/“Next page” or localized equivalents).
5. [P2] Decorative polish: mark neon background ornaments as decorative (`aria-hidden` / presentational) and respect reduced motion. | Files: `resources/js/pages/public/home.tsx` | Acceptance: axe shows no landmark/structure noise from decorative elements; `prefers-reduced-motion` reduces animation.
6. [P2] Security polish: safeguard HTML rendering on public “Post” (contract + defense-in-depth). | Files: `resources/js/pages/public/post.tsx` (and verify backend sanitization contract) | Acceptance: stored XSS payloads (if any) are neutralized; front-end rendering stays safe even if the backend contract changes (either via client sanitization or via explicit tested guarantees).
7. [P1] Post page UX: related posts empty state uses consistent `EmptyState` with a clear CTA back to `/blog`. | Files: `resources/js/pages/public/post.tsx`, `resources/js/components/empty-state.tsx` | Acceptance: when `relatedPosts` is empty, the UI shows an `EmptyState` (not a blank section) with a meaningful action.

### Block 4: Auth + Settings (including 2FA)
1. [P0] 2FA setup reliability: avoid breaking submit with `preventDefault()` unless strictly required. | Files: `resources/js/components/two-factor-setup-modal.tsx` | Acceptance: confirming code triggers the request and closes modal on success.
2. [P0] 2FA setup error UX: avoid getting stuck in an error-only state; allow retry/continue with clear UX. | Files: `src/modules/settings/hooks/use-two-factor-setup-modal.ts`, `resources/js/components/two-factor-setup-modal.tsx` | Acceptance: on setup failure, user can proceed or retry without dead ends; QR/inputs aren’t permanently hidden.
3. [P1] 2FA challenge feedback: show consistent processing/spinner and accessible busy state. | Files: `resources/js/pages/auth/two-factor-challenge.tsx` | Acceptance: during submit, user sees spinner and AT can infer busy/processing status.
4. [P0] Field error accessibility across auth/settings: make errors announced and associate them to inputs. | Files: `resources/js/components/input-error.tsx`, `resources/js/pages/auth/*`, `resources/js/pages/settings/*` | Acceptance: on error, screen reader announces the error; inputs expose `aria-invalid` and reference error ids via `aria-describedby`.
5. [P2] Status message semantics: ensure “Saved” and other status messages use `role="status"`/`aria-live`. | Files: `resources/js/pages/settings/profile.tsx`, `resources/js/pages/settings/password.tsx`, and related settings pages | Acceptance: status messages are announced without stealing focus.

### Block 5: Navigation/Layout + Responsive
1. [P0] Global icon-only buttons: add `aria-label` for the header search button and mobile menu trigger. | Files: `resources/js/components/app-header.tsx` | Acceptance: axe shows no “button has no name” for icon-only controls.
2. [P1] Keyboard shortcuts conflict prevention: ignore global shortcuts when focus is inside `input`, `textarea`, or contenteditable elements. | Files: `src/shared/hooks/use-keyboard-shortcuts.tsx` (re-exported via `resources/js/hooks/use-keyboard-shortcuts.tsx`) | Acceptance: typing in inputs doesn’t trigger shortcuts; command palette/shortcuts still work when focus is not in fields.
3. [P1] Mobile overlay scroll/pointer restoration: improve cleanup behavior for mobile navigation/sheets. | Files: `src/shared/hooks/use-mobile-navigation.ts` and any sheet/drawer integration points | Acceptance: after closing a mobile overlay, scrolling and pointer events are fully restored; no lingering interaction lock.
4. [P2] Breadcrumb/landmark polish: verify semantics remain correct across routes. | Files: `resources/js/components/breadcrumbs.tsx` (and consumers) | Acceptance: breadcrumbs show correct `aria-current` and landmarks; axe has no breadcrumb-related warnings.

### Block 6: Admin UX & Authorization Tests
1. [P0] Admin gating in UI: hide admin-only entry points for non-admin users. | Files: `resources/js/components/app-sidebar.tsx`, `resources/js/components/nav-main.tsx`, `resources/js/components/command-palette.tsx`, `resources/js/components/floating-action-button.tsx` | Acceptance (DOM): when `auth.user.is_admin=false`, dashboard/categories links + related commands + admin create actions are not present in the rendered DOM.
2. [P0] Authorization tests (Posts): non-admin cannot update/delete other users' posts; admin can. | Files: `tests/Feature/PostControllerTest.php` (and/or `tests/Feature/PostIntegrationTest.php`) | Acceptance: `PUT /posts/{otherUserPost}` returns `403` for non-admin with DB unchanged; the same request returns the expected success behavior (redirect + DB changed) for admin.
3. [P0] Authorization tests (Categories): non-admin cannot access dashboard category management; admin can CRUD. | Files: `tests/Feature/CategoryControllerTest.php` | Acceptance: admin can create/update/delete and DB changes accordingly; non-admin attempts are redirected to `public.posts.index` and DB unchanged.
4. [P1] Align test naming with the actual scenarios and add “happy path” admin coverage for missing cases. | Files: `tests/Feature/CategoryControllerTest.php`, `tests/Feature/PostControllerTest.php` | Acceptance: test names reflect admin vs non-admin intent; coverage includes both success (admin) and forbidden/redirect (user) paths.
5. [P1] Align `CategoryPolicy` vs `CategoryController` behavior for deletion rules. | Files: `app/Policies/CategoryPolicy.php`, `app/Http/Controllers/CategoryController.php`, `tests/Feature/CategoryControllerTest.php` | Acceptance: the authorization rule is consistent between policy and controller (no “dead” policy branches), and tests cover the intended behavior for non-admin deletion (e.g. categories with/without posts, if that rule is kept).

