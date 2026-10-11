# Convention: error handling and logging

- Expected failure states (validation errors, not-found, permission denied) are handled explicitly and shown to the user — they are not thrown exceptions caught by a boundary.
- Unexpected failures use Next's `error.tsx` boundary per route segment; don't swallow an error in a `try/catch` just to avoid the boundary showing.
- Log server-side errors with enough context to reproduce (route, input shape, user/session id if available) and never log secrets, tokens, or full request bodies that may contain customer data.
- Don't `console.log` as the only logging mechanism in a server component or route handler — use whatever the repo's local layer names as its logger; if none is named, flag it rather than guessing.
