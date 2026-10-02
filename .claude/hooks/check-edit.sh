#!/bin/sh
# PostToolUse feedback for the one file Claude just edited: Prettier, plus ESLint for
# scripts. Read-only (lint-staged formats at commit, so parallel workers' files are never
# rewritten). Exit 2 sends the findings to Claude; anything unexpected fails open.
set -u
cd "$CLAUDE_PROJECT_DIR" 2>/dev/null || exit 0

file=$(node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{process.stdout.write(JSON.parse(s).tool_input?.file_path??"")}catch{}})' 2>/dev/null) || exit 0
[ -n "$file" ] && [ -f "$file" ] || exit 0
case "$file" in
  "$CLAUDE_PROJECT_DIR"/*) ;;
  *) exit 0 ;;
esac
[ -x node_modules/.bin/prettier ] || exit 0

out=""
case "$file" in
  *.ts | *.tsx | *.mjs | *.css | *.json | *.md | *.yml | *.yaml)
    node_modules/.bin/prettier --check --log-level warn "$file" >/dev/null 2>&1 ||
      out="$out
Prettier: $file is not formatted (bunx prettier --write \"$file\")."
    ;;
  *) exit 0 ;;
esac
case "$file" in
  *.ts | *.tsx | *.mjs)
    if lint=$(node_modules/.bin/eslint --max-warnings 0 --no-warn-ignored "$file" 2>&1); then :; else
      out="$out
$lint"
    fi
    ;;
esac

[ -z "$out" ] && exit 0
printf '%s\n' "$out" >&2
exit 2
