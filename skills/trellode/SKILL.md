# trellode Skill

## Trigger Rules

Use the `trellode` CLI whenever the user asks to:
- List, inspect, or search Trello boards, lists, or cards
- Create, update, move, or delete Trello cards or lists
- Read or post comments on Trello cards
- Manage Trello credentials / authentication
- Do anything involving Trello data

## Quick Reference

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

Config is stored in `%USERPROFILE%\.trellode\config.json`.

## Usage Pattern

1. Confirm auth with `trellode --check-auth` before other operations.
2. Use `trellode --get-boards` to discover board IDs.
3. Use `trellode --get-lists <board-id>` to find list IDs.
4. Parse the JSON output to extract IDs needed for subsequent commands.

## Notes

- Always quote names and descriptions that may contain spaces.
- Dates for `--due` should be in ISO format: `YYYY-MM-DD` or `YYYY-MM-DDTHH:MM:SSZ`.
- See REFERENCE.md for full field documentation and example output shapes.
