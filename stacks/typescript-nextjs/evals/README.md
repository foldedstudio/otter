# typescript-nextjs evals

10–15 representative tasks with known-good outcomes, run headless through Claude Code on every change to this stack pack, per `otter.harness.yaml` (`stacks.typescript-nextjs.evals`). A release ships only if eval success doesn't drop versus the current harness version.

## Format

Each task is a YAML file in `tasks/`:

```yaml
id: kebab-case-id             # unique, matches the filename without .yaml
skill: add-page-or-route      # the stack skill this task exercises, if any
description: One sentence a human reviewer can judge the result against.
prompt: |
  The exact instruction given to the agent, as a user would phrase it.
checks:
  - type: file-exists
    path: app/example/page.tsx
  - type: file-contains
    path: app/example/page.tsx
    pattern: 'export default'
  - type: file-not-contains
    path: app/example/page.tsx
    pattern: '"use client"'
  - type: command             # only run if the fixture's deps are installed
    run: npm run lint
```

Check types: `file-exists`, `file-not-exists`, `file-contains`, `file-not-contains` (pattern is a JS regex, tested per-file), `command` (must exit 0).

## Fixture

`fixtures/base-app/` is a minimal Next.js App Router project — just enough surface (one existing route, one existing lib util, configs) for tasks to act on realistically. Every task runs against a fresh copy of it; tasks never share state.

## Running

```
node run.mjs                  # all tasks, against the current harness version
node run.mjs add-ui-component # a single task, by id
```

The runner copies the fixture to a temp directory per task, runs `claude -p` with the task's prompt and `--permission-mode acceptEdits`, then evaluates `checks` against the result. It installs dependencies (`npm ci`) in the temp copy once, lazily, only if a task's checks include a `command` check — static tasks skip that cost.

Exit code is non-zero if any task fails, so this can run as a CI gate: `otter_release.evals-compare-current-vs-candidate` in `otter.harness.yaml` runs this against both the current and candidate harness versions and blocks release if success drops.

## Adding a task

Keep each task small enough that a human can judge "known-good" at a glance. Prefer structural checks (file exists, contains/doesn't contain a pattern) over running the full command set — reserve `command` checks for tasks specifically about build/lint/type correctness, since they're the slow path.
