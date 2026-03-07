# TASK-007: Microsoft Calendar provider

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

Implement MicrosoftCalendarProvider using @azure/msal-node for OAuth2 and @microsoft/microsoft-graph-client for API calls. Handles OAuth2 with MSAL, lists calendars, performs incremental sync via Microsoft Graph's deltaLink, and supports full CRUD on events.

## Acceptance Criteria

- [ ] MSAL OAuth2 flow: generate auth URL, exchange code for tokens
- [ ] Token refresh via MSAL cache
- [ ] List all calendars for an account
- [ ] Incremental event sync using Graph API's deltaLink
- [ ] Create, update, delete events on a specific calendar
- [ ] Proper error handling for API failures, consent issues, invalid tokens

## Subtasks

(none - single deliverable)

## Files Modified

- `src/logic/calendar/microsoft-provider.ts`

## Comments

### 2026-03-07 - orchestrator
Depends on TASK-004 (entities) and TASK-005 (interfaces). Can be built in parallel with TASK-006 (Google provider). Uses @azure/msal-node + @microsoft/microsoft-graph-client. Scopes: Calendars.ReadWrite, offline_access.
