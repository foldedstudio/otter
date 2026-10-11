# Convention: folder layout

- Route segments live under `app/`; colocate a route's own components, in a `_components/` folder next to the route, with the leading underscore so Next.js doesn't treat it as a route.
- Shared, cross-route UI lives in `components/` at the project root.
- Shared non-UI logic (data access, validation schemas, utilities) lives in `lib/`.
- One component per file; file name matches the exported component name.
- Don't create a new top-level folder (`utils/`, `helpers/`, `services/`) alongside `lib/` — extend `lib/` instead, so logic doesn't end up split across near-duplicate folders.
