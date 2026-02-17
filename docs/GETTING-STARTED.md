# Getting Started

How to navigate the codebase, run the app, and find what you need.

## Prerequisites

- **Node.js** 18+ and **pnpm**
- **Rust** 1.77.2+ (for the Tauri backend)
- **git** CLI (required by the git integration features)

## Quick Start

```bash
# Install dependencies
pnpm install

# Run in browser (no Rust needed — uses mock data)
pnpm dev
# Open http://localhost:5173

# Run with Tauri (full app, requires Rust)
pnpm tauri dev

# Run tests
pnpm test          # Vitest unit tests
cargo test         # Rust tests (from src-tauri/)
pnpm test:e2e      # Playwright E2E tests
```

## Directory Structure

```
laputa-app/
├── src/                          # React frontend
│   ├── main.tsx                  # Entry point (renders <App />)
│   ├── App.tsx                   # Root component — orchestrates 4-panel layout
│   ├── App.css                   # App shell layout styles
│   ├── types.ts                  # Shared TS types (VaultEntry, GitCommit, etc.)
│   ├── mock-tauri.ts             # Mock Tauri layer for browser testing
│   ├── theme.json                # Editor theme configuration
│   ├── index.css                 # Global CSS variables + Tailwind setup
│   │
│   ├── components/               # UI components
│   │   ├── Sidebar.tsx           # Left panel: filters + section groups
│   │   ├── NoteList.tsx          # Second panel: filtered note list
│   │   ├── Editor.tsx            # Third panel: tabs + BlockNote + diff
│   │   ├── Inspector.tsx         # Fourth panel: metadata + relationships
│   │   ├── DynamicPropertiesPanel.tsx  # Editable frontmatter properties
│   │   ├── EditableValue.tsx     # Inline value editor component
│   │   ├── DiffView.tsx          # Git diff viewer
│   │   ├── ResizeHandle.tsx      # Draggable panel divider
│   │   ├── StatusBar.tsx         # Bottom status bar
│   │   ├── QuickOpenPalette.tsx  # Cmd+P command palette
│   │   ├── CreateNoteDialog.tsx  # New note modal
│   │   ├── CommitDialog.tsx      # Git commit modal
│   │   ├── Toast.tsx             # Toast notifications
│   │   ├── Editor.css            # Editor layout styles
│   │   ├── EditorTheme.css       # BlockNote theme overrides
│   │   └── ui/                   # shadcn/ui primitives (button, dialog, etc.)
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useVaultLoader.ts     # Loads vault entries, git status, content
│   │   ├── useNoteActions.ts     # Tab management, frontmatter CRUD, navigation
│   │   └── useTheme.ts           # Flattens theme.json into CSS variables
│   │
│   ├── utils/                    # Pure utility functions
│   │   ├── frontmatter.ts        # TypeScript YAML frontmatter parser
│   │   └── wikilinks.ts          # Wikilink preprocessing + word count
│   │
│   ├── lib/
│   │   └── utils.ts              # Tailwind merge + cn() helper
│   │
│   └── test/
│       └── setup.ts              # Vitest test environment setup
│
├── src-tauri/                    # Rust backend
│   ├── Cargo.toml                # Rust dependencies
│   ├── build.rs                  # Tauri build script
│   ├── tauri.conf.json           # Tauri app configuration
│   ├── capabilities/             # Tauri v2 security capabilities
│   │   └── default.json
│   ├── src/
│   │   ├── main.rs               # Entry point (calls lib::run())
│   │   ├── lib.rs                # Tauri command registration (9 commands)
│   │   ├── vault.rs              # Vault scanning + markdown parsing
│   │   ├── frontmatter.rs        # YAML frontmatter manipulation
│   │   └── git.rs                # Git CLI operations
│   └── icons/                    # App icons
│
├── e2e/                          # Playwright E2E tests
│   ├── app.spec.ts               # App loading tests
│   ├── core-flows.spec.ts        # Main user workflows
│   ├── keyboard-shortcuts.spec.ts
│   ├── quick-open.spec.ts
│   ├── screenshot.spec.ts        # Visual regression screenshots
│   └── ...
│
├── package.json                  # Frontend dependencies + scripts
├── vite.config.ts                # Vite bundler config
├── tsconfig.json                 # TypeScript config
├── playwright.config.ts          # E2E test config
├── CLAUDE.md                     # Project instructions for Claude
└── docs/                         # This documentation
```

## Key Files to Know

### Start here

| File | Why it matters |
|------|---------------|
| `src/App.tsx` | The root component. Shows how the 4-panel layout is assembled and how state flows between components. |
| `src/types.ts` | All shared TypeScript types. Read this first to understand the data model. |
| `src-tauri/src/lib.rs` | All 9 Tauri commands in one place. This is the frontend-backend API surface. |

### Data layer

| File | Why it matters |
|------|---------------|
| `src/hooks/useVaultLoader.ts` | How vault data is loaded and managed. The Tauri/mock branching pattern. |
| `src/hooks/useNoteActions.ts` | Tab management, wikilink navigation, frontmatter CRUD. The biggest hook. |
| `src/mock-tauri.ts` | Mock data for browser testing. Shows the shape of all Tauri responses. |

### Backend

| File | Why it matters |
|------|---------------|
| `src-tauri/src/vault.rs` | Vault scanning, frontmatter parsing, entity type inference. The core backend logic. |
| `src-tauri/src/frontmatter.rs` | YAML manipulation — how properties are updated/deleted in files. |
| `src-tauri/src/git.rs` | All git operations. Shells out to git CLI. |

### Editor

| File | Why it matters |
|------|---------------|
| `src/components/Editor.tsx` | BlockNote setup, custom wikilink schema, tab bar, breadcrumb bar, diff toggle. |
| `src/utils/wikilinks.ts` | The wikilink preprocessing pipeline (markdown → BlockNote blocks with wikilinks). |
| `src/components/EditorTheme.css` | BlockNote CSS overrides for typography and styling. |

### Styling

| File | Why it matters |
|------|---------------|
| `src/index.css` | All CSS custom properties (colors, spacing). The design token source of truth. |
| `src/theme.json` | Editor-specific theme (fonts, headings, lists, code blocks). |
| `src/hooks/useTheme.ts` | Converts theme.json into CSS variables for the editor. |

## Architecture Patterns

### Tauri/Mock Branching

Every data-fetching operation checks `isTauri()` and branches:

```typescript
if (isTauri()) {
  result = await invoke<T>('command', { args })
} else {
  result = await mockInvoke<T>('command', { args })
}
```

This lives in `useVaultLoader.ts` and `useNoteActions.ts`. Components never call Tauri directly.

### Props-Down, Callbacks-Up

No global state management (no Redux, no Context). `App.tsx` owns the state and passes it down as props. Child-to-parent communication uses callback props (`onSelectNote`, `onCloseTab`, etc.).

### Discriminated Unions for Selection State

```typescript
type SidebarSelection =
  | { kind: 'filter'; filter: 'all' | 'favorites' }
  | { kind: 'sectionGroup'; type: string }
  | { kind: 'entity'; entry: VaultEntry }
  | { kind: 'topic'; entry: VaultEntry }
```

This pattern makes it easy to handle all selection states exhaustively.

## Running Tests

```bash
# Unit tests (fast, no browser)
pnpm test

# Rust tests
cd src-tauri && cargo test

# E2E tests (requires dev server)
pnpm test:e2e

# Single Playwright test
npx playwright test e2e/screenshot.spec.ts

# Visual verification screenshots
npx playwright test e2e/screenshot.spec.ts
# Screenshots saved to test-results/
```

## Common Tasks

### Add a new Tauri command

1. Write the Rust function in `vault.rs`, `git.rs`, or a new module
2. Add `#[tauri::command]` wrapper in `lib.rs`
3. Register it in the `generate_handler![]` macro in `lib.rs`
4. Call it from the frontend via `invoke()` in the appropriate hook
5. Add a mock handler in `mock-tauri.ts`

### Add a new component

1. Create `src/components/MyComponent.tsx`
2. If it needs vault data, receive it as props from the parent
3. Wire it into `App.tsx` or the relevant parent component
4. Add a test file `src/components/MyComponent.test.tsx`

### Add a new entity type

1. Create the folder in the vault (e.g., `~/Laputa/mytype/`)
2. Add the folder → type mapping in `vault.rs:parse_md_file()` (the `match` on folder names)
3. The sidebar section groups are defined as `SECTION_GROUPS` in `Sidebar.tsx` — add it there
4. Update `CreateNoteDialog.tsx` type options if users should be able to create it
