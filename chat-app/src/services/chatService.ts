import { sendSocketSafe } from "../api/socketClient";
import { ChatEvent, ACTION_NAME } from "../constants/chatEvents";
import type { SocketRequest } from "../types/commonType";
import type { SendChatData } from "../types/chatType";

export const chatService = {
  sendChat: (chatData: SendChatData) => {
    const payload: SocketRequest<SendChatData> = {
      action: ACTION_NAME,
      data: {
        event: ChatEvent.SEND_CHAT,
        data: chatData,
      },
    };

    // an toàn: nếu socket chưa open sẽ tự connect + queue
    return sendSocketSafe(payload);
  },

  sendToRoom: (roomName: string, message: string) => {
    return chatService.sendChat({
      type: "room",
      to: roomName.trim().toLowerCase(), // tránh lỗi ABC vs abc
      mes: message,
    });
  },

  sendToPeople: (username: string, message: string) => {
    return chatService.sendChat({
      type: "people",
      to: username.trim(),
      mes: message,
    });
  },
};
