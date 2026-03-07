Plan and create tasks for an entire feature.

## Instructions

The user will describe a feature. The argument is the feature description: `$ARGUMENTS`

1. **Check PROJECTS.md**: Read `.claude/tasks/PROJECTS.md` and check if this feature already has a project tag. If not, add a new row with an appropriate tag, name, phase, and description.

2. **Create the epic task**: Using the `/create-task` workflow (read COUNTER.md, create file, increment counter), create a parent "epic" task that represents the entire feature. Set priority to high.

3. **Analyze the feature** and identify all implementation tasks across domains:
   - **Data layer** (data-agent): Database tables, migrations, seed data
   - **Backend** (backend-agent): API routes, business logic, middleware
   - **Frontend** (frontend-agent): Components, pages, state management, styling

4. **Identify dependencies**: Map out which tasks depend on others. Typically:
   - Schema/migrations first
   - API routes second
   - Frontend components third (or parallel with API if contract is defined)

5. **Create all subtasks**: For each identified task:
   - Create the task file in `.claude/tasks/active/`
   - Link it to the epic as parent
   - Set the appropriate assignee
   - Include dependency notes in the description

6. **Update the parent epic**: Add all subtask references to the epic's Subtasks section.

7. **Update BOARD.md**: Add all new tasks to the appropriate project section.

8. **Report the plan**: Output a summary showing:
   - The project tag and epic task ID
   - All subtasks with IDs, assignees, and dependency graph
   - Suggested execution order (what can be parallel, what's sequential)
   - Estimated scope (number of tasks per domain)

## Example Output

```
Feature: PIN-based Authentication
Project: auth (Phase 1)
Epic: TASK-010

Execution Plan:
  1. TASK-011 [data-agent] Create family_members table
  2. TASK-012 [backend-agent] Build PIN verification API (depends on 011)
  3. TASK-013 [backend-agent] Build session middleware (depends on 012)
  4. TASK-014 [frontend-agent] Create PIN pad component (parallel with 012-013)
  5. TASK-015 [frontend-agent] Build login screen (depends on 013, 014)
  6. TASK-016 [frontend-agent] Wire up auth state management (depends on 015)

Parallel opportunities: 014 can run alongside 012+013
```
