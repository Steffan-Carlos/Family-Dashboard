# TASK-006: Google Calendar provider

| Field       | Value                |
|-------------|----------------------|
| Status      | backlog              |
| Priority    | high                 |
| Project     | calendar             |
| Parent      | TASK-003             |
| Assignee    | backend-agent        |
| Created     | 2026-03-07           |
| Updated     | 2026-03-07           |

## Description

Implement GoogleCalendarProvider using the googleapis npm package. Handles OAuth2 with offline refresh tokens, lists calendars from an account, performs incremental event sync via Google's syncToken, and supports full CRUD on events.

## Acceptance Criteria

- [ ] OAuth2 flow: generate auth URL with offline access, exchange code for tokens
- [ ] Token refresh when expired
- [ ] List all calendars for an account
- [ ] Incremental event sync using Google's syncToken parameter
- [ ] Create, update, delete events on a specific calendar
- [ ] Proper error handling for API failures, rate limits, invalid tokens

## Subtasks

(none - single deliverable)

## Files Modified

- `src/logic/calendar/google-provider.ts`

## Comments

### 2026-03-07 - orchestrator
Depends on TASK-004 (entities) and TASK-005 (interfaces). Can be built in parallel with TASK-007 (Microsoft provider). Uses googleapis npm package. Scopes: calendar.readonly, calendar.events.
