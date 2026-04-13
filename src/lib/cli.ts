import { fatal } from './output';
import { cmdSetAuth, cmdCheckAuth } from '../commands/auth';
import { cmdGetBoards, cmdGetBoard } from '../commands/boards';
import { cmdGetLists, cmdCreateList } from '../commands/lists';
import { cmdGetAllCards, cmdCreateCard, cmdUpdateCard, cmdMoveCard, cmdDeleteCard } from '../commands/cards';
import { cmdGetComments, cmdAddComment } from '../commands/comments';

interface ParsedArgs {
    command: string;
    positional: string[];
    flags: Record<string, string | true>;
}

export function parseArgs(argv: string[]): ParsedArgs {
    const args = argv.slice(2);
    if (args.length === 0) return { command: '--help', positional: [], flags: {} };

    const command = args[0];
    const positional: string[] = [];
    const flags: Record<string, string | true> = {};

    let i = 1;
    while (i < args.length) {
        const a = args[i];
        if (a.startsWith('--')) {
            const key = a.slice(2);
            const next = args[i + 1];
            if (next !== undefined && !next.startsWith('--')) {
                flags[key] = next;
                i += 2;
            } else {
                flags[key] = true;
                i += 1;
            }
        } else {
            positional.push(a);
            i += 1;
        }
    }

    return { command, positional, flags };
}

function flag(flags: Record<string, string | true>, key: string): string | undefined {
    const v = flags[key];
    return typeof v === 'string' ? v : undefined;
}

export function printHelp(): void {
    process.stdout.write(`
trellode — Trello CLI

Authentication:
  trellode --set-auth <api-key> <token>
  trellode --check-auth

Boards:
  trellode --get-boards
  trellode --get-board <board-id>

Lists:
  trellode --get-lists <board-id>
  trellode --create-list <board-id> "<name>"

Cards:
  trellode --get-all-cards <board-id>
  trellode --create-card <list-id> "<name>" [--desc "<desc>"] [--due "YYYY-MM-DD"]
  trellode --update-card <card-id> [--name "<name>"] [--desc "<desc>"] [--due "<date>"]
  trellode --move-card <card-id> <target-list-id>
  trellode --delete-card <card-id>

Comments:
  trellode --get-comments <card-id>
  trellode --add-comment <card-id> "<text>"

Config is stored in: ~/.trellode/config.json
Output is JSON on stdout; errors go to stderr with a non-zero exit code.
`.trimStart());
}

export async function dispatch(argv: string[]): Promise<void> {
    const { command, positional, flags } = parseArgs(argv);

    switch (command) {
        case '--set-auth':
            return cmdSetAuth(positional[0], positional[1]);
        case '--check-auth':
            return cmdCheckAuth();
        case '--get-boards':
            return cmdGetBoards();
        case '--get-board':
            return cmdGetBoard(positional[0]);
        case '--get-lists':
            return cmdGetLists(positional[0]);
        case '--create-list':
            return cmdCreateList(positional[0], positional[1]);
        case '--get-all-cards':
            return cmdGetAllCards(positional[0]);
        case '--create-card':
            return cmdCreateCard(positional[0], positional[1], flag(flags, 'desc'), flag(flags, 'due'));
        case '--update-card':
            return cmdUpdateCard(positional[0], flag(flags, 'name'), flag(flags, 'desc'), flag(flags, 'due'));
        case '--move-card':
            return cmdMoveCard(positional[0], positional[1]);
        case '--delete-card':
            return cmdDeleteCard(positional[0]);
        case '--get-comments':
            return cmdGetComments(positional[0]);
        case '--add-comment':
            return cmdAddComment(positional[0], positional[1]);
        case '--help':
        case '-h':
            printHelp();
            return;
        default:
            fatal(`Unknown command: ${command}\nRun: trellode --help`);
    }
}
