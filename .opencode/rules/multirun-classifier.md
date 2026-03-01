Use classifier-first behavior for every new non-trivial task.

Intent:
- Clarify goals, constraints, and method before planning or coding.
- Keep clarification output compact and decision-oriented.

Trigger:
- Run classifier immediately when a new non-trivial task is received.
- Skip only for trivial one-step requests with no ambiguity.

Required output shape:

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

Hard-stop rule:
- Output only the `Task Brief` and `Next Question` blocks during clarification turns.
- After `Next Question`, stop and wait for user response.
- No todos, tool calls, search output, plans, or implementation before the user replies.

Quality rules:
- One focused question at a time.
- Prefer 2-4 concrete options when useful.
- Keep wording short and plain.

TUI clarification UX (after initial hard-stop clarification card):
- Keep clarification in terminal (TUI) only.
- Use `question` prompts and pass one or more items through the `questions` array.
- Allow per-question selection mode: single-select or multi-select.
- Always provide a custom typed answer option in each question.
- Support defer/skip per question and re-evaluate deferred items from same-round answers.
- Re-ask deferred questions in the next round only if still needed, and show them first.

Terminal keyboard behavior:
- `Tab` / `Shift+Tab`: move active question.
- Arrow keys: move option focus inside the active question.
- `Space`: select/toggle option based on that question's mode.
- `Enter`: enter sub-menu when present; otherwise open comment input for the selected option.

Runtime tool contract:
- During the initial hard-stop card turn, do not call any tools.
- After the user replies, use `question` only for clarification prompts (`multiple: false/true`).
- Tool names are case-sensitive and must stay `snake_case` (`question`, not `Question`).
- Never call pseudo/invalid tools: `AskUserQuestion`, `StartSession`, `PickOne`, `PickMany`.
- Never call session/web clarification tools: `start_session`, `pick_one`, `pick_many`, `get_next_answer`.
- Never emit XML-like pseudo calls in text (for example `<tool_call>...</tool_call>`); use real tool invocations only.
- For `question`, pass `questions` as an array object, not a JSON string.
- Never call `todowrite` during clarification.
