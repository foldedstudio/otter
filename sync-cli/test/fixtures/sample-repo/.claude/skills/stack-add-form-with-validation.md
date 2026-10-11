# Skill: add-form-with-validation

Add a form that validates on both the client (for responsiveness) and the server (for correctness).

## Steps

1. Define the schema once (e.g. a Zod schema in `lib/`) and import it on both sides — don't hand-write the same rules twice.
2. Client side: show inline field errors as the user types or on blur, not only on submit.
3. Server side: re-validate against the same schema inside the server action or API route before touching any data store — client validation is a UX nicety, not a guardrail.
4. Return field-level errors from the server action so the client can show them even if JS failed to load (progressive enhancement) rather than relying solely on client state.
5. Never trust a value that passed client validation alone when it reaches server code.
6. Add a test for at least one invalid-input case that must be rejected server-side even if the client would have allowed it (e.g. with JS disabled or a crafted request).
