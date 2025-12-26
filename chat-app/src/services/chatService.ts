import { sendSocket } from "../api/socketClient";
import { ChatEvent, ACTION_NAME } from "../constants/chatEvents";
import type { SendChatData, ChatRequest } from "../types/chatType";

export const chatService = {
    /**
     * Hàm cốt lõi để gửi tin nhắn qua Socket
     */
    sendChat: (chatData: SendChatData) => {
        const payload: ChatRequest<SendChatData> = {
            action: ACTION_NAME,
            data: {
                event: ChatEvent.SEND_CHAT,
                data: chatData,
            },
        };

        sendSocket(payload);
    },

    /**
     * Chức năng: Gửi tin nhắn vào Room
     * @param roomName Tên phòng (ví dụ: "abc")
     */
    sendToRoom: (roomName: string, message: string) => {
        chatService.sendChat({
            type: "room",
            to: roomName,
            mes: message,
        });
    },

    /**
     * Chức năng: Gửi tin nhắn cá nhân (People)
     * @param username Tên người nhận (ví dụ: "ti")
     */
    sendToPeople: (username: string, message: string) => {
        chatService.sendChat({
            type: "people",
            to: username,
            mes: message,
        });
    },
};