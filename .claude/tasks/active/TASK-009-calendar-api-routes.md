# TASK-009: Calendar API routes + OAuth endpoints

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

Create all REST API endpoints for the calendar system: OAuth flow routes, account management, calendar configuration, event CRUD, and sync triggers. Mount on /api/calendar in the Express app.

## Acceptance Criteria

- [ ] `GET /api/calendar/auth/:provider` — returns OAuth authorization URL
- [ ] `GET /api/calendar/callback/:provider` — handles OAuth callback, stores tokens, fetches calendars
- [ ] `GET /api/calendar/accounts` — list connected accounts with calendars
- [ ] `DELETE /api/calendar/accounts/:id` — disconnect account (cascade delete)
- [ ] `GET /api/calendar/calendars` — list all calendars across accounts
- [ ] `PATCH /api/calendar/calendars/:id` — toggle visibility, change color
- [ ] `GET /api/calendar/events?start=&end=&calendarIds=` — query events
- [ ] `POST /api/calendar/events` — create event with calendarId
- [ ] `PUT /api/calendar/events/:id` — update event
- [ ] `DELETE /api/calendar/events/:id` — delete event
- [ ] `POST /api/calendar/sync` — trigger manual sync
- [ ] `GET /api/calendar/sync/status` — per-calendar sync status

## Subtasks

(none - single deliverable)

## Files Modified

- `src/api/calendar-routes.ts`
- `src/api/server.ts` (mount routes + start scheduler)

## Comments

### 2026-03-07 - orchestrator
Depends on TASK-008 (sync engine). This is the integration point — wires providers, sync engine, and entities together into Express routes. Frontend tasks (010, 011) depend on these endpoints.
