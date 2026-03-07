Synchronize the task board with actual task file statuses.

## Instructions

1. **Scan all task files**: Read every `.md` file in both `.claude/tasks/active/` and `.claude/tasks/completed/`.

2. **Extract metadata** from each task file:
   - Task ID and title (from the `# TASK-XXX: Title` heading)
   - Status (from the Status field in the metadata table)
   - Project tag (from the Project field)

3. **Read the current BOARD.md** at `.claude/tasks/BOARD.md`.

4. **Read PROJECTS.md** to get the full list of project tags and their display names.

5. **Rebuild BOARD.md** from scratch:
   - Group tasks by project tag
   - Within each project section, place tasks in the correct column based on status:
     - `backlog` -> Backlog column
     - `in-progress` -> In Progress column
     - `review` -> Review column
     - `done` -> Done column
   - Include a section for each project that has at least one task
   - Update the "Last synced" timestamp at the top

6. **Flag inconsistencies** and report them:
   - Tasks with status `done` still in `active/` folder (should be archived)
   - Tasks referenced in subtask lists that don't have corresponding files
   - Tasks with a parent that doesn't exist
   - Project tags on tasks that aren't in PROJECTS.md

7. **Write the updated BOARD.md**.

8. Report what changed: tasks added, tasks moved between columns, inconsistencies found.
