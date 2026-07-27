# Code Rules

Project-wide conventions, architecture, and code-review rules for this repo. This is
the single source of truth — `CLAUDE.md` just imports this file rather than
duplicating it, so update rules here only.

## Commands

```bash
npm run dev          # start dev server (Next.js with --turbo) at localhost:3000
npm run build         # production build
npm run start         # run production build
npm run lint          # eslint (next/core-web-vitals + next/typescript)
npm run test          # run all vitest tests
npx vitest run path/to/file.test.ts   # run a single test file
npx vitest path/to/file.test.ts -t "test name"   # run a single test by name
npx tsc --noEmit      # typecheck (also runs automatically via lint-staged on commit)
```

Husky + lint-staged run `tsc --noEmit`, `eslint`, and `prettier` on staged `.ts/.tsx/.js/.jsx` files via the pre-commit hook; commit messages are linted with commitlint (conventional commits) via commit-msg.

## Architecture

This is a Next.js 15 App Router project (React 19) serving multiple portals from one codebase: **admin**, **employee**, **sub-contractor** (and sub-contractor-admin/crew-leader), gated by role via middleware and route groups.

### Routing vs. feature code split

- `src/app/**` contains only route segments (route groups `(auth)`, `(public)`, `(user-account)/(admin|employee|sub-contractor|sub-contractor-admin)`) and thin `page.tsx`/`layout.tsx` files. A page does little more than import a template and render it, often wrapped in `<Suspense>`:
  ```tsx
  export default function TechnicalIssues() {
  	return (
  		<Suspense fallback={<div>Loading...</div>}>
  			<AdminTechnicalIssuesPage />
  		</Suspense>
  	);
  }
  ```
- All real feature logic lives in `src/module/<feature>/`, organized per-feature with a subset of: `components/`, `templates/` (the top-level screen rendered by the page), `hooks/` (react-query hooks), `types/`, `utils/`, `constants/`, `enums/`, `helpers/`, `context/`. Look at an existing module (e.g. `src/module/admin-technical-issues/`) as the template for a new one rather than inventing a new layout.
- `src/config/routes.ts` is the single source of truth for route paths/builders (e.g. `routes.admin.employeesDetails(id)`); use it instead of hardcoding path strings.

### Auth & role gating

- `src/middleware.ts` reads `COOKIES.AUTH_TOKEN` / `COOKIES.USER_TYPE` and redirects based on `ROLES` (`ADMIN`, `TECHNICIAN_EMPLOYEE`, `SUB_CONTRACTOR`, `SUB_CONTRACTOR_CREW_LEADER`) — update its `matcher` and the role switch together when adding a new protected top-level segment.
- Client-side current user/role comes from the zustand store `useAuthStore` (`src/store/auth-store.ts`), not from re-fetching — read `user.userType` against `ROLES` from `@/types` for role-based UI branching.

### Data fetching

- All HTTP goes through the shared `apiClient` (axios) in `src/lib/api.ts`. It auto-attaches the auth bearer token, `accept-language`, `x-timezone`, and (non-dev) `x-emulated-role-id` from cookies, and force-redirects to `/signin` on a 401 "invalid token" response. Don't create a second axios instance — extend this one.
- Server calls are wrapped in React Query hooks colocated in each module's `hooks/` folder (e.g. `useAdminTechnicalIssues`), not called directly from components. Query keys are arrays starting with a feature-scoped string; mutations use `useMutation` with a `mutationKey`. Responses are typed as `IApiSuccessResponse<T>` from `@/types`, and hooks return `data.data`.
- Env vars are validated through `@t3-oss/env-nextjs` in `src/env.mjs` — add new `NEXT_PUBLIC_*` vars to both `client` and `runtimeEnv` there (and `.env.example`). Always read them via `import { env } from "@/env.mjs"` (e.g. `env.NEXT_PUBLIC_API_URL`) — never access `process.env.*` directly in app code; there are zero raw `process.env` reads under `src/`. For branching on the current deploy target, use the existing `isProductionEnv()` / `isStagingEnv()` / `isDevelopmentEnv()` helpers (`src/utils/index.ts`, compare `env.NEXT_PUBLIC_ENV` against the `ENV` enum) instead of comparing `env.NEXT_PUBLIC_ENV` inline.

### State

- Global/shared client state uses zustand (`src/store/*`), e.g. `useAuthStore`. Local component state still uses `useState`/`useReducer` as normal.
- List/filter state (date range, status, sort, pagination, selected id, etc.) is **not** kept in `useState` — it's read from and written to the URL via a per-module search-params hook, e.g. `useTravelPayParams` (`src/module/schedule-management/travel-pay/hooks/useTravelPayParams.ts`). The pattern: a `getParams()` that reads `useSearchParams()` with typed fallbacks/enum validation, and a `setParams(partial, persistPreviousParams = true)` that merges into the existing query string via `router.replace(..., { scroll: false })`. Add a new hook of this shape per module instead of local filter state — it makes filters shareable/bookmarkable and survives refresh.

### Forms

Forms are built from a **field-config-driven system**, not hand-rolled per-field JSX. The old pattern of writing a `FormField`/`FormControl`/`FormLabel`/`FormMessage` block for every single input (still visible in older files like `edit-job-modal.tsx`) is legacy — don't copy it for new standard fields. New forms should describe their fields as data and let the shared renderer do the work.

- **Schema + fields, colocated in the module's `utils/`** — same rule as before, extended:
  - The zod schema and inferred type live in `utils/<name>-schema.ts` (e.g. `formExampleSchema` / `IFormExampleSchema`), exactly as before.
  - The field **layout** lives alongside it in `utils/<name>-fields.ts` as a `FormFieldConfig<ISchema>[]` array (e.g. `formExampleFields` in `src/module/form-example/utils/form-example-fields.ts`). Each entry is one field's full config: `name`, `fieldVariant`, `label`, `placeholder`, `options`, etc. Static option lists (`departmentOptions`, `countryOptions`, ...) live in that same file.
  - The template wires it up with `useForm` + `zodResolver` and a single `.map()`:
    ```tsx
    {
    	formExampleFields.map((fieldConfig) => (
    		<FormInputWrapper key={fieldConfig.name} form={form} fieldConfig={fieldConfig} />
    	));
    }
    ```
- **`FormInputWrapper`** (`src/components/common/form/form-input-wrapper.tsx`) is the only entry point for rendering a config-driven field — it owns the `FormField`/`FormItem`/`FormLabel`/`FormControl`/`FormMessage` scaffolding, label styling, and `labelPosition` layout. Don't reassemble those primitives by hand for a field that already has a `FIELD_VARIANT`.
- **`fieldVariant` is the `FIELD_VARIANT` enum** (`@/components/common/form/types`), never a raw string — `FIELD_VARIANT.INPUT`, `.TEXTAREA`, `.SELECT`, `.MULTI_SELECT`, `.SEARCHABLE_SELECT`, `.RADIO_GROUP`, `.CURRENCY_INPUT`, `.DATE`, `.TOGGLE`, `.IMAGE`, `.MULTI_IMAGE`. `RenderFormInput` (`render-form-input.tsx`) dispatches on this enum in a `switch` — new call sites must import and compare against the enum member, not `"select"` / `"toggle"` / etc.
- **`labelPosition`** (`LABEL_POSITION.TOP` default / `LEFT` / `RIGHT`, also in `@/components/common/form/types`) controls where the label sits relative to the control. Omit it for the normal label-above-input layout; set `labelPosition: LABEL_POSITION.LEFT` on a field config for label-beside-control layouts (e.g. a toggle row) instead of building a custom label+control wrapper in the field's own component.
- **Adding a new field variant**: add the member to `FIELD_VARIANT`, add a `XFieldConfig extends BaseFieldConfig` interface and a `FormXProps` type in `types/index.ts`, build the renderer component in `src/components/common/form/`, and add its `case FIELD_VARIANT.X:` in `RenderFormInput`. A variant should style itself to match the app's existing input look (`rounded-[10px] border-none bg-brand-bgLightgrey`, per `InputField`/`SelectField`) — reuse an existing styled primitive (`@/components/ui/date-picker`, `@/components/shared/image-upload`, `@/components/ui/switch`, ...) instead of hand-rolling a new Popover/Calendar/etc. from scratch.
- **Escape hatch**: only fall back to a hand-written `FormField`/`Controller` block when a field is genuinely one-off and not a good candidate for a reusable variant. If it's likely to recur in another form, add it as a proper `FIELD_VARIANT` instead of copy-pasting the one-off block a second time.

### Types

- Entity types are declared **once** and reused everywhere by importing — never redeclare a near-duplicate type for the same shape. e.g. `IUser` lives in `src/module/schedule-management/weekly-schedule-management/types/schedule-interface.ts` and other modules import it from there (`import { IUser } from "../../weekly-schedule-management/types/schedule-interface"`) rather than declaring their own user shape.
- When a variant of an existing type is needed, derive it with `Pick`/`Omit`/intersection (`&`) instead of writing a new interface from scratch: `Pick<IEmployee & { user: IUser }, "id" | "user">`, `user: IUser & { ... }`, `Omit<ISpecialJob, "id"> & { id?: string }`.
- API responses are typed with the shared generics from `@/types`, not bespoke per-endpoint wrappers: `IApiResponse<T>` (`{ data, message, success }`) for single responses (e.g. `IGetWeekendWorksResponse = IApiResponse<IWeekendWork[]>`), and `IPaginatedApiResponse<T>` (`{ items, page, pageSize, total }`) for paginated lists. (`IApiSuccessResponse<T>` — `{ success, data }` — also exists and is used by some older hooks; match whichever your endpoint family already uses rather than adding a third shape.)
- **An entity type never embeds a nested relation object inline.** A table/entity type (`IMapZone`, `IEmployee`, ...) only declares that table's own columns. A relation that only comes back on specific endpoints (a joined/included record) is modeled as a separate composed type — `IGet<Entity> = <Entity> & { relation?: Pick<IRelation, "id" | "name"> & { ... } }` — not as a field baked into the base entity, and not as a redeclared inline object literal (`mapZoneType: { id: string; name: string; ... }`). See `IMapZone` / `IGetMapZone` in `src/module/project-management/mapv2/types/zone.ts` as the reference: `IMapZone` is the bare row, `IGetMapZone` composes it with `mapZoneType` for the endpoints that actually return the join. Consumers that need the relation import the `IGet*` type, not the base entity.
  - Nested relation fields on the composed type are **optional** (`mapZoneType?: ...`, and any relation nested inside it, e.g. `mapZoneTab?: ...`) unless the backend guarantees the join is always populated — the BE can legitimately omit a relation it failed to resolve, so treat it as absent-capable by default and access it with optional chaining (`zone.mapZoneType?.id`) rather than assuming presence.
- Avoid `any`. If a shape is genuinely unknown, use `unknown` and narrow it rather than typing around the problem.

### Enums

- Never compare against a raw string literal for a closed set of values (role, status, type, mode, etc.) — e.g. don't write `user.userType === "ADMIN"`. Use the matching enum instead: `user?.userType === ROLES.ADMIN` (see any of the 80+ call sites in `src/module/admin/**`, `src/module/schedule-management/**`). This applies to role checks, status checks, and any other fixed-vocabulary field.
- App-wide enums are split across `@/types` (e.g. `ROLES`, `SORT_ORDER`) and `@/utils/enums` (e.g. `ENV`, `MODULE`, `TECHNICAL_ISSUE_STATUS`) — check both before adding a new one. Feature-scoped enums live in the owning module's own `enums/` or `types/` folder (e.g. `MIDDAY_STOP_TYPE` in `src/module/midday-stops/utils/enums.ts`, `FIELD_VARIANT`/`LABEL_POSITION` in `src/components/common/form/types/index.ts`). Reuse an existing enum if one already models the same vocabulary instead of adding a parallel one.
- This includes object-literal "enums" typed with `as const` (e.g. `E_SCHEDULE_CONFIG_WEEKEND_DAY`) when a real TS `enum` doesn't fit (e.g. the values must equal another enum's values) — the rule is "named constant, not string literal," not "must be the `enum` keyword."
- **Don't stop at the obvious cases.** "Closed set of values" is broader than role/status/type fields with an explicit `enum`-shaped meaning — it also covers plain string literals that get **reused across multiple call sites**, even if no enum for them exists yet. Two concrete patterns to watch for, since generated code tends to miss both:
  - **Repeated literal values with no enum backing them yet.** If the same string shows up 2+ times (an HTML `input` `type` — `"email"`, `"password"`, `"number"` — a query param name, a CSS breakpoint key, a websocket event name, ...), don't keep typing the literal at each call site. Introduce a small enum/const (e.g. `INPUT_TYPE.EMAIL`) once it's used more than once, and use that everywhere, including the first two existing call sites.
  - **Ad hoc equality checks against a value that already has an enum**, even when the check doesn't look like a "status" check at first glance — e.g. `if (value === "user")`, `mode == "edit"`, `kind === "draft"`. Before writing a string comparison, search `@/types`, `@/utils/enums`, and the module's own `enums/`/`types/` for an existing enum that already models that vocabulary; only write a raw comparison if you've confirmed none exists and the value is truly a one-off.

### Interaction primitives

- **Modal**: use the `useModal()` hook (`src/hooks/useModal.tsx`) inside the component that owns the trigger — destructure `{ Modal, openModal, closeModal }`, call `openModal({ modalTitle, modalView, footer, variant, ... })` on the trigger event, and render `<Modal />` once in JSX. This is the standard pattern (100+ usages). The zustand `useModalStore` + `<Modal modalId="..." />` from `src/components/shared/modal` is an older keyed-by-id mechanism still used in a few places (e.g. onboarding) — don't reach for it in new code unless something outside the local component tree needs to trigger the same modal.
- **Never use `window.confirm` / `window.alert`** — they block the main thread, can't be styled, and are disabled by some browsers. For a yes/no confirmation (delete, destructive action, etc.), use `useModal()` with `@/components/confirm-modal` (`ConfirmModal` — `description`, `confirmText`, `cancelText`, `onConfirm`, `onCancel`). For a one-button acknowledgement, use `@/components/success-modal` (`SuccessModal`) the same way. If a component already owns a `useModal()` instance for something else (e.g. a create/edit form), open a second instance for the confirm dialog rather than reusing the first — see `tab-manager.tsx` / `project-map-page.tsx` in `mapv2` for the pattern. A destructive action that previously ran synchronously inside a `window.confirm` block (e.g. an `async` delete handler) must be split into a trigger that opens the confirm modal and a separate function that runs the actual action from `onConfirm`, since the modal confirmation is asynchronous.
- **Popover**: use the `usePopover()` hook (`src/hooks/usePopover.tsx`) the same way — `{ Popover, openPopover, closePopover }`, `openPopover({ popoverView, side, align })`, render `<Popover />` once.
- **Tooltip**: use `<AppTooltip />` from `@/components/ui/tooltip` (`trigger` or `label`, plus `text`) instead of composing the raw Radix `Tooltip`/`TooltipTrigger`/`TooltipContent` primitives directly.
- **Toast**: use `openErrorToast({ error, message })` / `openSuccessToast(message)` from `@/components/toast` for all success/error feedback — `openErrorToast` already knows how to extract the message from an `AxiosError`, so pass the caught error straight through rather than pre-formatting it.

### UI components

- `src/components/ui/*` are shadcn/ui primitives (`components.json`: style "new-york", baseColor "zinc", icon library lucide) — generate/extend via shadcn conventions, don't hand-roll equivalents.
- `src/components/shared/*` holds cross-module composites (datatable, modal, sidebar, image-upload, section-header/wrapper, notification). `src/components/common/*` holds smaller shared widgets (e.g. quill-editor, back-button, the `form/` field-config system). Tables are built via `src/components/shared/datatable` (TanStack Table) — see `src/module/schedule-management/travel-pay/templates/` for a full usage example — with column defs as a `use<X>Columns()` hook living in the feature module's `utils/`.
- There's no shared component yet for a table with an expandable last column. Follow the pattern in `src/module/schedule-management/schedule-configuration/components/weekend-history-collapsible-table.tsx`: a plain `<table>` using the `ui/table` parts, split into `*-collapsible-table.tsx` (renders rows, owns `expandedRows` state), `*-primary-row.tsx` (the always-visible row + expand toggle), and `*-expanded-section.tsx` (the row revealed below it, `colSpan` across all columns). Mirror this split rather than inlining an expandable row into one file.
- Use the `cn()` helper from `@/lib/utils/utils` (clsx + tailwind-merge) for conditional class composition.

### Global utils

- `src/lib/utils/` holds cross-module pure-function utilities grouped by concern — `date.ts` (formatting/comparison/timezone, e.g. `toLocalFormattedDate`, `isSameDate`, `getDifferenceInHours`, `changeTimeZone`), `utils.ts` (`cn`), `value-formatter.ts`, `is-client.ts`, `check-active-user.tsx`, `schedule.ts`. `src/utils/` holds app-wide `constants.ts`/`enums.ts`/`gps.ts`. Add a new generic helper to the matching file here (or a new file in `src/lib/utils/` for a new concern) instead of redefining a local one-off inside a module — search these first before writing e.g. another date formatter.

### Path aliases

`@/*` → `src/*`, `@public/*` → `public/*`, `@common/*` → `src/components/common/*`, `@account/*` → `src/module/profile/templates/*` (defined in both `tsconfig.json` and `vitest.config.ts` — keep them in sync if changed).

### Testing

Vitest with `environment: "node"` (not jsdom) — existing tests cover pure utility/date logic (see `src/module/schedule-management/weekly-schedule-management/utils/date.test.ts`), not component rendering. Co-locate `*.test.ts` next to the util it tests.

## Conventions

- Tabs for indentation, double quotes, semicolons, 120 print width, trailing commas (es5) — enforced by Prettier (`prettier-plugin-tailwindcss` sorts Tailwind classes); don't hand-format against it.
- Mark client components with `"use client"` only where needed (forms, hooks with state/effects, anything using browser APIs) — templates/pages default to server components unless they need interactivity.
- Keep files small and single-purpose: no component or file should carry a large amount of unrelated logic. When a component grows (a table row gets an expandable section, a form gets a sub-block), split it into sibling components rather than nesting more JSX into one file — see `src/module/schedule-management/schedule-configuration/` (`weekend-history-collapsible-table.tsx` / `weekend-history-primary-row.tsx` / `weekend-history-expanded-section.tsx` / `weekend-history-user-row.tsx`) as the reference. Types and utils for a module always live in that module's own `types/`/`utils/`, never inlined in the component file.
- **Don't over-engineer.** Build for the requirement in front of you, not the hypothetical one. Concretely:
  - No speculative abstractions, config flags, or generic "just in case" props for a use case that doesn't exist yet — add them when a second real caller actually needs them, not before.
  - Three similar lines of code are better than a premature shared helper/abstraction extracted after only one use.
  - Don't add error handling, fallbacks, or validation for states that can't occur given the surrounding code/types — only guard real boundaries (user input, external API responses).
  - A bug fix or a single new field doesn't justify refactoring the surrounding file "while we're in here." Keep the diff scoped to what was asked.
  - If a feature could be built two ways and one is simpler and meets today's requirement, ship the simpler one — don't build the more flexible version on the assumption it'll be needed later.
- **Comment only when the code can't explain itself.** Default to no comments — a well-named function/variable should make the _what_ obvious. Add a comment only to capture the _why_ when it's genuinely non-obvious: a hidden constraint, a workaround for a specific bug/API quirk, a subtle invariant, or a business rule that isn't visible from the code around it. Keep it to one line where possible; no multi-paragraph doc-comment blocks, and no comments that restate what the next line already says (`// increment counter` above `count++`).

## AI-generated code checklist

When reviewing (or generating) a diff in this repo, specifically check for:

1. Every closed-set string comparison or a literal reused 2+ times is backed by an enum/const, not typed inline at each site (see **Enums** above — this is the rule generated code most often misses, since it tends to write a "new" literal locally instead of searching for the existing vocabulary or noticing the second occurrence).
2. No new form field was hand-rolled with raw `FormField`/`FormControl` when an existing `FIELD_VARIANT` already covers it.
3. No abstraction, flag, or "flexibility" was added beyond what the current task actually requires.
4. Comments explain _why_, not _what_ — and most lines have none.
5. No entity type has a relation object redeclared/inlined on it — relations live on a separate `IGet<Entity>`-style composed type (`Entity & { relation?: Pick<...> }`), with nested relation fields marked optional (see **Types** above).
6. `npx tsc --noEmit`, `npm run lint`, and `npx prettier --check` are clean before calling the change done.
