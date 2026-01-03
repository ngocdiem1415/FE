import { sendSocket } from "../api/socketClient.ts";
import { ACTION_NAME, ChatEvent } from "../constants/chatEvents";

export const register = (user: string, pass: string) => {
  sendSocket({
    action: ACTION_NAME,
    data: {
      event: ChatEvent.REGISTER,
      data: { user, pass },
    },
  });
};

export const login = (user: string, pass: string) => {
  sendSocket({
    action: ACTION_NAME,
    data: {
      event: ChatEvent.LOGIN,
      data: { user, pass },
    },
  });
};

export const relogin = (code: string) => {
  sendSocket({
    action: ACTION_NAME,
    data: {
      event: ChatEvent.RE_LOGIN,
      data: {
        RE_LOGIN_CODE: code,
      },
    },
  });
};

export const authService = {
  logout: () => sendSocket({ 
    action: ACTION_NAME, data: { 
      event: ChatEvent.LOGOUT
     }, 
    }
  ),
};
