import https from 'https';
import { Auth } from './config';

const TRELLO_BASE = 'api.trello.com';

export function request<T = unknown>(method: string, urlPath: string, body?: unknown): Promise<T> {
    return new Promise((resolve, reject) => {
        const bodyStr = body ? JSON.stringify(body) : null;
        const options: https.RequestOptions = {
            hostname: TRELLO_BASE,
            path: urlPath,
            method,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        };
        if (bodyStr) {
            (options.headers as Record<string, string | number>)['Content-Length'] = Buffer.byteLength(bodyStr);
        }

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk: string) => { data += chunk; });
            res.on('end', () => {
                if (res.statusCode !== undefined && res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(data) as T);
                    } catch {
                        resolve(data as unknown as T);
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

export function qs(params: Record<string, string | undefined | null>): string {
    return Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v as string)}`)
        .join('&');
}

export function authParams(auth: Auth, extra: Record<string, string | undefined | null> = {}): string {
    return qs({ key: auth.apiKey, token: auth.token, ...extra });
}
