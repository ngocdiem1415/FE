import { sendSocket } from "../api/socketClient.ts";

export const createRoom = (name: string) => {
    sendSocket({
        action: "onchat",
        data: {
            event: "CREATE_ROOM",
            data: { name },
        },
    });
};

export const joinRoom = (name: string) => {
    sendSocket({
        action: "onchat",
        data: {
            event: "JOIN_ROOM",
            data: { name },
        },
    });
};

export const getRoomMessages = (name: string, page = 1) => {
    sendSocket({
        action: "onchat",
        data: {
            event: "GET_ROOM_CHAT_MES",
            data: { name , page },
        },
    });
};

export const checkUserOnline = (name: string) => {
    sendSocket({
        action: "onchat",
        data: {
            event: "CHECK_USER_ONLINE",
            data: { name },
        },
    });
};
export const checkUserExist = (name: string) => {
    sendSocket({
        action: "onchat",
        data: {
            event: "CHECK_USER_EXIST",
            data: { name },
        },
    });
};
