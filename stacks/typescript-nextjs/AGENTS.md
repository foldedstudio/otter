# Stack: typescript-nextjs

Guidance for TypeScript + Next.js, on top of the organisation layer. Full detail lives one level down — this file is what gets merged into a product repo's `AGENTS.md`; don't duplicate the detail here.

## Commands

Install `npm ci`, build `npm run build`, lint `npm run lint`, typecheck `npx tsc --noEmit`, test `npm test`. Verify your own work with these before opening a PR — they're what CI runs.

## Conventions

See `conventions/`: router choice, server vs client components, folder layout, data fetching, error handling and logging. Each is short by design; read the one relevant to what you're touching.

## Skills

See `skills/`: `add-page-or-route`, `add-api-route-or-server-action`, `add-form-with-validation`, `add-ui-component`.

## Libraries

Preferred and banned libraries are still `TODO` in `stack.yaml` — don't assume a package is approved just because it's common; check there first.

## Stack guardrails

Protected paths: `generated/`, `.env*` — never edit these even when asked, they're generated or secret-bearing.
