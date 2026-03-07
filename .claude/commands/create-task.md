Create a new task in the task management system.

## Instructions

1. Read `.claude/tasks/COUNTER.md` to get the next available task ID number.

2. Ask the user (or use the provided arguments) for:
   - **Title**: Short descriptive title
   - **Project tag**: Must match a tag in `.claude/tasks/PROJECTS.md` (or "none")
   - **Priority**: high / medium / low
   - **Assignee**: frontend-agent / backend-agent / data-agent / any
   - **Description**: What needs to be done and why
   - **Parent task**: Optional parent task ID if this is a subtask

3. Create the task file at `.claude/tasks/active/TASK-{ID}-{slug}.md` using this template:

```markdown
# TASK-{ID}: {Title}

| Field       | Value                |
|-------------|----------------------|
| Status      | backlog              |
| Priority    | {priority}           |
| Project     | {project-tag}        |
| Parent      | {parent or none}     |
| Assignee    | {assignee}           |
| Created     | {today's date}       |
| Updated     | {today's date}       |

## Description
{description}

## Acceptance Criteria
- [ ] (to be defined)

## Subtasks
(none yet)

## Files Modified
- (to be filled during implementation)

## Comments

### {today's date} - orchestrator
Task created via /create-task.
```

4. Increment the number in `.claude/tasks/COUNTER.md` by 1.

5. Add the task to the appropriate project section in `.claude/tasks/BOARD.md` under the Backlog column. If the project section doesn't exist yet, create it.

6. If this task has a parent, update the parent task's Subtasks section to include a reference to this new task.

7. Report back with the task ID, file path, and a brief summary.

## Arguments

The user may provide arguments after the command like:
`/create-task "Build login screen" project=auth priority=high assignee=frontend-agent`

Parse these if provided, otherwise ask interactively.
