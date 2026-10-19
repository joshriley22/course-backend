#!/usr/bin/env bash
# Make sure claude and gh are found even when launched from a minimal shell.
export PATH="$HOME/.local/bin:/c/Program Files/GitHub CLI:$PATH"

REPO="joshriley22/course-backend"
REPO_DIR="$HOME/PycharmProjects/course_backend"

read -r -p "Issue number (Enter to skip): " ISSUE
[[ -z "$ISSUE" ]] && exit 0

ISSUE_TEXT=$(gh issue view "$ISSUE" --repo "$REPO" --json title,body,labels,comments \
  --template '{{.title}}{{"\n\n"}}{{.body}}{{"\n\n"}}{{range .comments}}{{.body}}{{"\n"}}{{end}}')

VERDICT=$(claude -p --tools "" --model sonnet "You are triaging a GitHub issue for a FastAPI + React project.
Decide where it should be fixed:
- cloud: the issue is clear and self-contained, and the fix can be written and checked from the code alone.
Tend to choose local when considering frontend changes.
- local: it needs the local database, .env, secrets or is too vague and requires input.
Reply with exactly one line: 'cloud: <reason>' or 'local: <reason>'.

Issue #$ISSUE:
$ISSUE_TEXT")

ROUTE=$(echo "$VERDICT" | head -n1 | cut -d: -f1 | tr -d '[:space:]' | tr '[:upper:]' '[:lower:]')
echo
echo "$ISSUE_TEXT"
echo "Triage: $VERDICT"



case "$ROUTE" in
  cloud)
    read -r -p "Send #$ISSUE to the cloud? [y/N] " OK
    [[ "$OK" =~ ^[Yy]$ ]] && claude --cloud "Fix GitHub issue #$ISSUE in $REPO. Read it with gh issue view, implement the fix, run the tests, and open a PR."
    ;;
  local)
    read -r -p "Start a local session for #$ISSUE? [y/N] " OK
    if [[ "$OK" =~ ^[Yy]$ ]]; then
      cd "$REPO_DIR" || exit 1
      git switch -c "fix/issue-$ISSUE"
      claude -n "issue-$ISSUE" "Investigate GitHub issue #$ISSUE in $REPO (gh issue view $ISSUE --repo $REPO). Reproduce it and explain the cause and plan before changing files."
    fi
    ;;
  *)
    echo "Couldn't parse verdict: $VERDICT."
    ;;
esac