#!/usr/bin/env node

'use strict';

const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');

// ── Config ────────────────────────────────────────────────────────────────────

const CONFIG_DIR = path.join(os.homedir(), '.trellode');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');
const TRELLO_BASE = 'api.trello.com';

function loadConfig() {
    if (!fs.existsSync(CONFIG_FILE)) return {};
    try {
        return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    } catch {
        return {};
    }
}

function saveConfig(data) {
    if (!fs.existsSync(CONFIG_DIR)) {
        fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function getAuth() {
    const cfg = loadConfig();
    if (!cfg.apiKey || !cfg.token) {
        fatal('Not authenticated. Run: trellode --set-auth <api-key> <token>');
    }
    return { apiKey: cfg.apiKey, token: cfg.token };
}

// ── HTTP helpers ──────────────────────────────────────────────────────────────

function request(method, urlPath, body) {
    return new Promise((resolve, reject) => {
        const bodyStr = body ? JSON.stringify(body) : null;
        const options = {
            hostname: TRELLO_BASE,
            path: urlPath,
            method,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        };
        if (bodyStr) {
            options.headers['Content-Length'] = Buffer.byteLength(bodyStr);
        }

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(data));
                    } catch {
                        resolve(data);
                    }
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                }
            });
        });

        req.on('error', reject);
        if (bodyStr) req.write(bodyStr);
        req.end();
    });
}

function qs(params) {
    return Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&');
}

function authParams(auth, extra = {}) {
    return qs({ key: auth.apiKey, token: auth.token, ...extra });
}

// ── Output helpers ────────────────────────────────────────────────────────────

function out(data) {
    process.stdout.write(JSON.stringify(data, null, 2) + '\n');
}

function fatal(msg, code = 1) {
    process.stderr.write(`Error: ${msg}\n`);
    process.exit(code);
}

// ── Commands ──────────────────────────────────────────────────────────────────

async function cmdSetAuth(apiKey, token) {
    if (!apiKey || !token) fatal('Usage: trellode --set-auth <api-key> <token>');
    saveConfig({ apiKey, token });
    out({ status: 'ok', message: 'Credentials saved.' });
}

async function cmdCheckAuth() {
    const auth = getAuth();
    const data = await request('GET', `/1/members/me?${authParams(auth)}`);
    out({ status: 'ok', username: data.username, fullName: data.fullName, id: data.id });
}

async function cmdGetBoards() {
    const auth = getAuth();
    const data = await request('GET', `/1/members/me/boards?${authParams(auth, { fields: 'id,name,url,closed' })}`);
    out(data);
}

async function cmdGetBoard(boardId) {
    if (!boardId) fatal('Usage: trellode --get-board <board-id>');
    const auth = getAuth();
    const data = await request('GET', `/1/boards/${boardId}?${authParams(auth, { fields: 'id,name,desc,url,closed' })}`);
    out(data);
}

async function cmdGetLists(boardId) {
    if (!boardId) fatal('Usage: trellode --get-lists <board-id>');
    const auth = getAuth();
    const data = await request('GET', `/1/boards/${boardId}/lists?${authParams(auth, { fields: 'id,name,closed,pos' })}`);
    out(data);
}

async function cmdCreateList(boardId, name) {
    if (!boardId || !name) fatal('Usage: trellode --create-list <board-id> "<name>"');
    const auth = getAuth();
    const data = await request('POST', `/1/lists?${authParams(auth, { name, idBoard: boardId })}`);
    out(data);
}

async function cmdGetAllCards(boardId) {
    if (!boardId) fatal('Usage: trellode --get-all-cards <board-id>');
    const auth = getAuth();
    const data = await request('GET', `/1/boards/${boardId}/cards?${authParams(auth, { fields: 'id,name,desc,due,idList,closed,url,pos' })}`);
    out(data);
}

async function cmdCreateCard(listId, name, desc, due) {
    if (!listId || !name) fatal('Usage: trellode --create-card <list-id> "<name>" [--desc "<desc>"] [--due "YYYY-MM-DD"]');
    const auth = getAuth();
    const extra = { name, idList: listId };
    if (desc) extra.desc = desc;
    if (due) extra.due = due;
    const data = await request('POST', `/1/cards?${authParams(auth, extra)}`);
    out(data);
}

async function cmdUpdateCard(cardId, name, desc, due) {
    if (!cardId) fatal('Usage: trellode --update-card <card-id> [--name "<name>"] [--desc "<desc>"] [--due "<date>"]');
    const auth = getAuth();
    const extra = {};
    if (name !== undefined) extra.name = name;
    if (desc !== undefined) extra.desc = desc;
    if (due !== undefined) extra.due = due;
    if (Object.keys(extra).length === 0) fatal('--update-card requires at least one of --name, --desc, --due');
    const data = await request('PUT', `/1/cards/${cardId}?${authParams(auth, extra)}`);
    out(data);
}

async function cmdMoveCard(cardId, targetListId) {
    if (!cardId || !targetListId) fatal('Usage: trellode --move-card <card-id> <target-list-id>');
    const auth = getAuth();
    const data = await request('PUT', `/1/cards/${cardId}?${authParams(auth, { idList: targetListId })}`);
    out(data);
}

async function cmdDeleteCard(cardId) {
    if (!cardId) fatal('Usage: trellode --delete-card <card-id>');
    const auth = getAuth();
    const data = await request('DELETE', `/1/cards/${cardId}?${authParams(auth)}`);
    out({ status: 'ok', deleted: cardId, response: data });
}

async function cmdGetComments(cardId) {
    if (!cardId) fatal('Usage: trellode --get-comments <card-id>');
    const auth = getAuth();
    const data = await request('GET', `/1/cards/${cardId}/actions?${authParams(auth, { filter: 'commentCard' })}`);
    out(data);
}

async function cmdAddComment(cardId, text) {
    if (!cardId || !text) fatal('Usage: trellode --add-comment <card-id> "<text>"');
    const auth = getAuth();
    const data = await request('POST', `/1/cards/${cardId}/actions/comments?${authParams(auth, { text })}`);
    out(data);
}

function printHelp() {
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

// ── Argument parsing ──────────────────────────────────────────────────────────

function parseArgs(argv) {
    // Returns { command, positional: [], flags: {} }
    const args = argv.slice(2);
    if (args.length === 0) return { command: '--help', positional: [], flags: {} };

    const command = args[0];
    const positional = [];
    const flags = {};

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

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
    const { command, positional, flags } = parseArgs(process.argv);

    try {
        switch (command) {
            case '--set-auth':
                await cmdSetAuth(positional[0], positional[1]);
                break;
            case '--check-auth':
                await cmdCheckAuth();
                break;
            case '--get-boards':
                await cmdGetBoards();
                break;
            case '--get-board':
                await cmdGetBoard(positional[0]);
                break;
            case '--get-lists':
                await cmdGetLists(positional[0]);
                break;
            case '--create-list':
                await cmdCreateList(positional[0], positional[1]);
                break;
            case '--get-all-cards':
                await cmdGetAllCards(positional[0]);
                break;
            case '--create-card':
                await cmdCreateCard(positional[0], positional[1], flags.desc, flags.due);
                break;
            case '--update-card':
                await cmdUpdateCard(positional[0], flags.name, flags.desc, flags.due);
                break;
            case '--move-card':
                await cmdMoveCard(positional[0], positional[1]);
                break;
            case '--delete-card':
                await cmdDeleteCard(positional[0]);
                break;
            case '--get-comments':
                await cmdGetComments(positional[0]);
                break;
            case '--add-comment':
                await cmdAddComment(positional[0], positional[1]);
                break;
            case '--help':
            case '-h':
                printHelp();
                break;
            default:
                fatal(`Unknown command: ${command}\nRun: trellode --help`);
        }
    } catch (err) {
        fatal(err.message);
    }
}

main();
