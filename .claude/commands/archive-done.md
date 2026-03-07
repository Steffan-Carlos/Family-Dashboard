Archive completed tasks to keep the active directory lean.

## Instructions

1. **Scan active tasks**: Read all `.md` files in `.claude/tasks/active/`.

2. **Identify done tasks**: Find all tasks where the Status field is `done`.

3. **For each done task**:
   - Move the file from `.claude/tasks/active/` to `.claude/tasks/completed/`
   - Use git mv if in a git repo, otherwise standard file move
   - Leave a final comment on the task:
     ```
     ### {date} - orchestrator
     Task archived to completed/.
     ```

4. **Update BOARD.md**: Remove archived tasks from the board (or move them to a small "Recently Archived" note at the bottom if you want to keep a brief record).

5. **Check for orphaned subtasks**: If an archived task had subtasks that are still active, flag them. Don't archive parent tasks if children are still in progress.

6. **Report results**:
   - List of tasks archived (ID + title)
   - Any tasks skipped and why (e.g., active subtasks)
   - Current count of active vs completed tasks

## Safety Rules

- Never archive tasks that are NOT in `done` status
- Never archive a parent task if any of its subtasks are still in `active/` with non-done status
- Always update BOARD.md after archiving
- If no tasks are ready to archive, say so and exit
