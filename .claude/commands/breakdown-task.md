Break down an existing task into subtasks.

## Instructions

1. The user will provide a task ID (e.g., "TASK-002") as an argument: `$ARGUMENTS`

2. Read the parent task file from `.claude/tasks/active/` by finding the file that starts with the given task ID.

3. Analyze the task's description and acceptance criteria to identify logical subtasks. Consider:
   - What are the distinct pieces of work?
   - Which agent domain does each piece belong to (frontend, backend, data)?
   - What's the dependency order?
   - Are there any shared interfaces or contracts between domains?

4. Propose the subtask breakdown to the user. For each subtask include:
   - Suggested title
   - Assignee (domain agent)
   - Brief description
   - Dependencies on other subtasks

5. After user approval (or immediately if the breakdown is straightforward), create each subtask:
   - Read `.claude/tasks/COUNTER.md` for the next ID
   - Create each subtask file in `.claude/tasks/active/` using the standard template
   - Set the Parent field to the original task ID
   - Increment COUNTER.md after each task
   - Add each subtask to the parent task's Subtasks section
   - Add each subtask to `.claude/tasks/BOARD.md` under the correct project

6. Leave a comment on the parent task documenting the breakdown:
   ```
   ### {date} - orchestrator
   Broke this task into {N} subtasks: TASK-X, TASK-Y, TASK-Z.
   Dependency order: TASK-X -> TASK-Y, TASK-Z (parallel after X).
   ```

7. Report the full breakdown with task IDs and suggested execution order.

## Breakdown Principles

- Keep subtasks focused on a single domain (frontend OR backend OR data)
- Identify shared contracts early (e.g., API request/response shapes)
- Data/schema tasks usually come first
- Backend API tasks come after schema
- Frontend tasks can often parallel backend if the API contract is agreed
- Each subtask should be completable in a single session
