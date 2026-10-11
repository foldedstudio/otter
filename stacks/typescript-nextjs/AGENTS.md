# Stack: typescript-nextjs

Guidance for TypeScript + Next.js, on top of the organisation layer. Full detail lives one level down — this file is what gets merged into a product repo's `AGENTS.md`; don't duplicate the detail here.

## Tooling

**mise** pins the Node version; **pnpm** is the only package manager — never `npm` or `yarn`. See `conventions/package-manager.md`; this is enforced, not just advised.

## Commands

Install `pnpm install --frozen-lockfile`, build `pnpm run build`, lint `pnpm run lint`, typecheck `pnpm run typecheck`, test `pnpm test`. Verify your own work with these before opening a PR — they're what CI runs.

## Conventions

See `conventions/`: package manager and tooling, router choice, server vs client components, folder layout, data fetching, error handling and logging. Each is short by design; read the one relevant to what you're touching.

## Skills

See `skills/`: `add-page-or-route`, `add-api-route-or-server-action`, `add-form-with-validation`, `add-ui-component`.

## Libraries

Banned (and `otter-sync check` fails on them): `moment` — use `date-fns` or native `Intl`; `lodash` — modern JS covers most of it. No preferred list is agreed yet, so adding any new dependency still needs approval; see `libraries` in `stack.yaml`.

## Stack guardrails

Protected paths: `generated/`, `.env*` — never edit these even when asked, they're generated or secret-bearing.
