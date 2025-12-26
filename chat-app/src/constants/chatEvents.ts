export const ChatEvent = {
    REGISTER: "REGISTER",
    LOGIN: "LOGIN",
    RE_LOGIN: "RE_LOGIN",
    LOGOUT: "LOGOUT",
    CREATE_ROOM: "CREATE_ROOM",
    JOIN_ROOM: "JOIN_ROOM",
    GET_ROOM_MESSAGES: "GET_ROOM_CHAT_MES",
    GET_PEOPLE_MESSAGES: "GET_PEOPLE_CHAT_MES",
    SEND_CHAT: "SEND_CHAT",
    CHECK_USER_ONLINE: "CHECK_USER_ONLINE",
    CHECK_USER_EXIST: "CHECK_USER_EXIST",
    GET_USER_LIST: "GET_USER_LIST",
} as const;

export type ChatEventType = typeof ChatEvent[keyof typeof ChatEvent];

export const ACTION_NAME = "onchat";