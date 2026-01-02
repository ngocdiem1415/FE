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


export type ReqChatType = "room" | "people";   // request gửi lên
export type ResChatType = 0 | 1;               // response server trả về

export interface SendChatData {
  type: ReqChatType;
  to: string;
  mes: string;
}

export interface ChatRequest<T> {
  action: typeof ACTION_NAME;
  data: {
    event: string;
    data?: T;
  };
}

// message server trả về
export type ChatMessage = {
  id: number;
  name: string;     // sender
  type: ResChatType;
  to: string;
  mes: string;
  createAt?: string;
};

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