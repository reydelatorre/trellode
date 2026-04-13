import { getAuth } from '../lib/config';
import { request, authParams } from '../lib/http';
import { out, fatal } from '../lib/output';

export interface TrelloList {
    id: string;
    name: string;
    closed: boolean;
    pos: number;
    idBoard: string;
}

export async function cmdGetLists(boardId: string | undefined): Promise<void> {
    if (!boardId) fatal('Usage: trellode --get-lists <board-id>');
    const auth = getAuth();
    const data = await request<TrelloList[]>('GET',
        `/1/boards/${boardId}/lists?${authParams(auth, { fields: 'id,name,closed,pos' })}`
    );
    out(data);
}

export async function cmdCreateList(boardId: string | undefined, name: string | undefined): Promise<void> {
    if (!boardId || !name) fatal('Usage: trellode --create-list <board-id> "<name>"');
    const auth = getAuth();
    const data = await request<TrelloList>('POST',
        `/1/lists?${authParams(auth, { name, idBoard: boardId })}`
    );
    out(data);
}
