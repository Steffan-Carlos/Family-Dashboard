# TASK-004: Calendar data layer

| Field       | Value                |
|-------------|----------------------|
| Status      | done                 |
| Priority    | high                 |
| Project     | calendar             |
| Parent      | TASK-003             |
| Assignee    | data-agent           |
| Created     | 2026-03-07           |
| Updated     | 2026-03-07           |

## Description

Create TypeORM Active Record entities for the calendar system: CalendarAccount (OAuth credentials), Calendar (individual calendars per account), and CalendarEvent (events from all synced calendars).

## Acceptance Criteria

- [ ] `CalendarAccount` entity with provider, email, OAuth tokens, token expiry
- [ ] `Calendar` entity with providerCalendarId, name, color, visibility, sync state
- [ ] `CalendarEvent` entity with full event data, provider mapping, recurrence support
- [ ] All entities extend BaseEntity (Active Record pattern)
- [ ] Relations: Account -> Calendars (OneToMany), Calendar -> Events (OneToMany)
- [ ] Tables auto-created via TypeORM synchronize on backend start

## Subtasks

(none - single deliverable)

## Files Modified

- `src/db/entities/CalendarAccount.ts`
- `src/db/entities/Calendar.ts`
- `src/db/entities/CalendarEvent.ts`

## Comments

### 2026-03-07 - orchestrator
Foundation task. TASK-005, 006, 007 all depend on these entities existing. FamilyMember entity doesn't exist yet (TASK-002), so CalendarAccount.familyMemberId is nullable for now.
