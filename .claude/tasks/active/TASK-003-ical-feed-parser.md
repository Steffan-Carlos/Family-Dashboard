# TASK-003: Build iCal feed parser

| Field       | Value                |
|-------------|----------------------|
| Status      | backlog              |
| Priority    | medium               |
| Project     | calendar             |
| Parent      | none                 |
| Assignee    | backend-agent        |
| Created     | 2026-03-07           |
| Updated     | 2026-03-07           |

## Description

Implement an iCal (.ics) feed parser that can fetch and parse calendar feeds from Google Calendar, Apple Calendar, and Outlook. No external calendar APIs - parse the iCal format directly per project requirements.

The parser should periodically fetch feeds, extract events, and store them in SQLite for the frontend to query. Each family member can have one or more calendar feeds associated with their profile.

## Acceptance Criteria

- [ ] Parse standard iCal/ICS format (VEVENT components)
- [ ] Handle recurring events (RRULE)
- [ ] Fetch feeds from HTTP/HTTPS URLs
- [ ] Store parsed events in SQLite with family member association
- [ ] Support Google Calendar, Apple iCloud, and Outlook feed URLs
- [ ] Periodic background refresh (configurable interval, default 15 min)
- [ ] API endpoint to get events for a date range, optionally filtered by family member
- [ ] Graceful error handling for unreachable feeds

## Subtasks

- [ ] Research iCal format and pick/build parser
- [ ] Create calendar_feeds and events DB tables
- [ ] Build feed fetching and parsing logic
- [ ] Implement recurring event expansion
- [ ] Create background refresh scheduler
- [ ] Build events query API endpoint
- [ ] Add error handling and feed health tracking

## Files Modified

- (to be filled during implementation)

## Comments

### 2026-03-07 - orchestrator
Depends on TASK-001 (project scaffolding). This is primarily a backend-agent task but data-agent should handle the schema. Can be worked on in parallel with TASK-002 once scaffolding is done.
