# Spec Swarm Coder (OpenCode Skill + Plugin)

Spec Swarm Coder is a version-control-aware OpenCode workflow that combines:

- multirun-style requirement clarification,
- spec-kit artifact generation, and
- agent-swarm implementation with quality gates.

This repository ships both a reusable skill and a publishable OpenCode plugin.

## What You Get

- Skill definition: `.opencode/skills/spec-swarm-coder/SKILL.md`
- Plugin source: `src/index.ts`
- Local plugin bridge: `.opencode/plugins/spec-swarm-coder-plugin.ts`
- Local plugin deps manifest: `.opencode/package.json`
- npm package metadata: `package.json`
- OpenCode config example: `opencode.json.example`

Published package name:

- `opencode-spec-swarm-coder-plugin`

## Core Behavior

The workflow is designed as a strict pipeline:

1. Clarify goals and constraints before implementation.
2. Produce spec artifacts (`spec.md`, `plan.md`, `tasks.md`) before coding.
3. Implement via swarm tracks with non-overlapping ownership.
4. Enforce verification and version-control checkpoints.

The plugin reinforces this by:

- exposing a `spec_swarm_status` tool, and
- blocking `/speckit.implement` when required artifacts are not ready.

## Requirements

- OpenCode with plugin support
- Access to `/speckit.*` commands or equivalent local spec-kit templates
- Git for branch and change tracking
- Node.js + npm (required for building/publishing this package)

## Installation Modes

### Recommended: npm plugin + local skill

1. Add the plugin package to your `opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": [
    "opencode-spec-swarm-coder-plugin"
  ]
}
```

2. Copy the skill file into your project:

- `.opencode/skills/spec-swarm-coder/SKILL.md`

3. Restart OpenCode (or reload session) so plugin hooks and skill discovery refresh.

### Local development mode (from this repository)

Use this when iterating on plugin code before publishing.

1. Install dependencies:

```bash
npm install
```

2. Run checks and build:

```bash
npm run check
npm run build
```

3. Ensure local OpenCode plugin bridge exists:

- `.opencode/plugins/spec-swarm-coder-plugin.ts`

That bridge re-exports from `src/index.ts` for local runtime loading.

### Skill-only mode

If you only want process guidance (without enforcement hooks), install:

- `.opencode/skills/spec-swarm-coder/SKILL.md`

You still get the full phase guidance, but you do not get plugin guardrails/tooling.

## Quick Start (Day-1 Usage)

1. Load the skill:

`skill(name="spec-swarm-coder")`

2. Run spec pipeline:

- `/speckit.specify`
- `/speckit.plan`
- `/speckit.tasks`

3. Check readiness (plugin tool):

- Use `spec_swarm_status` with no args to scan all `specs/*` feature dirs.
- Use `spec_swarm_status` with `featureDir` for a specific feature.

4. Implement:

- Run `/speckit.implement` only after readiness returns `ready: true`.

5. Verify:

- run diagnostics/tests/build and map changes back to `tasks.md` task IDs.

## Plugin Tool Reference

### `spec_swarm_status`

Purpose:

- validates presence of required artifacts (`spec.md`, `plan.md`, `tasks.md`)
- reports implementation readiness and next action

Arguments:

- `featureDir` (optional, absolute or relative path)

Behavior:

- without `featureDir`: scans all feature directories under `specs/`
- with `featureDir`: checks only that feature directory

Result shape:

- `ready`: boolean
- `report` or `files`: per-artifact status
- `next`: actionable next step string

## Guardrail Behavior

The plugin hooks `command.execute.before` and intercepts `/speckit.implement`.

It blocks implementation when either condition is true:

- no `specs/*` feature directory exists
- no feature directory has all required artifacts

Blocking messages explicitly instruct users to complete:

- `/speckit.specify`
- `/speckit.plan`
- `/speckit.tasks`

## End-to-End Example

Example request:

- "Build a profile page with avatar upload and audit logging"

Recommended flow:

1. Use skill clarification phase to finalize scope, NFRs, and acceptance criteria.
2. Generate artifacts with `/speckit.specify -> /speckit.plan -> /speckit.tasks`.
3. Run `spec_swarm_status` until `ready: true`.
4. Start `/speckit.implement` and execute swarm tracks by file ownership.
5. Validate and summarize with verification evidence.

## Repository Layout

```text
spec-swarm-coder-skill/
  .opencode/
    package.json
    plugins/
      spec-swarm-coder-plugin.ts
    skills/
      spec-swarm-coder/
        SKILL.md
  src/
    index.ts
  opencode.json.example
  package.json
  tsconfig.json
```

## Build, Pack, Publish

```bash
npm install
npm run check
npm run build
npm pack
npm publish --access public
```

Notes:

- `prepublishOnly` runs `npm run build` automatically.
- If package name is taken, update `name` in `package.json` and use the same name in `opencode.json`.

## Version-Control Guidance

- Keep spec and implementation changes traceable to `tasks.md` IDs.
- Use atomic commits by story/phase.
- Run validation before every publish/release commit.

## Troubleshooting

- Plugin not loading:
  - confirm `opencode.json` has `plugin` entry for `opencode-spec-swarm-coder-plugin`
  - restart OpenCode session
- `skill(name="spec-swarm-coder")` not found:
  - verify skill file is at `.opencode/skills/spec-swarm-coder/SKILL.md`
- `/speckit.implement` blocked:
  - run `spec_swarm_status` and create missing `spec.md`, `plan.md`, `tasks.md`
- No `specs/*` found:
  - start with `/speckit.specify`

## Security

- Do not commit secrets, PATs, or credential files.
- Rotate tokens immediately if exposed.

## License

MIT. See `LICENSE`.
