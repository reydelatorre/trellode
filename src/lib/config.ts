import fs from 'fs';
import path from 'path';
import os from 'os';
import { fatal } from './output';

export interface Auth {
    apiKey: string;
    token: string;
}

interface Config {
    apiKey?: string;
    token?: string;
}

export const CONFIG_DIR = path.join(os.homedir(), '.trellode');
export const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

export function loadConfig(): Config {
    if (!fs.existsSync(CONFIG_FILE)) return {};
    try {
        return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')) as Config;
    } catch {
        return {};
    }
}

export function saveConfig(data: Config): void {
    if (!fs.existsSync(CONFIG_DIR)) {
        fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2), 'utf8');
}

export function getAuth(): Auth {
    const cfg = loadConfig();
    if (!cfg.apiKey || !cfg.token) {
        fatal('Not authenticated. Run: trellode --set-auth <api-key> <token>');
    }
    return { apiKey: cfg.apiKey, token: cfg.token };
}
