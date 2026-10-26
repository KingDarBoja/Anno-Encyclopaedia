# Commit Message Formatting Reference

## Workflow

1. Inspect the repository state with `git status --porcelain`.
2. Review the exact line changes with `git diff --staged`. If no files are
   staged, review `git diff` instead.
3. If changes contain unrelated features or refactors, segment them or
   suggest staging them selectively with `git add -p`.
4. Ensure no credentials, secrets, or keys are being added to the commit.
5. Identify the primary intention and select the appropriate Gitmoji.
6. Generate the finalized commit message using the formatting rules below.

## Formatting Rules

- Format: `<intention> <type>(<optional-scope>): <short description>`
- Use a raw Unicode Gitmoji for the intention.
- Use a lowercase Conventional Commit type and optional lowercase scope.
- Keep the subject to 50 characters or fewer.
- Use an imperative, lowercase description with no ending punctuation.
- For complex changes, add an optional body after a blank line. Explain
  what changed and why, and wrap body lines at 72 characters.

## Gitmoji and Commit Types

| Gitmoji | Conventional type | Primary intention |
| :--- | :--- | :--- |
| ✨ | `feat` | Introduce new features |
| 🐛 | `fix` | Fix a bug |
| ♻️ | `refactor` | Refactor without changing behavior |
| 📝 | `docs` | Add or update documentation |
| 🎨 | `style` | Improve structure or formatting |
| ⚡️ | `perf` | Improve performance |
| ✅ | `test` | Add, update, or pass tests |
| 🔧 | `chore` | Add or update configuration files |
| ➖ | `chore` | Remove a dependency |
| ➕ | `chore` | Add a dependency |
| ⬆️ | `chore` | Upgrade dependencies |
| ⬇️ | `chore` | Downgrade dependencies |
| 🔥 | `chore` | Delete code or files |
| 🏗️ | `refactor` | Make architectural changes |
| 🚚 | `chore` | Move or rename resources |
| 🔒 | `fix` | Fix security or privacy issues |
| 🏷️ | `chore` | Add or update types |

## Examples

```text
✨ feat(auth): add token rotation
```

```text
🐛 fix(database): resolve connection pool leak

Increase the maximum pool size to accommodate traffic spikes and avoid
timeout exceptions.
```
