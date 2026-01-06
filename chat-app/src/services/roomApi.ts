import { sendSocketSafe } from "../api/socketClient";
import { ACTION_NAME, ChatEvent } from "../constants/chatEvents";

export const roomService = {
  createRoom: (name: string) =>
    sendSocketSafe({
      action: ACTION_NAME,
      data: {
        event: ChatEvent.CREATE_ROOM,
        data: { name },
      },
    }),

  joinRoom: (name: string) =>
    sendSocketSafe({
      action: ACTION_NAME,
      data: {
        event: ChatEvent.JOIN_ROOM,
        data: { name },
      },
    }),

  getRoomMessages: (name: string, page = 1) =>
    sendSocketSafe({
      action: ACTION_NAME,
      data: {
        event: ChatEvent.GET_ROOM_CHAT_MES,
        data: { name, page },
      },
    }),
};

// --- Các API khác ---
export const checkUserOnline = (user: string) => {
  return sendSocketSafe({
    action: ACTION_NAME,
    data: {
      event: ChatEvent.CHECK_USER_ONLINE,
      data: { user },
    },
  });
};

export const checkUserExist = (user: string) => {
  return sendSocketSafe({
    action: ACTION_NAME,
    data: {
      event: ChatEvent.CHECK_USER_EXIST,
      data: { user },
    },
  });
};

export const getUserList = () => {
  return sendSocketSafe({
    action: ACTION_NAME,
    data: {
      event: ChatEvent.GET_USER_LIST,
    },
  });
};
