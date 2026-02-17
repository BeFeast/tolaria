#!/bin/bash
# Install git hooks for laputa-app

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOOKS_DIR="$(git rev-parse --git-dir)/hooks"

echo "Installing git hooks..."

# Copy pre-commit hook
cp "$SCRIPT_DIR/pre-commit" "$HOOKS_DIR/pre-commit"
chmod +x "$HOOKS_DIR/pre-commit"
echo "✅ Installed pre-commit hook"

# Copy post-commit hook
cp "$SCRIPT_DIR/post-commit" "$HOOKS_DIR/post-commit"
chmod +x "$HOOKS_DIR/post-commit"
echo "✅ Installed post-commit hook"

echo ""
echo "Hooks installed:"
echo "  - pre-commit: CodeScene code health check"
echo "  - post-commit: Auto-implement design changes via Claude Code"
echo ""
echo "To bypass pre-commit, use: git commit --no-verify"
echo "Or include [skip codescene] in your commit message"
