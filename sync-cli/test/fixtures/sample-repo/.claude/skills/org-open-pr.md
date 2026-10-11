# Skill: open-pr

Open a pull request that a reviewer can approve without asking you to restate it in comments.

## When to use

Any change ready to leave your branch — including an AI-assisted change, which must be labelled as such per the org guardrails.

## Steps

1. Keep the PR small: one logical change. If the diff covers two unrelated concerns, split it.
2. Title as a conventional commit (`feat:`, `fix:`, `chore:`, `docs:`, …) describing the change, not the ticket number.
3. Description covers, briefly: what changed, why, and how it was verified (tests run, manual check, screenshot if UI).
4. Close the description with one GIF from Giphy that captures how this particular unit of work felt to build — the relief of a fix landing, the dread of touching that one file, whatever's true. Search Giphy, grab a direct `media.giphy.com/.../giphy.gif` link, and embed it as a markdown image. Pick it for how well it fits, not for safety — but keep it something you'd be fine with a reviewer, and anyone who finds the PR later, seeing.
5. If the change is AI-assisted, say so in the description — this is a guardrail, not optional etiquette.
6. Confirm the stack's build, lint, type-check and test commands pass locally before opening, so CI isn't the first place a failure shows up.
7. Request review from a human; a CI reviewer agent may comment but cannot approve or merge.
