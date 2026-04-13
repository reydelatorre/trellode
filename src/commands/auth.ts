import { saveConfig, getAuth } from '../lib/config';
import { request, authParams } from '../lib/http';
import { out, fatal } from '../lib/output';

interface TrelloMember {
    id: string;
    username: string;
    fullName: string;
}

export async function cmdSetAuth(apiKey: string | undefined, token: string | undefined): Promise<void> {
    if (!apiKey || !token) fatal('Usage: trellode --set-auth <api-key> <token>');
    saveConfig({ apiKey, token });
    out({ status: 'ok', message: 'Credentials saved.' });
}

export async function cmdCheckAuth(): Promise<void> {
    const auth = getAuth();
    const data = await request<TrelloMember>('GET', `/1/members/me?${authParams(auth)}`);
    out({ status: 'ok', username: data.username, fullName: data.fullName, id: data.id });
}
