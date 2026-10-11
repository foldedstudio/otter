# Skill: add-ui-component

Add a reusable UI component in the right place, per `conventions/folder-layout.md`.

## Steps

1. Check `components/` and the approved-libraries list first — don't build what already exists or what the preferred library already provides.
2. Default to a server component (`conventions/server-vs-client-components.md`); add `"use client"` only if the component itself needs interactivity or a browser API, not because its parent happens to be a client component.
3. One component per file, file name matches the export.
4. Type props explicitly; don't use `any` or an untyped spread of props through to the DOM.
5. If the component is route-specific, it belongs in that route's `_components/`, not the shared `components/` folder — only promote it once a second route needs it.
6. Run `lint` and `typecheck` before opening the PR.
