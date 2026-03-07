# TASK-001: Set up project scaffolding

| Field       | Value                |
|-------------|----------------------|
| Status      | backlog              |
| Priority    | high                 |
| Project     | project-scaffold     |
| Parent      | none                 |
| Assignee    | any                  |
| Created     | 2026-03-07           |
| Updated     | 2026-03-07           |

## Description

Initialize the Family Dashboard project with all foundational files and directory structure. This includes package.json, the React frontend scaffold, Express backend entry point, SQLite database setup, and development tooling (Tailwind, build scripts, dev server).

The goal is a working "hello world" state where `npm run dev` starts both frontend and backend, and the app renders a blank page on the tablet-sized viewport.

## Acceptance Criteria

- [ ] `package.json` exists with correct dependencies (React, Tailwind, Express, better-sqlite3)
- [ ] `/src/components/` directory exists with a root `App.jsx`
- [ ] `/src/api/` directory exists with a basic Express server (`server.js`)
- [ ] `/src/db/` directory exists with SQLite initialization script
- [ ] Tailwind CSS configured with the project's design system colors
- [ ] `npm run dev` starts the app without errors
- [ ] Basic HTML shell renders at tablet resolution (1920x1200)

## Subtasks

- [ ] Create package.json with all dependencies
- [ ] Set up React with Vite or similar bundler
- [ ] Configure Tailwind with custom color palette from CLAUDE.MD
- [ ] Create Express server entry point
- [ ] Create SQLite database initialization
- [ ] Set up dev scripts (concurrent frontend + backend)

## Files Modified

- (to be filled during implementation)

## Comments

### 2026-03-07 - orchestrator
Initial task created during task management system setup. This is the first task that should be picked up - everything else depends on the project being scaffolded.
