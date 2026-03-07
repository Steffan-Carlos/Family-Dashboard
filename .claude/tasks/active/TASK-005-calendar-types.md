# TASK-005: Calendar provider interfaces + types

| Field       | Value                |
|-------------|----------------------|
| Status      | done                 |
| Priority    | high                 |
| Project     | calendar             |
| Parent      | TASK-003             |
| Assignee    | backend-agent        |
| Created     | 2026-03-07           |
| Updated     | 2026-03-07           |

## Description

Define the CalendarProvider interface that both Google and Microsoft providers will implement, plus all shared types for events, sync options, and OAuth tokens. Also create .env.example documenting required OAuth credentials.

## Acceptance Criteria

- [ ] `CalendarProvider` interface with: getAuthUrl, handleAuthCallback, refreshAccessToken, listCalendars, listEvents, createEvent, updateEvent, deleteEvent
- [ ] `SyncOptions` interface (syncToken, timeMin, timeMax)
- [ ] `SyncResult` interface (events, nextSyncToken, deleted IDs)
- [ ] `ProviderEvent`, `ProviderCalendar`, `OAuthTokens`, `EventInput` types
- [ ] `.env.example` with all required env vars documented

## Subtasks

(none - single deliverable)

## Files Modified

- `src/types/calendar.ts`
- `.env.example`

## Comments

### 2026-03-07 - orchestrator
Foundation task alongside TASK-004. Providers (TASK-006, 007) depend on these interfaces.
