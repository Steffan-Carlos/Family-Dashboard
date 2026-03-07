# TASK-010: Calendar settings UI

| Field       | Value                |
|-------------|----------------------|
| Status      | done                 |
| Priority    | medium               |
| Project     | calendar             |
| Parent      | TASK-003             |
| Assignee    | frontend-agent       |
| Created     | 2026-03-07           |
| Updated     | 2026-03-07           |

## Description

Build the settings page for managing calendar accounts and calendars. Users can add Google and Microsoft accounts via OAuth, see all calendars from each account, toggle calendar visibility, change display colors, and see sync status with a manual refresh button.

## Acceptance Criteria

- [ ] "Add Google Account" and "Add Microsoft Account" buttons that initiate OAuth
- [ ] List of connected accounts with disconnect option
- [ ] Expandable calendar list per account with visibility toggles
- [ ] Color picker for each calendar
- [ ] Sync status display showing last sync time per calendar
- [ ] "Sync Now" button that triggers manual sync
- [ ] Error state display for calendars with sync failures
- [ ] All touch targets 64px, design system colors and typography

## Subtasks

(none - single deliverable)

## Files Modified

- `src/components/settings/CalendarSettings.tsx` + `.module.scss`
- `src/components/settings/AccountList.tsx` + `.module.scss`
- `src/components/settings/CalendarList.tsx` + `.module.scss`
- `src/components/settings/SyncStatus.tsx` + `.module.scss`

## Comments

### 2026-03-07 - orchestrator
Depends on TASK-009 (API routes). Can be built in parallel with TASK-011 (calendar view). Follow design system from CLAUDE.MD — kid-friendly but organized. Haptic feedback on account add/remove actions.
