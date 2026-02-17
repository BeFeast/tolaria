# Git Hooks

## Pre-Commit Hook: CodeScene Check

Il repository ha un pre-commit hook che verifica la qualità del codice prima di ogni commit.

## Post-Commit Hook: Auto-Implement Design Changes

Quando committi modifiche a `ui-design.pen`, il post-commit hook:
1. Analizza automaticamente le modifiche (colori, typography, spacing, layout)
2. Spawna Claude Code in background per implementare le modifiche
3. Ti notifica quando l'implementazione è completa

---

## Pre-Commit Hook Details

### Cosa Fa

1. **Analizza file staged** — controlla solo TypeScript/Rust modificati
2. **Confronta con base branch** — `origin/main` per branch, `HEAD~1` per main
3. **Avvisa per file grandi** — >500 linee modificate
4. **Suggerisce review** — con Claude Code + CodeScene MCP per analisi dettagliata

### Bypass Hook

Se sai cosa stai facendo:

```bash
# Skip hook per questo commit
git commit --no-verify -m "your message"

# O includi nel commit message
git commit -m "your message [skip codescene]"
```

### Installazione (già fatto per questa repo)

L'hook è già installato in `.git/hooks/pre-commit`.

Se cloni la repo altrove, copia l'hook:
```bash
cp .github/hooks/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

### Esempio Output

#### ✅ Commit Normale
```
🔍 Running CodeScene Code Health check...
   Comparing against: origin/main
   Analyzing code changes...
✅ CodeScene check passed
   +42 -18 lines

   💡 For detailed code health analysis, run:
      claude 'Check code health of this commit with CodeScene MCP'
```

#### ⚠️ File Grandi
```
🔍 Running CodeScene Code Health check...
   Comparing against: origin/main
   Analyzing code changes...
⚠️  Large file changes detected (>500 lines):
   - src/components/Editor.tsx
   - src-tauri/src/vault.rs

   Consider:
   - Breaking into smaller commits
   - Reviewing with Claude Code + CodeScene MCP
   - Running: claude 'Review code health of staged changes'

   Continue anyway? (y/N) 
```

### CodeScene MCP Integration

Per analisi dettagliata del code health, usa Claude Code:

```bash
# Analizza staged changes
claude 'Check code health of staged changes with CodeScene MCP'

# Analizza file specifico
claude 'What is the code health score of src/components/Editor.tsx?'

# Pre-commit safeguard
claude 'Run pre_commit_code_health_safeguard on staged changes'
```

### Troubleshooting

**Hook non si attiva:**
- Verifica che `.git/hooks/pre-commit` esista ed sia eseguibile
- `ls -la .git/hooks/pre-commit` — dovrebbe mostrare `-rwxr-xr-x`

**Vuoi disabilitare temporaneamente:**
```bash
mv .git/hooks/pre-commit .git/hooks/pre-commit.disabled
```

**Vuoi riabilitare:**
```bash
mv .git/hooks/pre-commit.disabled .git/hooks/pre-commit
```

### Future Improvements

Possibili miglioramenti:
- [ ] Integrazione diretta API CodeScene per score numerico
- [ ] Fail automatico se code health < soglia
- [ ] Cache dei risultati per evitare re-analisi
- [ ] Hook pre-push più pesante per analisi completa

---

## Post-Commit Hook: Auto-Implement Design Changes

### Cosa Fa

Quando committi modifiche a `ui-design.pen`, il hook:

1. **Analizza il diff** — usa `scripts/design-diff-analyzer.js`
2. **Identifica modifiche significative:**
   - 🎨 Colori (fill, backgroundColor)
   - 📝 Typography (fontSize, fontFamily)
   - 📏 Spacing (padding, margin, gap)
   - 🔲 Layout (nuovi componenti, riorganizzazioni)
3. **Spawna Claude Code** — in background via `openclaw sessions spawn`
4. **Auto-notifica** — quando l'implementazione è completa

### Cosa Implementa

| Tipo Modifica | Azione |
|--------------|--------|
| Colori | Aggiorna `src/theme.json` o CSS variables |
| Typography | Aggiorna `src/theme.json` typography |
| Spacing | Aggiorna `src/theme.json` spacing |
| Layout | Modifica/crea componenti React |
| Testi mockup | Nessuna azione (solo design) |

### Esempio Output

```
🎨 Design file changed - analyzing...

📋 Implementation tasks:

1. [HIGH] Update color palette
  - fill: $--muted-foreground → #666666
  - backgroundColor: #FFFFFF → #F5F5F5

Update src/theme.json or CSS variables to match the design.

2. [MEDIUM] Update typography
  - fontSize: 14px → 16px

Update src/theme.json typography settings.

🚀 Spawning Claude Code to implement changes...

✅ Claude Code spawned - you'll be notified when implementation is complete
```

### Workflow Completo

```
You                    Post-Commit Hook              Claude Code              Brian (AI)
 │                            │                            │                      │
 ├─ Modify ui-design.pen      │                            │                      │
 ├─ git add ui-design.pen     │                            │                      │
 ├─ git commit                 │                            │                      │
 │                            │                            │                      │
 │                            ├─ Analyze diff              │                      │
 │                            ├─ Generate tasks            │                      │
 │                            ├─ Spawn Claude Code ────────>                     │
 │                            │                            │                      │
 │                            │                     ├─ Implement changes         │
 │                            │                     ├─ Test visually             │
 │                            │                     ├─ Run tests                 │
 │                            │                     ├─ Commit                    │
 │                            │                     ├─ openclaw system event ────>
 │                            │                            │                      │
 │                            │                            │              ├─ Notify Telegram
 │ <─────────────────────────────────────────────────────────────────────────────┘
 │  "✅ Design changes implemented and tested"
```

### Design Diff Analyzer

Lo script `scripts/design-diff-analyzer.js` rileva:

- **Color changes** — `"fill": "#OLD" → "#NEW"`
- **Font changes** — `"fontSize": 14 → 16`
- **Spacing** — `"padding": 8 → 12`
- **Content** — testi mockup (no implementation)

Uso:
```bash
# Analizza ultimo commit
node scripts/design-diff-analyzer.js

# Output JSON per automation
node scripts/design-diff-analyzer.js --json
```

### Disabilitare Temporaneamente

Se vuoi committare il design senza auto-implementazione:

```bash
# Disabilita hook
mv .git/hooks/post-commit .git/hooks/post-commit.disabled

# Commit
git commit -m "design: update mockup"

# Riabilita hook
mv .git/hooks/post-commit.disabled .git/hooks/post-commit
```

### Monitorare Claude Code

Mentre Claude Code lavora in background:

```bash
# Lista sub-agent attivi
openclaw sessions list --kinds isolated

# Vedi log di un sub-agent
openclaw sessions history --session-key <key>

# Ferma sub-agent (se necessario)
openclaw subagents kill --target design-auto-implement
```

### Troubleshooting

**Hook non parte:**
- Verifica che `ui-design.pen` sia effettivamente cambiato: `git diff HEAD~1 ui-design.pen`
- Verifica che lo script analyzer esista: `ls -la scripts/design-diff-analyzer.js`

**Nessuna notifica:**
- Claude Code potrebbe essere ancora in esecuzione — controlla `openclaw sessions list`
- Verifica che il prompt includa `openclaw system event` al termine

**Modifiche non implementate:**
- Controlla i log di Claude Code: `openclaw sessions history --session-key <key>`
- Il sub-agent viene auto-eliminato dopo completion (cleanup=delete)

### Limitazioni

- **Modifiche complesse** — layout completamente nuovi potrebbero richiedere intervento manuale
- **Timeout** — 10 minuti max (configurabile in hook)
- **Solo modifiche recenti** — analizza solo HEAD vs HEAD~1
