# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A glassmorphic todo list desktop application built with Electron + React + TypeScript + Vite. Supports cloud sync via GitHub Gist with AES-256-GCM encryption.

## Build Commands

```bash
npm run dev           # Start Vite dev server
npm run electron:dev  # Dev mode with Electron
npm run build         # Build Vite + electron-builder
npm run build:win     # Build Windows version
npm run preview       # Preview production build
npm run typecheck     # TypeScript type check
```

## Architecture

### Process Model
- **Main Process** (`electron/`): Window management, system tray, global shortcuts, IPC handlers
- **Renderer Process** (`src/`): React UI, Zustand state, business logic

### State Management (`src/store/index.ts`)
Zustand store manages: todos, lists, tags, filters, sync status, settings. All persisted locally via electron-store.

### Cloud Sync (`src/utils/github.ts`)
- Uses Octokit to interact with GitHub Gist API
- `syncToGist()`: Encrypts data with AES-256-GCM and uploads
- `syncFromGist()`: Downloads and decrypts Gist content
- `detectConflict()`: Compares `updatedAt` timestamps (exists but not currently used in merge logic)
- **Known issue**: `syncFromGist` blindly overwrites local data with remote — no merge/conflict resolution

### Key Files
- `electron/main.ts`: App lifecycle, window creation, tray, shortcuts, IPC
- `electron/preload.ts`: contextBridge API exposure
- `src/store/index.ts`: Zustand store definition
- `src/utils/github.ts`: GitHub Gist sync logic
- `src/utils/crypto.ts`: AES-256-GCM encryption/decryption
- `src/components/`: All React UI components

## Data Models

```typescript
Todo: { id, title, completed, priority (1/2/3), tags[], listId, createdAt, updatedAt, deletedAt }
TodoList: { id, name, type (task/book/movie/custom), icon, color }
Tag: { id, name, color }
```

## Sync Flow
1. Auto-sync runs on configurable interval (15min/30min/1h/2h/6h)
2. `syncFromGist()` fetches remote data → decrypts → replaces local state
3. `syncToGist()` serializes local state → encrypts → uploads to Gist
4. Manual sync available in settings modal