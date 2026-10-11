# Convention: router choice

Default: **App Router** (`app/`) for every new project and every new route in an existing one.

- Don't add new routes under `pages/` in a repo that already has `app/`, even if the existing route you're touching is still on Pages Router — migrate the route you're touching instead if it's small, or leave it and note why in the PR if migrating is out of scope.
- A repo fully on Pages Router stays there until a deliberate migration is planned — don't mix routers inside one route tree.
- This is a draft default, not yet confirmed by the working group. If your repo's `otter.yaml` local layer says otherwise, local wins.
