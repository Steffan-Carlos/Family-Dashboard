# TASK-002: Implement PIN-based authentication

| Field       | Value                |
|-------------|----------------------|
| Status      | backlog              |
| Priority    | high                 |
| Project     | auth                 |
| Parent      | none                 |
| Assignee    | any                  |
| Created     | 2026-03-07           |
| Updated     | 2026-03-07           |

## Description

Build a PIN-based authentication system for family members. Parents get full access, kids get limited access. No passwords - each family member has a simple numeric PIN (4-6 digits). The login screen should show family member avatars/tiles that are large and easy to tap on the wall-mounted tablet.

This needs both the backend auth logic (PIN verification, session management) and the frontend login UI (family member tiles, PIN pad).

## Acceptance Criteria

- [ ] Family members table in SQLite with name, role (parent/kid), PIN hash, assigned color
- [ ] API endpoint to verify PIN and create session
- [ ] API endpoint to list family members (names + colors, no PINs)
- [ ] Login screen with large tappable tiles for each family member
- [ ] PIN entry pad with 64px touch targets
- [ ] Session persists across page reloads (cookie or localStorage)
- [ ] Parents see full UI, kids see restricted view
- [ ] First-run setup flow to create initial family members

## Subtasks

- [ ] Design and create family_members DB table
- [ ] Build PIN verification API route
- [ ] Build session management middleware
- [ ] Create family member tile component
- [ ] Create PIN pad input component
- [ ] Create login screen layout
- [ ] Wire up auth state management in React
- [ ] Build first-run setup flow

## Files Modified

- (to be filled during implementation)

## Comments

### 2026-03-07 - orchestrator
Depends on TASK-001 (project scaffolding) being complete. This is a cross-domain task spanning frontend, backend, and data agents. Consider breaking down with `/breakdown-task` when ready to start.
