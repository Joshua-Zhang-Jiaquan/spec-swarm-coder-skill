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

This skill merges three capabilities into one path:

1. Multirun-style clarification to lock goals and constraints.
2. Spec-kit artifact generation before coding starts.
3. Swarm-based implementation with verification and git checkpoints.

## Activation Rules

Activate this skill when any condition is true:

- The request is ambiguous or missing acceptance criteria.
- The work spans 2+ modules or 3+ independent tracks.
- The user asks for end-to-end feature delivery.

Do not activate when:

- A one-file trivial edit is enough.
- The task is purely informational and requires no code changes.

## Workflow at a Glance

Follow this order strictly:

1. Clarify with multirun-style turns.
2. Build spec-kit artifacts (`spec.md`, `plan.md`, `tasks.md`).
3. Implement with swarm ownership boundaries.
4. Verify, summarize, and checkpoint in version control.

---

## Phase 1 - Clarify with Multirun

Goal: convert vague requests into an implementation contract.

Immediate trigger rule:

- Start clarification as soon as a new non-trivial task arrives.
- Do not defer clarification until after planning or coding.
- Skip only for trivial one-step requests with no ambiguity.

### Classifier-First Hard-Stop Gate

Before any todo, tool call, plan, or implementation output:

1. Emit one `Task Brief` card.
2. Ask one focused `Next Question`.
3. End the turn immediately and wait for user input.

Do not output tables, extra sections, tool traces, or implementation details during clarification turns.

Required UI shape:

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

### Clarification Quality Rules

- Ask one focused question per turn.
- Prefer 2-4 concrete options when useful.
- Keep wording short, plain, and decision-oriented.
- Synthesize objective, scope boundaries, constraints, and acceptance criteria.

Output artifact from Phase 1:

- `Clarified Requirements` summary block that drives spec files.

### Conversation UX Contract

Use a compact card-based UX for faster decision loops:

- Let users switch between active questions in the same round.
- Support single-select and multi-select options.
- Always allow a custom typed answer in addition to provided options.
- Allow skip/defer per question.

Skip/defer behavior:

- Re-evaluate deferred questions using answers from the same round.
- Re-ask in the next round only if still needed.
- If re-asked, place deferred questions first in the next round.

### Exit Criteria

Stop clarifying and proceed when all are true:

- Objective and scope boundaries are explicit.
- Success criteria are measurable.
- Constraints and dependencies are recorded.
- No blocking ambiguity remains for architecture or implementation.

If unresolved after 5 focused turns, lock assumptions explicitly and proceed.

---

## Phase 2 - Build Spec-Kit Artifacts

Goal: produce implementation-ready planning artifacts before coding.

Run `/speckit.*` commands in this order:

1. `/speckit.constitution` (if missing or outdated)
2. `/speckit.specify` (requirements and user stories)
3. `/speckit.clarify` (only if ambiguity remains)
4. `/speckit.plan` (architecture and technical decisions)
5. `/speckit.tasks` (dependency-ordered execution tasks)
6. `/speckit.analyze` (consistency and coverage checks)

Required deliverables before implementation:

- `spec.md`, `plan.md`, `tasks.md`
- Supporting files when applicable: `research.md`, `data-model.md`, `contracts/*`, `quickstart.md`

Fallback if `/speckit.*` commands are unavailable:

- Read local templates under `spec-kit/templates/commands/*.md`.
- Produce equivalent artifacts manually under the current feature directory.
- Preserve command order and quality gates.

---

## Phase 3 - Implement with Agent Swarm

Goal: execute quickly with parallel ownership and safe integration.

Swarm protocol:

1. Create a shared todo with independent tracks.
2. Spawn 3-5 background workers with `task(..., run_in_background=true)`.
3. Assign non-overlapping file ownership per worker.
4. Require each worker prompt to include:
   - TASK
   - EXPECTED OUTCOME
   - REQUIRED TOOLS
   - MUST DO
   - MUST NOT DO
   - CONTEXT
5. Collect outputs, reconcile conflicts, and continue via `session_id`.
6. Run diagnostics/tests/build before marking complete.

Operational merge mechanics:

- Assign one integration owner to merge worker outputs.
- Merge one worker patch set at a time.
- Run targeted verification after each merge.
- If ownership conflict appears, pause and re-scope before merge.
- Map integration notes to `tasks.md` task IDs.

---

## Version-Control Workflow (Built In)

Treat version control as a first-class quality gate.

1. Spec checkpoint
   - Ensure branch naming follows spec-kit feature style (for example `001-feature-name`).
   - Confirm spec artifacts align with clarified goals.
   - Start from a clean tree or isolate unrelated changes.

2. Implementation checkpoint
   - Track code changes against `tasks.md` task IDs.
   - Keep commits atomic by story/phase.
   - Avoid mixing unrelated stories in one commit.

3. Validation checkpoint
   - Run diagnostics on touched files.
   - Run relevant tests for modified modules.
   - Run build/typecheck where applicable.
   - Run secrets and sensitive-file checks before commit.

4. Review checkpoint
   - Summarize what changed, why, and verification evidence.
   - Keep commit/PR messages tied to user value and acceptance criteria.
   - Include rollback notes for risky cross-layer changes.

## User Interaction Rules

- Start each phase with a plain-language progress update.
- Ask only the minimum questions needed to unblock execution.
- Prefer multiple-choice options when ambiguity is high.
- Restate final understanding before implementation starts.
- Keep outputs actionable: file paths, decisions, next concrete step.
- Use consistent labels: `Goal`, `Constraints`, `Method`, `Success Criteria`, `Assumptions`.

## Safety Gates

- No speculative edits.
- No overlapping swarm ownership on the same files.
- Prefer the smallest safe patch.
- Do not start coding until goals/spec/tasks are coherent.
- Never skip verification on touched code.
- Never commit secrets, tokens, or credentials.
- Avoid destructive git actions unless explicitly requested.

## Quick Start

1. Invoke `skill(name="spec-swarm-coder")`.
2. Run the clarification loop and freeze goals.
3. Generate spec artifacts with `/speckit.*`.
4. Launch swarm implementation tracks.
5. Validate, summarize, and hand off with verification evidence.
