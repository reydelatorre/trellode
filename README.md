# trellode

A multi-platform Node.js CLI tool for managing Trello boards, lists, and cards; designed for seamless integration with Claude Code. 

---

## How it works

This repo contains two separate but complementary pieces:

1. **The CLI (`src/`)** — a Node.js tool compiled to `dist/trellode.js` and installed globally as the `trellode` command. It talks directly to the Trello REST API.

2. **The skill files (`skills/trellode/`)** — plain Markdown files that tell Claude Code what the CLI does and when to use it. Claude Code scans `~/.claude/skills/` at startup and loads any skill files it finds there. These files do **not** install themselves — you copy them once as a setup step.

Once both are in place, you can ask Claude Code in natural language ("create a card for the login bug, due Friday") and it will call `trellode` on your behalf.

---

## Prerequisites

- [Node.js](https://nodejs.org/) v16 or later
- A Trello account with an API key and token (see [Authentication](#authentication) below)

---

## Installation

### 1. Install the CLI globally

From the project directory:

```powershell
npm install -g .
```

This compiles the TypeScript source and links the `trellode` command globally. Verify it worked:

```powershell
trellode --help
```

### 2. Register your Trello credentials

Get your **API key** and generate a **token** at `https://trello.com/app-key` (click "Token" on that page to generate one).

```powershell
trellode --set-auth <api-key> <token>
```

Credentials are saved to `%USERPROFILE%\.trellode\config.json`. Verify authentication:

```powershell
trellode --check-auth
```

### 3. Install the Claude Code skill files

This step wires the CLI into Claude Code so it knows the tool exists and how to use it. You copy the Markdown files from this repo into Claude Code's skills directory:

```powershell
New-Item -ItemType Directory -Force "$env:USERPROFILE\.claude\skills\trellode"
Copy-Item "skills\trellode\SKILL.md"     "$env:USERPROFILE\.claude\skills\trellode\"
Copy-Item "skills\trellode\REFERENCE.md" "$env:USERPROFILE\.claude\skills\trellode\"
```

**What these files do:**
- `SKILL.md` — tells Claude Code when to activate (any Trello-related request) and lists every command with its syntax.
- `REFERENCE.md` — full argument documentation and example output shapes that Claude reads when it needs more detail.

Claude Code reads these once at startup. After copying them, restart any open Claude Code sessions for the skill to take effect.

---

## Authentication

| Source | Where to find it |
|--------|-----------------|
| API Key | `https://trello.com/app-key` |
| Token | Click "Token" on that same page |

> **Note:** Power-up credentials are separate and will not work here. You need the personal API key and token from `trello.com/app-key`.

---

## Starting a new Claude Code session

Once the CLI is installed and skill files are in place, paste this into any new Claude Code session to orient it:

```
I have a CLI tool called `trellode` installed globally that wraps the Trello REST API. Authentication is already configured. Skill files are installed at `~/.claude/skills/trellode/` — read `SKILL.md` and `REFERENCE.md` there before doing anything. Start by running `trellode --get-boards` to orient yourself, then `trellode --get-lists <board-id>` on the relevant board so you have the list IDs you need. From there, manage cards as I direct.
```

Claude will read the skill files, discover your board and list IDs, and be ready to create, update, or move cards on request.

---

## Command reference

```
trellode --set-auth <api-key> <token>
trellode --check-auth

trellode --get-boards
trellode --get-board <board-id>

trellode --get-lists <board-id>
trellode --create-list <board-id> "<name>"

trellode --get-all-cards <board-id>
trellode --create-card <list-id> "<name>" [--desc "<desc>"] [--due "YYYY-MM-DD"]
trellode --update-card <card-id> [--name "<name>"] [--desc "<desc>"] [--due "<date>"]
trellode --move-card <card-id> <target-list-id>
trellode --delete-card <card-id>

trellode --get-comments <card-id>
trellode --add-comment <card-id> "<text>"
```

All output is JSON on stdout. Errors go to stderr with a non-zero exit code.

See [`skills/trellode/REFERENCE.md`](skills/trellode/REFERENCE.md) for full documentation including field descriptions and example output shapes.

---

## Project structure

```
src/
  trellode.ts           # entry point
  lib/
    cli.ts              # argument parsing and command dispatch
    config.ts           # credential storage (~/.trellode/config.json)
    http.ts             # Trello API HTTP client
    output.ts           # stdout/stderr helpers
  commands/
    auth.ts             # --set-auth, --check-auth
    boards.ts           # --get-boards, --get-board
    lists.ts            # --get-lists, --create-list
    cards.ts            # --get-all-cards, --create-card, --update-card, --move-card, --delete-card
    comments.ts         # --get-comments, --add-comment
skills/
  trellode/
    SKILL.md            # Claude Code trigger rules and quick reference
    REFERENCE.md        # full command documentation
dist/                   # compiled output (auto-generated, gitignored)
```
