function union(...lists) {
  const seen = new Set();
  const out = [];
  for (const list of lists) {
    for (const item of list ?? []) {
      if (!seen.has(item)) {
        seen.add(item);
        out.push(item);
      }
    }
  }
  return out;
}

const LABELS = { org: "Organisation", stack: "Stack", repo: "Repo" };

// Guardrails: deny/require_approval/protected_paths are additive across layers
// (a restriction anywhere applies everywhere — "strictest wins" as a union).
// tools_allowlist/mcp_servers_allowlist are set once, by the org layer only.
export function mergeGuardrails(org, stack, repo) {
  return {
    deny: union(org.guardrails.deny, stack.guardrails.deny),
    require_approval: union(org.guardrails.require_approval, stack.guardrails.require_approval),
    protected_paths: union(
      org.guardrails.protected_paths,
      stack.guardrails.protected_paths,
      repo.guardrails.protected_paths,
    ),
    tools_allowlist: org.guardrails.tools_allowlist,
    mcp_servers_allowlist: org.guardrails.mcp_servers_allowlist,
  };
}

// Skills are merged-namespaced: no collisions possible, so every layer's
// skills are kept, each tagged with the layer it came from (org:open-pr).
export function mergeSkills(...layers) {
  return layers.flatMap((layer) =>
    layer.skills.map((skill) => ({ namespace: layer.id, name: skill.name, path: skill.path })),
  );
}

// Guidance/instructions: concatenated in load order (org, stack, repo) under
// a heading per layer, so the most specific layer's text appears last and
// reads as the final word on anything the earlier layers also touched.
function dropLeadingH1(text) {
  return text.replace(/^#\s+.*\n+/, "");
}

export function mergeInstructions(org, stack, repo) {
  const sections = [];
  for (const layer of [org, stack, repo]) {
    if (layer.instructions) {
      const label = layer.id === "stack" ? `Stack: ${layer.name}` : LABELS[layer.id];
      sections.push({ id: layer.id, label, text: dropLeadingH1(layer.instructions.trim()).trim() });
    }
  }
  return sections;
}

export function merge({ org, stack, repo }) {
  return {
    instructionSections: mergeInstructions(org, stack, repo),
    guardrails: mergeGuardrails(org, stack, repo),
    skills: mergeSkills(org, stack, repo),
    commands: stack.commands ?? {},
    tooling: stack.tooling ?? null,
  };
}
