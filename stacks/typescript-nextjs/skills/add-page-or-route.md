# Skill: add-page-or-route

Add a new route following `conventions/router-choice.md` and `folder-layout.md`.

## Steps

1. Create the segment folder under `app/`, e.g. `app/settings/billing/`.
2. Add `page.tsx` as a server component by default (`conventions/server-vs-client-components.md`).
3. Colocate route-only components in `_components/` inside the segment; only promote to the root `components/` if a second route needs the same component.
4. Add `loading.tsx` if the page fetches data that can meaningfully show a loading state; add `error.tsx` if the route calls anything that can fail in a way the user should see.
5. Fetch data directly in the server component per `conventions/data-fetching.md` — don't add a client-side fetch for data the server already has.
6. Run the stack's `typecheck` and `lint` commands before opening the PR.
