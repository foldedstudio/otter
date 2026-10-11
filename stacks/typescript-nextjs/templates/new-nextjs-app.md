# Template: new-nextjs-app

Not a scaffold we maintain — Next.js already ships one. Use the official generator, then layer this stack's requirements on top.

Next.js is its own build tool (Turbopack/webpack), not Vite, so there's no Vite template in play here; `create-next-app` is the Next.js equivalent of what `create-vite` is for a Vite project — the framework's own official scaffold, kept current by its maintainers. Re-implementing that in this repo would mean maintaining a second copy that drifts from upstream.

## Steps

1. Run `pnpm create next-app@latest` and answer its prompts — or pass flags; run `pnpm create next-app@latest --help` first since the current flag set can change between Next.js versions. Pick App Router (not Pages Router) per `../conventions/router-choice.md`, and TypeScript.
2. If the generator didn't already set one (recent versions detect pnpm and do), add a `"packageManager": "pnpm@<version>"` field to `package.json`.
3. Add a `.mise.toml` pinning `node` (and `pnpm`, if not using Corepack) — see `../conventions/package-manager.md`.
4. Run `otter-sync check` (or `sync`, for a fresh repo) to confirm the result is otter-compliant before the first commit.

## Libraries

Don't add the libraries `stack.yaml` bans (`moment`, `lodash`), and don't bake in a choice the stack hasn't agreed on yet (e.g. a CSS framework, a data-fetching library) — the preferred list and reference code are still unset.
