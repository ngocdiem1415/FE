import { sendSocket } from "./socket";

export const register = (user: string, pass: string) => {
  sendSocket({
    action: "onchat",
    data: {
      event: "REGISTER",
      data: { user, pass },
    },
  });
};

export const login = (user: string, pass: string) => {
  sendSocket({
    action: "onchat",
    data: {
      event: "LOGIN",
      data: { user, pass },
    },
  });
};

export const relogin = (code: string) => {
  sendSocket({
    action: "onchat",
    data: {
      event: "LOGIN_RE",
      data: {
        RE_LOGIN_CODE: code,
      },
    },
  });
};
