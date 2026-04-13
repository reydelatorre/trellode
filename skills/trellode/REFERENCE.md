# trellode — Full Command Reference

## Installation

```powershell
# From the project directory:
npm install -g .

# Verify:
trellode --help
```

Config directory: `%USERPROFILE%\.trellode\`  
Config file: `%USERPROFILE%\.trellode\config.json`

---

## Authentication

### `--set-auth <api-key> <token>`

Saves your Trello API key and token to `~/.trellode/config.json`.

```
trellode --set-auth abc123 xyz789
```

Output:
```json
{ "status": "ok", "message": "Credentials saved." }
```

Get your API key at: https://trello.com/app-key  
Generate a token from: https://trello.com/1/authorize?expiration=never&scope=read,write&response_type=token&key=YOUR_API_KEY

---

### `--check-auth`

Validates stored credentials by fetching the authenticated member.

```
trellode --check-auth
```

Output:
```json
{
  "status": "ok",
  "username": "johndoe",
  "fullName": "John Doe",
  "id": "5e8f8f8f8f8f8f8f8f8f8f8f"
}
```

---

## Boards

### `--get-boards`

Returns all boards for the authenticated user.

```
trellode --get-boards
```

Output: array of board objects with `id`, `name`, `url`, `closed`.

---

### `--get-board <board-id>`

Returns details for a single board.

```
trellode --get-board 5e8f8f8f8f8f8f8f8f8f8f8f
```

Output: board object with `id`, `name`, `desc`, `url`, `closed`.

---

## Lists

### `--get-lists <board-id>`

Returns all open lists on a board.

```
trellode --get-lists 5e8f8f8f8f8f8f8f8f8f8f8f
```

Output: array of list objects with `id`, `name`, `closed`, `pos`.

---

### `--create-list <board-id> "<name>"`

Creates a new list on a board.

```
trellode --create-list 5e8f8f8f8f8f8f8f8f8f8f8f "In Progress"
```

Output: the created list object.

---

## Cards

### `--get-all-cards <board-id>`

Returns all cards on a board.

```
trellode --get-all-cards 5e8f8f8f8f8f8f8f8f8f8f8f
```

Output: array of card objects with `id`, `name`, `desc`, `due`, `idList`, `closed`, `url`, `pos`.

---

### `--create-card <list-id> "<name>" [--desc "<desc>"] [--due "YYYY-MM-DD"]`

Creates a new card in a list.

```
trellode --create-card abc123 "Fix login bug" --desc "Users can't log in on mobile" --due 2026-04-20
```

Output: the created card object.

| Flag | Required | Description |
|------|----------|-------------|
| `<list-id>` | Yes | ID of the target list |
| `"<name>"` | Yes | Card title |
| `--desc` | No | Card description |
| `--due` | No | Due date (YYYY-MM-DD or ISO 8601) |

---

### `--update-card <card-id> [--name "<name>"] [--desc "<desc>"] [--due "<date>"]`

Updates one or more fields on an existing card.

```
trellode --update-card abc123 --name "Fix login bug (mobile)" --due 2026-04-25
```

At least one of `--name`, `--desc`, or `--due` must be provided.

Output: the updated card object.

---

### `--move-card <card-id> <target-list-id>`

Moves a card to a different list.

```
trellode --move-card abc123 def456
```

Output: the updated card object with the new `idList`.

---

### `--delete-card <card-id>`

Permanently deletes a card.

```
trellode --delete-card abc123
```

Output:
```json
{ "status": "ok", "deleted": "abc123", "response": {} }
```

---

## Comments

### `--get-comments <card-id>`

Returns all comments on a card (most recent first).

```
trellode --get-comments abc123
```

Output: array of action objects. Each has:
- `id` — action ID
- `date` — ISO timestamp
- `memberCreator.username` — who wrote the comment
- `data.text` — comment body

---

### `--add-comment <card-id> "<text>"`

Adds a comment to a card.

```
trellode --add-comment abc123 "Ready for review"
```

Output: the created action object.

---

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Error (auth missing, HTTP error, bad arguments) |

---

## Finding IDs

Trello IDs are 24-character hex strings. To discover them:

```
# Find a board ID
trellode --get-boards

# Find list IDs on a board
trellode --get-lists <board-id>

# Find card IDs on a board
trellode --get-all-cards <board-id>
```

You can also find IDs in the Trello web URL:
- Board: `https://trello.com/b/<short-id>/<name>` — use `--get-boards` to get the full 24-char ID
- Card: click a card, the URL becomes `https://trello.com/c/<short-id>/<name>`
