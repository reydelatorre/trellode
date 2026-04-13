import { getAuth } from '../lib/config';
import { request, authParams } from '../lib/http';
import { out, fatal } from '../lib/output';

export interface TrelloBoard {
    id: string;
    name: string;
    desc?: string;
    url: string;
    closed: boolean;
}

export async function cmdGetBoards(): Promise<void> {
    const auth = getAuth();
    const data = await request<TrelloBoard[]>('GET',
        `/1/members/me/boards?${authParams(auth, { fields: 'id,name,url,closed' })}`
    );
    out(data);
}

export async function cmdGetBoard(boardId: string | undefined): Promise<void> {
    if (!boardId) fatal('Usage: trellode --get-board <board-id>');
    const auth = getAuth();
    const data = await request<TrelloBoard>('GET',
        `/1/boards/${boardId}?${authParams(auth, { fields: 'id,name,desc,url,closed' })}`
    );
    out(data);
}
