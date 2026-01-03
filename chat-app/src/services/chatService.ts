import { sendSocket } from "../api/socketClient";
import { ChatEvent, ACTION_NAME } from "../constants/chatEvents";
import type { SocketRequest } from "../types/commonType";
import type {SendChatData } from "../types/chatType";

export const chatService = {
  sendChat: (chatData: SendChatData) => {
    const payload: SocketRequest<SendChatData> = {
      action: ACTION_NAME,
      data: {
        event: ChatEvent.SEND_CHAT,
        data: chatData,
      },
    };
    sendSocket(payload);
  },

  sendToRoom: (roomName: string, message: string) => {
    chatService.sendChat({
         type: "room", 
         to: roomName, 
         mes: message 
        });
  },

  sendToPeople: (username: string, message: string) => {
    chatService.sendChat({
         type: "people", 
         to: username, 
         mes: message 
        });
  },
};
