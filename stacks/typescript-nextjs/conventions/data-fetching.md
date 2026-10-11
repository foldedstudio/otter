# Convention: data fetching

- Fetch in server components wherever possible; it's the default per `server-vs-client-components.md`.
- Use Next's built-in `fetch` caching semantics (`cache`, `next.revalidate`) rather than hand-rolling a cache layer, unless the stack's approved-libraries list says otherwise.
- Mutations go through server actions, not client-side calls to an API route you also control — only reach for an API route when the consumer is external (a webhook, a third party, a mobile client).
- Co-locate a server action with the form or component that calls it unless more than one route shares it, in which case it moves to `lib/`.
- Never fetch secrets or call a privileged API from a client component — that's an org guardrail, not just a convention.
