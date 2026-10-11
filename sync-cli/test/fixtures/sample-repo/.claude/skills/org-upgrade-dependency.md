# Skill: upgrade-dependency

Bump a dependency without turning a routine update into an incident.

## When to use

A dependency needs a version bump — security advisory, feature need, or routine upkeep.

## Steps

1. Check the stack pack's banned-library list before upgrading to or across a major version that changes behaviour covered there.
2. Read the changelog between current and target version for breaking changes, not just the target version's own notes.
3. Upgrade one dependency (or one tightly-coupled group, e.g. a framework and its official plugin) per PR — not a bulk bump, so a regression is traceable.
4. Run the stack's full command set (build, lint, type-check, test) after the bump, not just the test suite.
5. A dependency install always needs the approval this org guardrail requires — don't treat a "minor" bump as exempt.
6. Note in the PR description what changed upstream that's relevant, not just "bump to vX.Y.Z".
