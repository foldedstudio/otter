# Skill: add-api-route-or-server-action

Add a mutation or external-facing endpoint, choosing the right mechanism per `conventions/data-fetching.md`.

## Steps

1. Decide first: is the caller a page/component in this app (→ server action) or an external consumer — webhook, third party, mobile client (→ API route under `app/api/.../route.ts`)? Default to a server action unless you have a specific reason not to.
2. For a server action: colocate it with the form/component that calls it; mark the file or function `"use server"`; validate input before touching any data store.
3. For an API route: define the HTTP methods you actually need (`GET`, `POST`, …); validate and authenticate the request explicitly — an API route has no implicit trust the way an internal server action does.
4. Never read a secret or call a privileged internal service from a client component to reach either of these — the request must originate server-side.
5. Add a test covering the success path and at least one validation-failure path.
6. Run `lint`, `typecheck`, and `test` before opening the PR.
