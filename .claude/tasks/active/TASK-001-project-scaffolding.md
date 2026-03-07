# TASK-001: Set up project scaffolding

| Field       | Value                |
|-------------|----------------------|
| Status      | done                 |
| Priority    | high                 |
| Project     | project-scaffold     |
| Parent      | none                 |
| Assignee    | any                  |
| Created     | 2026-03-07           |
| Updated     | 2026-03-07           |

## Description

Initialize the Family Dashboard project with all foundational files and directory structure. This includes package.json, the React + SCSS frontend scaffold via Vite, Express backend entry point, TypeORM + SQLite database setup, and development tooling.

The goal is a working "hello world" state where `npm run dev` starts both frontend and backend, and the app renders a basic shell on the tablet-sized viewport.

## Acceptance Criteria

- [x] `package.json` exists with correct dependencies (React, SCSS, Express, TypeORM, better-sqlite3)
- [x] `/src/components/` directory exists with a root `App.tsx`
- [x] `/src/styles/` directory exists with SCSS variables, mixins, and global styles matching design system
- [x] `/src/api/` directory exists with a basic Express server (`server.ts`)
- [x] `/src/db/` directory exists with TypeORM data source and entity base setup
- [x] `npm run dev` starts the app without errors (concurrent frontend + backend)
- [x] Basic HTML shell renders at tablet resolution (1920x1200)

## Subtasks

- [x] Create package.json with all dependencies
- [x] Set up React with Vite + TypeScript
- [x] Configure SCSS with design system color palette, typography, and mixins
- [x] Create Express server entry point with TypeORM initialization
- [x] Set up concurrent dev scripts (frontend + backend)
- [x] Create root App component with basic tablet shell

## Files Modified

- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript config for frontend
- `tsconfig.node.json` - TypeScript config for backend
- `vite.config.ts` - Vite config with SCSS, alias, proxy
- `index.html` - HTML shell with tablet viewport, Google Fonts
- `.gitignore` - Standard ignores
- `src/main.tsx` - React entry point
- `src/vite-env.d.ts` - Vite/SCSS module type declarations
- `src/components/App.tsx` - Root app shell component
- `src/components/App.module.scss` - App shell styles
- `src/styles/_variables.scss` - Design system variables
- `src/styles/_mixins.scss` - Reusable SCSS mixins
- `src/styles/global.scss` - Global reset and base styles
- `src/api/server.ts` - Express server with TypeORM init
- `src/db/data-source.ts` - TypeORM data source configuration

## Comments

### 2026-03-07 - orchestrator
Initial task created during task management system setup. This is the first task that should be picked up - everything else depends on the project being scaffolded.

### 2026-03-07 - orchestrator
Updated acceptance criteria for new stack: SCSS instead of Tailwind, TypeORM Active Record instead of raw SQL. Starting implementation.

### 2026-03-07 - orchestrator
Scaffolding complete. Verified: `vite build` succeeds, backend starts and connects to SQLite, `npm run dev` runs both concurrently. Frontend renders "Family Dashboard" shell with design system colors and fonts.
