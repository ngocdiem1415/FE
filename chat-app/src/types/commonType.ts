import { ACTION_NAME } from "../constants/chatEvents";

export type WsStatus = "success" | "error";

export type WsResponse<T = any> = {
    event: string;
    status: WsStatus;
    data?: T;
    mes?: string;
};

export interface SocketRequest<T> {
    action: typeof ACTION_NAME;
    data: {
        event: string;
        data?: T;
    };
}