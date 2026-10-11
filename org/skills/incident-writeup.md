# Skill: incident-writeup

Document an agent-caused incident so it becomes a guardrail or eval task, not a story someone has to remember.

## When to use

An agent did something it shouldn't have: a guardrail was bypassed, a destructive action ran, a secret leaked, or a change reached `main` that caused a production issue.

## Steps

1. Write up while it's fresh: what the agent was asked to do, what it actually did, and the gap between them.
2. State the blast radius plainly — what was affected, for how long, and whether it reached production.
3. Identify whether this was a missing guardrail (should have been blocked and wasn't) or a guidance gap (was allowed but shouldn't have been the default).
4. Propose the fix as a concrete change: a new guardrail in `org/` or the relevant stack pack, or a new eval task that would have caught it.
5. Open the guardrail/eval-task change as its own PR, linked from the write-up — the write-up documents, the PR fixes.
6. Bring it to the next fortnightly review if it's not already resolved by then.
