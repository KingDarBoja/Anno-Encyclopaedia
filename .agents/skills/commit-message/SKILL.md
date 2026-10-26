---
name: commit-message
description: "Use when generating Git commit messages, pull request descriptions, or change summaries. Follow this repository's Gitmoji and Conventional Commits guidance."
---

# Commit and Change Summary Guidelines

Before drafting a message or summary, inspect the repository state with
`git status --porcelain` and review the exact changes with `git diff --staged`.
If nothing is staged, review `git diff` instead. Follow the
[commit formatting reference](./references/commit-skills.md).

For commit messages:

- Use `<intention> <type>(<optional-scope>): <description>`, with a raw
  Unicode Gitmoji, a lowercase Conventional Commit type, and an optional
  lowercase scope.
- Keep the entire subject to 50 characters or fewer. Use an imperative,
  lowercase description with no ending punctuation.
- If context is needed, add an optional body after a blank line. Explain
  what changed and why, and wrap body lines at 72 characters.
- Do not include credentials, secrets, or keys in a proposed commit.
- If changes are unrelated, describe them separately or suggest selective
  staging rather than combining them into one commit.

For pull request descriptions and change summaries, base the content on the
reviewed diff, call out unrelated changes separately, and do not present
unverified claims as facts.
