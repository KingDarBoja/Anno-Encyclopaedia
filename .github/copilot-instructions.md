# GitHub Copilot Instructions

## Skills Directory
- Commit Skill: `skills/commit-skills.md`

## Instructions

1. When asked to generate git commit messages, generate pull request descriptions, or summarize git diffs, strictly load and enforce the rules defined in `skills/commit-skills.md`.
2. Always inspect staged changes (`git diff --staged`) before generating commit messages.
3. Ensure the subject line strictly adheres to the Gitmoji + Conventional Commits specification:
   `<intention> <type>(<optional-scope>): <short description in imperative mood>`
4. Never exceed 50 characters in the commit subject line.