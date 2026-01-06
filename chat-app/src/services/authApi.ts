import { sendSocketSafe } from "../api/socketClient";
import { ACTION_NAME, ChatEvent } from "../constants/chatEvents";

export const register = (user: string, pass: string) => {
  return sendSocketSafe({
    action: ACTION_NAME,
    data: {
      event: ChatEvent.REGISTER,
      data: { user, pass },
    },
  });
};

export const login = (user: string, pass: string) => {
  return sendSocketSafe({
    action: ACTION_NAME,
    data: {
      event: ChatEvent.LOGIN,
      data: { user, pass },
    },
  });
};

// relogin đúng theo ChatPage bạn đang dùng: relogin(me, savedReLoginCode)
export const relogin = (user: string, code: string) => {
  return sendSocketSafe({
    action: ACTION_NAME,
    data: {
      event: ChatEvent.RE_LOGIN, // bạn đang dùng RE_LOGIN ở ChatPage
      data: { user, code },
    },
  });
};

export const authService = {
  logout: () =>
    sendSocketSafe({
      action: ACTION_NAME,
      data: {
        event: ChatEvent.LOGOUT,
      },
    }),
};
