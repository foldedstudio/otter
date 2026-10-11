# Convention: server vs client components

Default to a **server component**. Add `"use client"` only when the component actually needs one of:

- Interactivity: event handlers, `useState`, `useEffect`, refs.
- A browser-only API (`window`, `localStorage`, media APIs).
- A third-party library that itself requires the client.

When a component needs a client boundary, push `"use client"` as far down the tree as possible — wrap the one interactive piece, not the page around it, so data fetching and layout stay server-rendered.

Don't fetch data in a client component just because the component is already a client component — pass data down as props from a server-component parent instead.
