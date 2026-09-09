# Skill: Automated Git Commit Message Generator

## Core Objective

Analyze the changes in a Git repository's working directory or staging area and automatically format a precise, concise commit message following the Gitmoji and Conventional Commits specifications.

## Step-by-Step Workflow

1. Inspect the repository state by executing `git status --porcelain`.
2. View the exact line changes by executing `git diff --staged`. (If no files are staged, fall back to checking `git diff`).
3. If changes contain completely unrelated features or refactors, segment them mentally or suggest staging them selectively using `git add -p`.
4. Ensure absolutely no credentials, secrets, or keys (`.env`, `id_rsa`, `.pem`, etc.) are being added to the commit.
5. Identify the primary intention of the changes and select the appropriate emoji code from the Gitmoji reference list.
6. Generate the finalized commit message following the strict formatting rules below.

## Formatting Rules

- Format: `<intention> <type>(<optional-scope>): <short description in imperative mood>`
  - `intention`: The visual representation of the commit intention, using a Gitmoji shortcode (e.g., `:sparkles:`) or raw Unicode symbol (e.g., `✨`).
  - `type`: The Conventional Commit type classification (lowercase).
  - `scope`: An optional noun enclosed in parentheses providing context on the module, component, or domain modified (e.g., `(auth)`, `(ui)`, `(deps)`).
  - `short description`: A concise summary of the change in lower case.
- Subject Line Limit: Strictly **50 characters or fewer** (including emoji shortcode/unicode, space, type, scope, and description).
- Casing: Use lowercase for the type, scope, and description. Do not capitalize the first letter of the description.
- Punctuation: Do **not** put a period or ending punctuation at the end of the subject line.
- Imperative Mood: Write the description as a command (e.g., "add auth endpoint" instead of "added auth endpoint" or "adds auth endpoint").
- Body (Optional): If the change is complex or requires context, insert a blank line after the subject line and write a clear body explaining *what* changed and *why* (not *how*). Wrap body lines strictly at **72 characters**.

## Gitmoji & Commit Types Reference

| Gitmoji Shortcode | Unicode | Conventional Type | Primary Intention / Usage |
| :--- | :--- | :--- | :--- |
| `:sparkles:` | ✨ | `feat` | Introduce new features |
| `:bug:` | 🐛 | `fix` | Fix a bug |
| `:recycle:` | ♻️ | `refactor` | Refactor code without changing behavior |
| `:memo:` | 📝 | `docs` | Add or update documentation |
| `:art:` | 🎨 | `style` | Improve structure/format of the code |
| `:zap:` | ⚡️ | `perf` | Improve performance |
| `:white_check_mark:` | ✅ | `test` | Add, update, or pass tests |
| `:wrench:` | 🔧 | `chore` | Add or update configuration files |
| `:heavy_minus_sign:` | ➖ | `chore` | Remove a dependency |
| `:heavy_plus_sign:` | ➕ | `chore` | Add a dependency |
| `:arrow_up:` | ⬆️ | `chore` | Upgrade dependencies |
| `:arrow_down:` | ⬇️ | `chore` | Downgrade dependencies |
| `:fire:` | 🔥 | `chore` | Delete code or files |
| `:building_construction:` | 🏗️ | `refactor` | Make architectural changes |
| `:truck:` | 🚚 | `chore` | Move or rename resources (files, paths) |
| `:lock:` | 🔒 | `fix` | Fix security or privacy issues |
| `:label:` | 🏷️ | `chore` | Add or update types (TypeScript, JSDoc) |

## Example Outputs

### Subject Only (Shortcode format)

```text
:sparkles: feat(auth): implement jwt token rotation
```

## With Body (Breaking or Complex Changes)

```text
🐛 fix(database): resolve connection pool leak

Increase the maximum pool size from 10 to 50 to accommodate spikes
in traffic during peak hours. Avoids throwing timeout exceptions.
```
