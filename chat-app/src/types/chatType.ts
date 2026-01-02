export const ACTION_NAME = "onchat" as const;

// Cấu hình Route cho React Router
export const APP_ROUTES = {
    LOGIN: "/login",
    REGISTER: "/register",
    CHAT: "/chat",
} as const;

export type ChatEvent =
    | "REGISTER"
    | "LOGIN"
    | "RE_LOGIN"
    | "LOGOUT"
    | "CREATE_ROOM"
    | "JOIN_ROOM"
    | "GET_ROOM_CHAT_MES"
    | "GET_PEOPLE_CHAT_MES"
    | "SEND_CHAT"
    | "CHECK_USER_EXIST"
    | "CHECK_USER_ONLINE"
    | "GET_USER_LIST";

export interface ChatRequest<T> {
    action: typeof ACTION_NAME;
    data: {
        event: ChatEvent;
        data: T;
    };
}

export interface ServerResponse<T = any> {
    status: "success" | "error";
    event: ChatEvent | string;
    data: {
        status: true | false;
    }
}


export type ChatType = "room" | "people";

export interface SendChatData {
    type: ChatType;
    to: string;
    mes: string;
}

export interface UserCheckData {
    user: string;
}

export interface RoomActionData {
    name: string;
    page?: number;
}