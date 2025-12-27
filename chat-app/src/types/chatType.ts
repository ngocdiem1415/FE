//đối tượng nhận tin nhắn
import {ACTION_NAME} from "../constants/chatEvents.ts";

export type ChatType = "room" | "people";

//cấu trúc dữ liệu của API SEND_CHAT
export interface SendChatData {
    type: ChatType;
    to: string;
    mes: string;
}

//cấu trúc request gửi đi qua Socket
export interface ChatRequest<T> {
    action: typeof ACTION_NAME;
    data: {
        event: string;
        data: T;
    };
}