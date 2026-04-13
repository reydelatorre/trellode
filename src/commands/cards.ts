import { getAuth } from '../lib/config';
import { request, authParams } from '../lib/http';
import { out, fatal } from '../lib/output';

export interface TrelloCard {
    id: string;
    name: string;
    desc: string;
    due: string | null;
    idList: string;
    closed: boolean;
    url: string;
    pos: number;
}

export async function cmdGetAllCards(boardId: string | undefined): Promise<void> {
    if (!boardId) fatal('Usage: trellode --get-all-cards <board-id>');
    const auth = getAuth();
    const data = await request<TrelloCard[]>('GET',
        `/1/boards/${boardId}/cards?${authParams(auth, { fields: 'id,name,desc,due,idList,closed,url,pos' })}`
    );
    out(data);
}

export async function cmdCreateCard(
    listId: string | undefined,
    name: string | undefined,
    desc: string | undefined,
    due: string | undefined,
): Promise<void> {
    if (!listId || !name) fatal('Usage: trellode --create-card <list-id> "<name>" [--desc "<desc>"] [--due "YYYY-MM-DD"]');
    const auth = getAuth();
    const data = await request<TrelloCard>('POST',
        `/1/cards?${authParams(auth, { name, idList: listId, desc, due })}`
    );
    out(data);
}

export async function cmdUpdateCard(
    cardId: string | undefined,
    name: string | undefined,
    desc: string | undefined,
    due: string | undefined,
): Promise<void> {
    if (!cardId) fatal('Usage: trellode --update-card <card-id> [--name "<name>"] [--desc "<desc>"] [--due "<date>"]');
    const updates: Record<string, string | undefined> = { name, desc, due };
    const filtered = Object.fromEntries(Object.entries(updates).filter(([, v]) => v !== undefined));
    if (Object.keys(filtered).length === 0) {
        fatal('--update-card requires at least one of --name, --desc, --due');
    }
    const auth = getAuth();
    const data = await request<TrelloCard>('PUT',
        `/1/cards/${cardId}?${authParams(auth, filtered)}`
    );
    out(data);
}

export async function cmdMoveCard(cardId: string | undefined, targetListId: string | undefined): Promise<void> {
    if (!cardId || !targetListId) fatal('Usage: trellode --move-card <card-id> <target-list-id>');
    const auth = getAuth();
    const data = await request<TrelloCard>('PUT',
        `/1/cards/${cardId}?${authParams(auth, { idList: targetListId })}`
    );
    out(data);
}

export async function cmdDeleteCard(cardId: string | undefined): Promise<void> {
    if (!cardId) fatal('Usage: trellode --delete-card <card-id>');
    const auth = getAuth();
    const data = await request('DELETE', `/1/cards/${cardId}?${authParams(auth)}`);
    out({ status: 'ok', deleted: cardId, response: data });
}
