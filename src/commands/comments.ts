import { getAuth } from '../lib/config';
import { request, authParams } from '../lib/http';
import { out, fatal } from '../lib/output';

export interface TrelloComment {
    id: string;
    date: string;
    memberCreator: { username: string; fullName: string };
    data: { text: string };
}

export async function cmdGetComments(cardId: string | undefined): Promise<void> {
    if (!cardId) fatal('Usage: trellode --get-comments <card-id>');
    const auth = getAuth();
    const data = await request<TrelloComment[]>('GET',
        `/1/cards/${cardId}/actions?${authParams(auth, { filter: 'commentCard' })}`
    );
    out(data);
}

export async function cmdAddComment(cardId: string | undefined, text: string | undefined): Promise<void> {
    if (!cardId || !text) fatal('Usage: trellode --add-comment <card-id> "<text>"');
    const auth = getAuth();
    const data = await request<TrelloComment>('POST',
        `/1/cards/${cardId}/actions/comments?${authParams(auth, { text })}`
    );
    out(data);
}
