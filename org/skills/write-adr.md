# Skill: write-adr

Record an architecture decision so the reasoning survives after the decision feels obvious.

## When to use

A choice was made between two or more real alternatives and someone later will ask "why not X" — a library, a data model, a service boundary, a build tool.

## Steps

1. Find the repo's ADR location (commonly `docs/adr/` or `docs/decisions/`); if none exists, create it and say so in the PR description.
2. Number the file sequentially: `NNNN-short-title.md`.
3. Write four sections, each a few sentences, not a few paragraphs:
   - **Context** — the problem and constraints, as of now.
   - **Decision** — what was chosen, stated plainly.
   - **Alternatives considered** — what else was on the table and why it lost.
   - **Consequences** — what this makes easier, harder, or locked in.
4. Link the ADR from the PR that implements the decision.
5. Don't backfill ADRs for decisions nobody is asking about — this skill is for decisions worth defending later, not a changelog.
