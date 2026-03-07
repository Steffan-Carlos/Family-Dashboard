# TASK-008: Sync engine + scheduler

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

Build the sync engine that orchestrates calendar synchronization across all providers, and a scheduler that runs background polling. The sync engine handles incremental sync, pushing locally-created events to providers, and conflict resolution (provider wins).

## Acceptance Criteria

- [ ] `syncCalendar()` — full sync flow for one calendar (refresh token, pull changes, upsert events, push local events, update sync state)
- [ ] `syncAllCalendars()` — iterate all visible calendars and sync each
- [ ] `pushLocalEvent()` — create locally-created event on the provider
- [ ] Conflict resolution: provider's version wins on conflicts
- [ ] Background scheduler with configurable interval (default 15 min)
- [ ] `triggerManualSync()` — immediate sync, debounced to prevent spam
- [ ] Sync-in-progress flag prevents overlapping syncs
- [ ] Error tracking per calendar (lastSyncStatus, lastSyncError)

## Subtasks

(none - single deliverable)

## Files Modified

- `src/logic/calendar/sync-engine.ts`
- `src/logic/calendar/scheduler.ts`

## Comments

### 2026-03-07 - orchestrator
Depends on TASK-006 (Google) and TASK-007 (Microsoft). Scheduler starts on server boot from server.ts. Uses SYNC_INTERVAL_MINUTES env var.
