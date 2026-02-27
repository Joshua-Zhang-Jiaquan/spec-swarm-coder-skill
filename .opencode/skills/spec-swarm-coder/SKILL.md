---
name: spec-swarm-coder
description: User-friendly coding workflow that combines multirun clarification, spec-kit artifact generation, and swarm-based implementation with version-control checkpoints.
compatibility: opencode
metadata:
  source: local
  workflow: clarify-spec-implement
  replaces:
    - agent-swarm-enabler
    - task-clarifier
    - spec-kit
---

# Spec Swarm Coder

Use this as the default coding skill for non-trivial feature work.

It merges three capabilities into one path:

1. Multirun-style clarification to lock goals and constraints.
2. Spec-kit workflow to build specification artifacts.
3. Agent swarm execution to implement code in parallel safely.

## When to use

Activate when any of these are true:

- Request is ambiguous or missing acceptance criteria.
- Work spans 2+ modules or 3+ independent tracks.
- User asks for end-to-end feature delivery.

Do not activate when:

- A one-file trivial edit is enough.
- The task is purely informational with no code action.

## Golden Path

### Phase 1 - Clarify with Multirun

Goal: convert vague requests into an implementation contract.

Ask one focused question per turn, then synthesize:

- Objective and business/user value.
- In-scope vs out-of-scope behavior.
- Functional and non-functional requirements.
- Success criteria and measurable acceptance checks.
- Constraints (stack, timeline, compliance, compatibility).

Output artifact:

- `Clarified Requirements` summary block to drive spec files.

Exit criteria (stop clarifying and proceed):

- Objective, scope boundaries, and success criteria are explicit.
- Constraints and dependencies are recorded.
- No blocking ambiguity remains for architecture or implementation.
- If unresolved after 5 focused turns, lock assumptions, mark them clearly, and proceed.

### Phase 2 - Build Spec-Kit Artifacts

Goal: produce structured files and goals before coding.

Use `/speckit.*` commands in this order:

1. `/speckit.constitution` (if missing or outdated)
2. `/speckit.specify` (requirements and user stories)
3. `/speckit.clarify` (if any ambiguity remains)
4. `/speckit.plan` (architecture and technical decisions)
5. `/speckit.tasks` (dependency-ordered execution tasks)
6. `/speckit.analyze` (consistency and coverage checks)

Required deliverables before implementation:

- `spec.md`, `plan.md`, `tasks.md`
- Supporting files when applicable: `research.md`, `data-model.md`, `contracts/*`, `quickstart.md`

Fallback when `/speckit.*` commands are unavailable:

- Read local templates in `spec-kit/templates/commands/*.md` directly.
- Produce equivalent artifacts manually under the current feature directory.
- Preserve the same command order and deliverable quality gates.

### Phase 3 - Implement with Agent Swarm

Goal: execute tasks quickly with parallel ownership and safe merges.

Swarm protocol:

1. Create a shared todo with independent tracks.
2. Spawn 3-5 background workers using `task(..., run_in_background=true)`.
3. Assign non-overlapping file ownership per worker.
4. Require each worker prompt to include:
   - TASK
   - EXPECTED OUTCOME
   - REQUIRED TOOLS
   - MUST DO
   - MUST NOT DO
   - CONTEXT
5. Collect outputs, reconcile conflicts, and continue via `session_id`.
6. Verify diagnostics/tests/build before marking complete.

Operational merge mechanics:

- Assign one integration owner (coordinator) to merge worker outputs.
- Merge one worker patch set at a time, then run targeted verification.
- If file ownership conflict appears, pause conflicting worker and re-scope before merge.
- Keep integration notes mapped to task IDs from `tasks.md`.

## Version-Control Workflow (Built In)

Use version control as a first-class workflow checkpoint.

1. **Spec checkpoint**
   - Ensure branch naming follows spec-kit feature style (for example `001-feature-name`).
   - Confirm spec artifacts exist and align with clarified goals.
   - Start from a clean working tree or isolate unrelated changes first.

2. **Implementation checkpoint**
   - Track code changes against `tasks.md` task IDs.
   - Keep changes atomic by story/phase when possible.
   - Use branch-per-feature and avoid mixing multiple stories in one commit.

3. **Validation checkpoint**
   - Run diagnostics on touched files.
   - Run relevant tests for modified modules.
   - Run build/typecheck where applicable.
   - Run secrets and sensitive-file checks before commit.

4. **Review checkpoint**
   - Summarize what changed, why, and evidence of verification.
   - Keep commit/PR messaging tied to user value and acceptance criteria.
   - Include rollback notes for risky or cross-layer changes.

## User-Friendly Interaction Rules

- Start with plain-language progress updates at phase boundaries.
- Ask only the minimum clarifying questions needed.
- Prefer multiple-choice options when ambiguity is high.
- Always restate final understanding before implementation begins.
- Keep outputs actionable: file paths, decisions, next concrete step.

## Safety Gates

- No speculative edits.
- No overlapping swarm ownership on same files.
- Prefer the smallest safe patch.
- Do not start coding until goals/spec/tasks are coherent.
- Never skip verification on touched code.
- Never commit secrets, tokens, or credentials.
- Avoid destructive git actions unless explicitly requested.

## Quick Start

1. Invoke this skill for a non-trivial request.
2. Run clarification loop and freeze goals.
3. Generate spec-kit files with `/speckit.*` sequence.
4. Launch swarm implementation tracks.
5. Validate, summarize, and hand off with clear verification evidence.
