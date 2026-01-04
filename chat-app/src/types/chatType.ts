export const ACTION_NAME = "onchat" as const;

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
        event: ChatEvent | string;
        data?: T;
    };
}

export interface ServerResponse<T = any> {
    status: "success" | "error";
    event: ChatEvent | string;
    data: T;
}

// export type ReqChatType = "room" | "people";
// export type ResChatType = 0 | 1;

export interface SendChatData {
    type: ReqChatType;
    to: string;
    mes: string;
}

// export type ChatMessage = {
//     id: number;
//     name: string;
//     type: ResChatType;
//     to: string;
//     mes: string;
//     createAt?: string;
// };

export type UserItem = {
    name: string;
    type: number;
    actionTime: string;
};

export interface UserCheckData {
    user: string;
}

export interface RoomActionData {
    name: string;
    page?: number;
}

export interface CheckUserExitResponse {
    status: boolean;
    user: string;
}

export type ReqChatType = "room" | "people";
export type ResChatType = 0 | 1;

// Data gửi đi (SEND_CHAT)
export interface SendChatData {
  type: ReqChatType;
  to: string;
  mes: string;
}

// Data tin nhắn nhận về
export type ChatMessage = {
  id: number;
  name: string;
  type: ResChatType;
  to: string;
  mes: string;
  createAt?: string;
};