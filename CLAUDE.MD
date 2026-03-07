# Family Dashboard - Project Context

## What We're Building
A self-hosted family calendar and chore tracking app designed to run
on a wall-mounted Android tablet (Fire HD 10). Touchscreen first.
No external subscriptions. Full data ownership.

## Tech Stack
- Frontend: React + SCSS (kiosk mode, touch optimized, haptic feedback)
- Backend: Node.js + Express
- Database: SQLite (file-based, zero-config, no infra overhead)
- ORM: TypeORM (Active Record pattern)
- Calendar: iCal feed parsing (Google/Apple/Outlook compatible)
- Auth: PIN-based per family member, no passwords for kids

## Users
- Parents: full access, manage chores, view all calendars
- Kids: view their own chores, mark complete, view shared calendar

## Design System

### Vibe
Clean and modern with fun accents. Think organized enough for
parents, approachable enough for young kids. Not a toy, not a
corporate dashboard. Somewhere in between.

### Color Palette
- Background: #F8F6F2 (warm off-white, never pure white)
- Surface: #FFFFFF with subtle shadow, not harsh borders
- Primary: #7BB8A4 (muted sage green)
- Secondary: #F0A8A0 (soft coral)
- Accent: #B5A8D5 (muted lavender)
- Warning: #F5C97A (soft amber)
- Text primary: #2E2E2E
- Text secondary: #7A7A7A
- Success: #A8CFA0 (soft mint green)

### Typography
- Font: Inter or Nunito (Nunito preferred for kid-facing elements,
  rounder and friendlier)
- Headings: bold weight, not heavy
- Body: regular weight, generous line height (1.6)
- Kid-facing text: minimum 18px, prefer 22px+

### Touch Targets
- Minimum 48px, prefer 64px on anything kids will tap
- Generous padding, nothing cramped
- Rounded corners everywhere (border-radius: 16px default,
  24px for cards, full pill for buttons)

### Motion
- Subtle transitions only (150-200ms ease-out)
- Chore completion gets a small celebratory animation
  (confetti burst or checkmark bounce, nothing excessive)
- No jarring snaps or instant state changes

### Component Personality
- Chore cards: rounded, pastel background per family member,
  soft drop shadow
- Calendar: clean grid, color coded per person using their
  assigned pastel, no visual noise
- Buttons: pill shaped, muted fill, slightly darker on press
- Icons: rounded style (Lucide or Phosphor icon set)
- Empty states: friendly short message, no walls of text

### Family Member Colors
Each member gets a personal pastel used consistently across
chores, calendar dots, and their PIN tile:
- Assign on first setup, store in DB
- Suggested palette to pull from: sage, coral, lavender,
  amber, sky blue, peach

### What to Avoid
- Pure white backgrounds
- Hard drop shadows or harsh borders
- Anything that looks like a generic SaaS app
- Cluttered layouts, too much on screen at once
- Small tap targets anywhere a kid might interact

## Sub-Agent Routing Rules

### Parallel dispatch (all conditions must be met)
- 3+ unrelated tasks or independent domains
- No shared state between tasks
- Clear file boundaries with no overlap

### Sequential dispatch (any condition triggers)
- Tasks have dependencies (B needs output from A)
- Shared files or state
- Unclear scope

### Domain Parallel Patterns
When implementing features, spawn parallel agents:
- **frontend-agent**: React components, SCSS styling, touch interactions, haptic feedback
- **backend-agent**: API routes, app logic, Express handlers, middleware
- **data-agent**: TypeORM entities (Active Record), migrations, schema

## Task Management

Tasks live in `.claude/tasks/` with a robust lifecycle system designed for long-running multi-agent development.

### Structure
- **Active tasks**: `.claude/tasks/active/TASK-###-description.md`
- **Completed tasks**: `.claude/tasks/completed/` (archived to keep context lean)
- **Ideas**: `.claude/tasks/ideas/` (lightweight proposals for future work)
- **Board**: `.claude/tasks/BOARD.md` (kanban overview grouped by project)
- **Projects**: `.claude/tasks/PROJECTS.md` (feature tags and development phases)
- **Counter**: `.claude/tasks/COUNTER.md` (next available task ID)

### Task Lifecycle
`Idea -> Backlog -> In Progress -> Review -> Done -> Archived`

### Slash Commands
- `/create-task` - Create a new task with full metadata
- `/breakdown-task` - Split a task into domain-specific subtasks
- `/plan-feature` - Plan an entire feature with epic + subtasks
- `/sync-board` - Rebuild BOARD.md from actual task file statuses
- `/archive-done` - Move completed tasks to the completed folder

### Agent Personas
Agent role definitions live in `.claude/agents/`:
- `orchestrator.md` - Plans, coordinates, reviews
- `frontend-agent.md` - React, SCSS, touch UI, haptic feedback
- `backend-agent.md` - Express, API, app logic, middleware
- `data-agent.md` - TypeORM entities (Active Record), migrations

## Coding Standards
- Components go in /src/components
- SCSS stylesheets go in /src/styles (variables, mixins, component modules)
- API routes go in /src/api
- App logic goes in /src/logic
- TypeORM entities go in /src/db/entities
- Migrations go in /src/db/migrations
- No external calendar APIs - parse iCal feeds directly
- All touch targets minimum 48px
- No emojis in code comments

## Opening Instructions
Read this file and `.claude/tasks/BOARD.md` at the start of every session.
Check `.claude/tasks/PROJECTS.md` for current phase priorities.
Before building any UI, apply the Design System consistently.
Every component should feel like it belongs to the same family.
When in doubt, go cleaner and add one fun accent rather than
adding complexity. Work autonomously. Ask only if a decision
would meaningfully change the architecture.
