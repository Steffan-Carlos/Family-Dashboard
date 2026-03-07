# TASK-003: Calendar System — Two-Way Sync (Epic)

| Field       | Value                |
|-------------|----------------------|
| Status      | done                 |
| Priority    | high                 |
| Project     | calendar             |
| Parent      | none                 |
| Assignee    | orchestrator         |
| Created     | 2026-03-07           |
| Updated     | 2026-03-07           |

## Description

Epic for the full two-way calendar sync system. Supports multiple Google accounts (multiple calendars each), Office 365 for work calendars, event creation with calendar selection, and continuous background sync via polling.

Architecture: Google Calendar API + Microsoft Graph API with a shared CalendarProvider abstraction. Built-in OAuth flows in the dashboard settings. Background polling every 15 min + manual "Sync Now" button.

## Acceptance Criteria

- [ ] Multiple Google accounts can be connected via OAuth
- [ ] Office 365 account can be connected via OAuth
- [ ] All calendars from each account are listed and toggleable
- [ ] Events from all visible calendars display on the calendar view
- [ ] New events can be created and assigned to a specific calendar
- [ ] Events sync back to the provider (Google/Microsoft)
- [ ] Background polling keeps calendars in sync every 15 min
- [ ] Manual "Sync Now" button triggers immediate refresh
- [ ] Calendar view supports month/week/day views

## Subtasks

- [ ] TASK-004: Calendar data layer (entities)
- [ ] TASK-005: Calendar provider interfaces + types
- [ ] TASK-006: Google Calendar provider
- [ ] TASK-007: Microsoft Calendar provider
- [ ] TASK-008: Sync engine + scheduler
- [ ] TASK-009: Calendar API routes + OAuth endpoints
- [ ] TASK-010: Calendar settings UI
- [ ] TASK-011: Calendar view + event creation UI

## Files Modified

- (tracked per subtask)

## Comments

### 2026-03-07 - orchestrator
Rewrote from simple iCal parser to full two-way sync epic. Original TASK-003 scope was read-only iCal feeds — new scope covers multi-provider OAuth, two-way event sync, and full calendar UI. Broken into 8 subtasks (TASK-004 through TASK-011).
