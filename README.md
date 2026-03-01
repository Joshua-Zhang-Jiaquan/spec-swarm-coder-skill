# Spec Swarm Coder

[![OpenCode Plugin](https://img.shields.io/badge/OpenCode-Plugin-4f46e5)](https://opencode.ai)
[![Workflow](https://img.shields.io/badge/Workflow-Clarify%20%E2%86%92%20Spec%20%E2%86%92%20Swarm-0ea5e9)](#workflow-at-a-glance)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-10b981)](LICENSE)

Spec Swarm Coder is a version-control-aware OpenCode workflow that combines:

- multirun-style requirement clarification,
- spec-kit artifact generation, and
- agent-swarm implementation with quality gates.

This repository ships both a reusable skill and a publishable OpenCode plugin.

Published package name:

- `opencode-spec-swarm-coder-plugin`

## Table of Contents

- [What You Get](#what-you-get)
- [Workflow at a Glance](#workflow-at-a-glance)
- [Hard-Stop Clarification Gate](#hard-stop-clarification-gate)
- [Requirements](#requirements)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Plugin Tool Reference](#plugin-tool-reference)
- [Guardrail Behavior](#guardrail-behavior)
- [End-to-End Example](#end-to-end-example)
- [Repository Layout](#repository-layout)
- [Build, Pack, Publish](#build-pack-publish)
- [Version-Control Guidance](#version-control-guidance)
- [Troubleshooting](#troubleshooting)
- [Security](#security)
- [License](#license)

## What You Get

| Item | Path | Purpose |
| --- | --- | --- |
| Skill definition | `.opencode/skills/spec-swarm-coder/SKILL.md` | Full clarify-spec-implement workflow |
| Classifier rule | `.opencode/rules/multirun-classifier.md` | Enforces classifier-first behavior |
| Plugin source | `src/index.ts` | Tooling and command guardrails |
| Local plugin bridge | `.opencode/plugins/spec-swarm-coder-plugin.ts` | Local runtime export bridge |
| Local plugin deps | `.opencode/package.json` | Plugin-side dependency manifest |
| Package metadata | `package.json` | npm package info and scripts |
| OpenCode config example | `opencode.json.example` | Drop-in config starter |

## Workflow at a Glance

The workflow is designed as a strict pipeline:

1. Clarify goals and constraints immediately for every non-trivial task.
2. Generate spec artifacts (`spec.md`, `plan.md`, `tasks.md`) before coding.
3. Implement via swarm tracks with non-overlapping ownership.
4. Enforce diagnostics/tests/build checks before completion.

## Hard-Stop Clarification Gate

> [!IMPORTANT]
> During clarification, each turn must end immediately after one focused `Next Question`.
> No tool calls, todos, implementation, or extra sections are allowed in that turn.

Clarification UI format:

```text
Task Brief
- Goal: ...
- Constraints: ...
- Method: ...
- Success Criteria: ...
- Assumptions: ...

Next Question
- <one focused question>
```

The plugin reinforces this workflow by:

- exposing a `spec_swarm_status` tool, and
- blocking `/speckit.implement` when required artifacts are not ready.

## Requirements

- OpenCode with plugin support
- Access to `/speckit.*` commands or equivalent local spec-kit templates
- Git for branch and change tracking
- Node.js + npm (required for building/publishing)

## Installation

### Recommended: npm plugin + local skill

1. Add the plugin package to your `opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": [
    "opencode-spec-swarm-coder-plugin"
  ],
  "instructions": [
    ".opencode/rules/multirun-classifier.md"
  ]
}
```

2. Copy the skill file into your project:

- `.opencode/skills/spec-swarm-coder/SKILL.md`

3. Restart OpenCode (or reload the session) so hooks and discovery refresh.

### Local development mode (this repository)

Use this mode while iterating on plugin code before publishing.

1. Install dependencies:

```bash
npm install
```

2. Run checks and build:

```bash
npm run check
npm run build
```

3. Ensure the local plugin bridge exists:

- `.opencode/plugins/spec-swarm-coder-plugin.ts`

That bridge re-exports from `src/index.ts` for local runtime loading.

### Skill-only mode

If you only need workflow guidance (without plugin guardrails), install:

- `.opencode/skills/spec-swarm-coder/SKILL.md`

## Quick Start

1. Load the skill:

`skill(name="spec-swarm-coder")`

2. Run the spec pipeline:

- `/speckit.specify`
- `/speckit.plan`
- `/speckit.tasks`

3. Check readiness using the plugin tool:

- `spec_swarm_status` with no args scans all `specs/*` feature dirs.
- `spec_swarm_status` with `featureDir` checks one feature directory.

4. Implement only when ready:

- run `/speckit.implement` only after readiness returns `ready: true`.

5. Verify outcomes:

- run diagnostics/tests/build and map changes back to `tasks.md` task IDs.

## Plugin Tool Reference

### `spec_swarm_status`

Purpose:

- validates required artifacts (`spec.md`, `plan.md`, `tasks.md`)
- reports implementation readiness and the next step

Arguments:

- `featureDir` (optional, absolute or relative path)

Behavior:

- without `featureDir`: scans all feature directories under `specs/`
- with `featureDir`: checks only that feature directory

Result shape:

- `ready`: boolean
- `report` or `files`: per-artifact status
- `next`: actionable next step

## Guardrail Behavior

The plugin hooks `command.execute.before` and intercepts `/speckit.implement`.

It blocks implementation when either condition is true:

- no `specs/*` feature directory exists
- no feature directory has all required artifacts

Blocking guidance explicitly points users to:

- `/speckit.specify`
- `/speckit.plan`
- `/speckit.tasks`

## End-to-End Example

Example request:

- "Build a profile page with avatar upload and audit logging"

Recommended flow:

1. Finalize scope, constraints, and acceptance criteria through clarification.
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
    rules/
      multirun-classifier.md
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
  - confirm `opencode.json` includes `opencode-spec-swarm-coder-plugin`
  - restart the OpenCode session
- `skill(name="spec-swarm-coder")` not found:
  - verify the skill path `.opencode/skills/spec-swarm-coder/SKILL.md`
- `/speckit.implement` blocked:
  - run `spec_swarm_status` and create missing `spec.md`, `plan.md`, `tasks.md`
- No `specs/*` found:
  - start with `/speckit.specify`

## Security

- Do not commit secrets, PATs, or credential files.
- Rotate tokens immediately if exposed.

## License

MIT. See `LICENSE`.
