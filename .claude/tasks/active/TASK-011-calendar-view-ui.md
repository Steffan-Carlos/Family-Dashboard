# TASK-011: Calendar view + event creation UI

| Field       | Value                |
|-------------|----------------------|
| Status      | backlog              |
| Priority    | medium               |
| Project     | calendar             |
| Parent      | TASK-003             |
| Assignee    | frontend-agent       |
| Created     | 2026-03-07           |
| Updated     | 2026-03-07           |

## Description

Build the main calendar view with month/week/day modes, event display cards, and an event creation/edit modal. The modal includes a calendar picker so users can choose which calendar a new event goes on. Also includes a sync indicator in the app header.

## Acceptance Criteria

- [ ] Month view: calendar grid with color-coded event dots per day
- [ ] Week view: time-based layout with event blocks
- [ ] Day view: detailed time-based layout with full event cards
- [ ] View toggle (month/week/day) with smooth transitions
- [ ] Event cards: tappable (64px targets), show title + time + calendar color
- [ ] Event create modal: title, date/time, location, description, all-day toggle
- [ ] Calendar picker in modal: dropdown grouped by account with color indicators
- [ ] Event edit: tap existing event to edit, changes sync back to provider
- [ ] Sync indicator in header: shows last sync time, tap to manual refresh
- [ ] Haptic feedback on event creation/completion
- [ ] All touch targets 64px, design system fonts and colors

## Subtasks

(none - single deliverable)

## Files Modified

- `src/components/calendar/CalendarView.tsx` + `.module.scss`
- `src/components/calendar/CalendarDayCell.tsx` + `.module.scss`
- `src/components/calendar/EventCard.tsx` + `.module.scss`
- `src/components/calendar/EventModal.tsx` + `.module.scss`
- `src/components/calendar/CalendarPicker.tsx` + `.module.scss`
- `src/components/calendar/SyncIndicator.tsx` + `.module.scss`

## Comments

### 2026-03-07 - orchestrator
Depends on TASK-009 (API routes). Can be built in parallel with TASK-010 (settings). The calendar view is the main user-facing feature — prioritize month view as default, then week and day. Color-code events by their calendar's color. Design for 1920x1200 tablet.
