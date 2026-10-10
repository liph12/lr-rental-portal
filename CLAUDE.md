# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Leuteriorealty (LR) rental portal: an internal React dashboard for rental sales, rent managers, teams, and their remittances, plus a "pinning tracker" (bi-monthly progress per rent manager) and rental report submissions.

Stack: React 19 + TypeScript + Vite 7, MUI v7 (`@mui/material`, `@mui/x-data-grid-pro`), React Router v7, axios, `@react-oauth/google`.

## Commands

```bash
npm run dev       # Vite dev server
npm run build     # tsc -b (type check) && vite build
npm run lint      # eslint .
npm run preview   # serve the production build
```

There is no test framework set up. `npm run build` is the type check. tsconfig sets `noUnusedLocals`/`noUnusedParameters`, so unused imports or variables fail the build. It also sets `verbatimModuleSyntax`, so type-only imports must use `import type`.

## Environment

- `.env` needs `VITE_MUIX_PRO_LICENSE_KEY`. It is applied via `LicenseInfo.setLicenseKey` in `src/providers/AppProvider.tsx` and is required by the DataGridPro tables.
- API base URLs are hardcoded in each axios call; there is no API client or env-based base URL. There are two backends:
  - `https://api.leuteriorealty.com/lr/v2/public/api/...`: auth (`sign-in`, `authenticate`) and `rental-reports`.
  - `https://leuteriorealty.com/api/rental/...`: dashboard data (`rent-managers-sales`, `property-overview`, `property-condo-overview`, `sales-cutoff-dates`).

## Architecture

**Entry and routing:** `main.tsx` wraps everything in `BrowserRouter` and sends `/*` to `App`. `App` wraps `WebRoute` in `AppProvider`. `WebRoute.tsx` defines every route:
- Public: `/rental-report-form`, `/rentph-test`.
- Authenticated (rendered only when `user` is set): routes nested under `AppLayout` (navbar + sidebar + `<Outlet/>`), namely `/`, `/reports`, `/reports/:team_id`, `/reports/rental-submissions/:sub_id`, and `/pinning-tracker` (with a nested `:rm_id` route).
- When there is no user, only `/login` exists, and all other paths fall through to `ErrorPage`.

**Auth flow:** `Login` posts to `sign-in` (with email and password, or with the Google OAuth userinfo email and `google_auth: true`). It stores `{auth_token, email, id, name, role}` in `localStorage["user_data"]` (`storeUserData` in `helpers.ts`), then hard-reloads to `/`. On mount, `AppProvider` calls `authenticate` with that token and sets `user`. A `PageLoader` shows during the call. Admin status is a hardcoded email list (`ADMINS` in `AppProvider.tsx`). `isAdmin` picks between `appRoutes` and `staffAppRoutes` in `app-data.ts` for the sidebar.

**Global state (`AppProvider` / `useAppContext`):** a single React context holds the dashboard data: `rentManagers`, `teams`, `areaStatistics`, `properties`, `propertyUnits`, `cutOffDates`, `dateRange`, and `dateYear`. Pages read from this context; they don't fetch their own dashboard data. The default `dateRange` is the last 30 days, overridden by the `?from=&to=` URL params.

**Data loading lives in the sidebar:** `components/AppDataFilters.tsx`, which is rendered inside `AppSideBar`, does the main data fetching:
- It runs on mount and when "Search" is clicked with filters (`from`, `to`, `area`).
- It writes the filters into the URL query string and passes that same query string to the `rental/*` endpoints.
- It derives the following client-side and pushes the results into context:
  - `totalRemittance` per rent manager
  - `hasRemittanceLevel` (true when any month in the range has ≥ 5000 remittance; see `helpers.ts`)
  - area totals
  - team aggregates (`createTeamStatistics`)

  Sub-team aggregates use `createSubTeamStatistics` in `helpers.ts`.

The URL query string is the source of truth for filters, so preserve `loc.search` when navigating between dashboard pages.

**Other modules:**
- `app-data.ts`: static config. `LOCATIONS` (areas; some group several raw city spellings such as Cebu/Lapu-lapu variants) and the sidebar route lists.
- `helpers.ts`: date utilities, including `generateBiMonthlyClusters(year)` (JAN-FEB, MAR-APR, …), which the pinning tracker and the rental-reports `?cluster=` query use. It also holds the remittance and team aggregation helpers.
- `types.ts`: shared domain types (`RentManager`, `RentalSale`, `Team`, `User`, `DateRange`, `ClusteredRange`, …).
- `components/{cards,tables,charts,layouts}`: presentational components. The tables use DataGridPro.
- `utils/`: styled MUI wrappers (`StyledTextfield`, `StyledAutocomplete`, `StyledBarChart`, `LazyImage`).

**Styling:** MUI `sx` props throughout. There is no custom MUI theme (`ThemeProvider` is not used).

## Gotchas

- `pages/Test.tsx` and `pages/TestPage.tsx` are scratch pages. `Test.tsx` also exports a component named `RentalReportForm` and calls `api.anthropic.com` directly, so don't confuse it with `pages/RentalReportForm.tsx`.
- `RentalReportForm.tsx` currently calls `axios.post('')` with an empty URL, so its submit endpoint is not wired up yet.
- Error handling is mostly empty `catch` blocks marked `// to do`.
