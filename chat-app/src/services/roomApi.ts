import { sendSocket } from "../api/socketClient";
import { ACTION_NAME, ChatEvent } from "../constants/chatEvents";

export const roomService = {
  createRoom: (name: string) =>
    sendSocket(
        { action: ACTION_NAME, data: 
            { event: ChatEvent.CREATE_ROOM,
                 data: { name } 
                } }
            ),

  joinRoom: (name: string) =>
    sendSocket(
        { action: ACTION_NAME, data: 
            { event: ChatEvent.JOIN_ROOM,
                 data: { name } 
                } }
            ),

  getRoomMessages: (name: string, page = 1) =>
    sendSocket(
        { action: ACTION_NAME, data: 
            { event: ChatEvent.GET_ROOM_CHAT_MES,
                 data: { name, page } 
                } }
                ),
};
