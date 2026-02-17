# Architecture

Laputa is a personal knowledge and life management desktop app. It reads a vault of markdown files with YAML frontmatter and presents them in a four-panel UI inspired by Bear Notes.

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Desktop shell | Tauri v2 | 2.10.0 |
| Frontend | React + TypeScript | React 19, TS 5.9 |
| Editor | BlockNote | 0.46.2 |
| Styling | Tailwind CSS v4 + CSS variables | 4.1.18 |
| UI primitives | Radix UI + shadcn/ui | - |
| Icons | Phosphor Icons + Lucide | - |
| Build | Vite | 7.3.1 |
| Backend language | Rust (edition 2021) | 1.77.2 |
| Frontmatter parsing | gray_matter | 0.2 |
| Tests | Vitest (unit), Playwright (E2E), cargo test (Rust) | - |
| Package manager | pnpm | - |

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Tauri v2 Window                        │
│                                                             │
│  ┌─────────────────── React Frontend ───────────────────┐   │
│  │                                                      │   │
│  │  App.tsx (orchestrator)                               │   │
│  │    ├── Sidebar         (navigation + filters)        │   │
│  │    ├── NoteList         (filtered note list)          │   │
│  │    ├── Editor           (BlockNote + tabs + diff)     │   │
│  │    │     └── Inspector  (metadata + relationships)    │   │
│  │    ├── StatusBar        (footer info)                 │   │
│  │    └── Modals (QuickOpen, CreateNote, CommitDialog)  │   │
│  │                                                      │   │
│  └──────────────┬───────────────────────────────────────┘   │
│                 │ Tauri IPC (invoke)                         │
│  ┌──────────────▼───────────────────────────────────────┐   │
│  │                  Rust Backend                         │   │
│  │    lib.rs      → 9 Tauri commands                     │   │
│  │    vault.rs    → file scanning, frontmatter parsing   │   │
│  │    frontmatter.rs → YAML manipulation                 │   │
│  │    git.rs      → git log, diff, commit, push          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Four-Panel Layout

```
┌────────┬─────────────┬─────────────────────────┬────────────┐
│Sidebar │ Note List   │ Editor                  │ Inspector  │
│(250px) │ (300px)     │ (flex-1)                │ (280px)    │
│        │             │                         │            │
│ All    │ [Search]    │ [Tab Bar]               │ Properties │
│ Favs   │ [Type Pill] │ [Breadcrumb Bar]        │ Relations  │
│        │             │                         │ Backlinks  │
│Projects│ Note 1      │ # My Note               │ Git History│
│Experim.│ Note 2      │                         │            │
│Respons.│ Note 3      │ Content here...         │            │
│Procedu.│ ...         │                         │            │
│People  │             │                         │            │
│Events  │             │                         │            │
│Topics  │             │                         │            │
├────────┴─────────────┴─────────────────────────┴────────────┤
│ StatusBar: v0.4.2 │ main │ Synced 2m ago        1,247 notes│
└─────────────────────────────────────────────────────────────┘
```

- **Sidebar** (150-400px, resizable): Top-level filters (All Notes, Favorites) and collapsible section groups (Projects, Experiments, Responsibilities, etc.)
- **Note List** (200-500px, resizable): Filtered list of notes matching the sidebar selection. Shows snippets, modified dates, and relationship groups.
- **Editor** (flex, fills remaining space): Tab bar, breadcrumb bar with word count and modified indicator, BlockNote editor with wikilink support. Can toggle to diff view for modified files.
- **Inspector** (200-500px or 40px collapsed): Frontmatter properties (editable), relationships, backlinks, git history. Collapses to a thin icon strip.

Panels are separated by `ResizeHandle` components that support drag-to-resize.

## Data Flow

### Startup Sequence

```
1. App mounts
2. useVaultLoader fires:
   a. isTauri() ? invoke('list_vault') : mockInvoke('list_vault')
      → VaultEntry[] stored in state
   b. Load all content (mock mode) or on-demand (Tauri mode)
   c. invoke('get_modified_files') → ModifiedFile[] stored in state
3. User clicks note in NoteList
4. useNoteActions.handleSelectNote:
   a. invoke('get_note_content') → raw markdown string
   b. Add tab { entry, content } to tabs state
   c. Set activeTabPath
5. Editor renders BlockNoteTab:
   a. splitFrontmatter(content) → [yaml, body]
   b. preProcessWikilinks(body) → replaces [[target]] with tokens
   c. editor.tryParseMarkdownToBlocks(preprocessed)
   d. injectWikilinks(blocks) → replaces tokens with wikilink nodes
   e. editor.replaceBlocks()
6. Inspector renders frontmatter parsed from content
```

### Frontmatter Edit Flow

```
User edits property in Inspector
  → handleUpdateFrontmatter(path, key, value)
    → Tauri: invoke('update_frontmatter') → Rust reads file, modifies YAML, writes back
    → Mock: updateMockFrontmatter() → client-side YAML manipulation
  → Update tab content in state
  → Update allContent for backlink recalculation
  → Toast: "Property updated"
```

### Git Flow

```
User clicks Commit button → CommitDialog opens
  → handleCommitPush(message)
    → invoke('git_commit') → git add -A && git commit -m "..."
    → invoke('git_push') → git push
    → Reload modified files
    → Toast: "Committed and pushed"
```

## Tauri IPC Commands

All commands are defined in `src-tauri/src/lib.rs` and registered via `tauri::generate_handler![]`.

| Command | Params | Returns | Backend function |
|---------|--------|---------|-----------------|
| `list_vault` | `path` | `Vec<VaultEntry>` | `vault::scan_vault()` |
| `get_note_content` | `path` | `String` | `vault::get_note_content()` |
| `update_frontmatter` | `path, key, value` | `String` (updated content) | `frontmatter::with_frontmatter()` |
| `delete_frontmatter_property` | `path, key` | `String` (updated content) | `frontmatter::with_frontmatter()` |
| `get_file_history` | `vault_path, path` | `Vec<GitCommit>` | `git::get_file_history()` |
| `get_modified_files` | `vault_path` | `Vec<ModifiedFile>` | `git::get_modified_files()` |
| `get_file_diff` | `vault_path, path` | `String` (unified diff) | `git::get_file_diff()` |
| `git_commit` | `vault_path, message` | `String` | `git::git_commit()` |
| `git_push` | `vault_path` | `String` | `git::git_push()` |

All commands return `Result<T, String>`. Errors are serialized as JSON error objects to the frontend.

## Mock Layer

When running outside Tauri (browser at `localhost:5173`), `src/mock-tauri.ts` provides a transparent mock layer:

```typescript
// In hooks, the pattern is always:
if (isTauri()) {
  result = await invoke<T>('command_name', { args })
} else {
  result = await mockInvoke<T>('command_name', { args })
}
```

The mock layer includes:
- **12 sample entries** across all entity types (Project, Responsibility, Procedure, Experiment, Note, Person, Event, Topic)
- **Full markdown content** with realistic frontmatter for each entry
- **Mock git history, modified files, and diff output**
- `addMockEntry()` and `updateMockContent()` for runtime updates

This means the entire UI can be developed and tested in Chrome without the Rust backend.

## State Management

No Redux or global context. State lives in the root `App.tsx` and two custom hooks:

| State owner | State | Purpose |
|-------------|-------|---------|
| `App.tsx` | `selection`, panel widths, dialog visibility, toast | UI state |
| `useVaultLoader` | `entries`, `allContent`, `modifiedFiles` | Vault data |
| `useNoteActions` | `tabs`, `activeTabPath` | Open tabs and note operations |

Data flows unidirectionally: `App` passes data and callbacks as props to child components. No child-to-child communication — everything goes through `App`.

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Cmd+P | Open Quick Open palette |
| Cmd+N | Open Create Note dialog |
| Cmd+S | Show "Saved" toast |
| Cmd+W | Close active tab |
| `[[` in editor | Open wikilink suggestion menu |
