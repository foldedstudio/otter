# Convention: package manager and tooling

This stack requires **mise** to pin the Node version and **pnpm** as the package manager. Not a preference — see `stack.yaml`'s `tooling` block and the `non-pnpm-package-manager` guardrail.

- The repo has a `.mise.toml` pinning `node` (and `pnpm`, if not installed via Corepack); run `mise install` once per machine.
- `package.json` has a `"packageManager": "pnpm@<version>"` field.
- `pnpm-lock.yaml` is committed. `package-lock.json` and `yarn.lock` must not exist — if you see one, someone ran `npm install`/`yarn` by mistake; delete it and reinstall with `pnpm install`.
- Use `pnpm run <script>` / `pnpm exec <bin>`, never `npm run`, `npx`, or `yarn`.

## How this is enforced, not just advised

- `otter-sync check` fails a repo on this stack if `pnpm-lock.yaml`, `.mise.toml`, or the `packageManager` field is missing, or if a `package-lock.json`/`yarn.lock` is present — see `sync-cli/src/check.js`.
- The generated `.claude/settings.json` denies `Bash(npm *)`, `Bash(npx *)`, and `Bash(yarn *)`, so an agent can't silently fall back to a different package manager mid-session.
