# Spec Swarm Coder Skill + Plugin

A version-control-aware OpenCode setup that merges:

- multirun-style clarification,
- spec-kit artifact generation, and
- swarm-based implementation.

It ships as both:

- an OpenCode skill (`.opencode/skills/spec-swarm-coder/SKILL.md`)
- an OpenCode plugin (`.opencode/plugins/spec-swarm-coder-plugin.ts`)

## npm Package

This repository is publish-ready as:

- `opencode-spec-swarm-coder-plugin`

Package entry:

- `dist/index.js` exporting `SpecSwarmCoderPlugin`

## Install in a project

Copy the skill file to:

`.opencode/skills/spec-swarm-coder/SKILL.md`

For local plugin development, copy the plugin file to:

`.opencode/plugins/spec-swarm-coder-plugin.ts`

And include plugin dependencies in:

`.opencode/package.json`

For published npm usage, add this to your project `opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["opencode-spec-swarm-coder-plugin"]
}
```

You can also copy `opencode.json.example` from this repository.

## Usage

Load the skill:

`skill(name="spec-swarm-coder")`

Plugin behavior is loaded automatically from `.opencode/plugins/`.

For npm plugin mode, behavior is loaded automatically from the `plugin` array in `opencode.json`.

The plugin adds one helper tool:

- `spec_swarm_status` - checks whether `spec.md`, `plan.md`, and `tasks.md` exist and are ready for implementation.

The plugin also guards `/speckit.implement` and blocks execution when required artifacts are missing.

Then follow the guided workflow:

1. Clarify goals and constraints.
2. Generate spec artifacts via `/speckit.*`.
3. Implement with swarm tracks and verify.

## Included Skill File

This repository includes a ready-to-use skill at:

`.opencode/skills/spec-swarm-coder/SKILL.md`

## Included Plugin Files

- `.opencode/plugins/spec-swarm-coder-plugin.ts`
- `.opencode/package.json`

## Build and Publish

```bash
npm install
npm run check
npm run build
npm publish --access public
```

If the package name is already taken, update `name` in `package.json` and use the same name in your `opencode.json` plugin array.
