//đối tượng nhận tin nhắn
import {ACTION_NAME} from "../constants/chatEvents.ts";

export type ReqChatType = "room" | "people";   // request gửi lên
export type ResChatType = 0 | 1;               // response server trả về

export type WsStatus = "success" | "error";

export type WsResponse<T = any> = {
  event: string;
  status: WsStatus;
  data?: T;
  mes?: string;
};

// SEND_CHAT request
export interface SendChatData {
  type: ReqChatType;
  to: string;
  mes: string;
}

export interface ChatRequest<T> {
  action: typeof ACTION_NAME;
  data: {
    event: string;
    data?: T;
  };
}

// message server trả về
export type ChatMessage = {
  id: number;
  name: string;     // sender
  type: ResChatType;
  to: string;
  mes: string;
  createAt?: string;
};

export type UserItem = {
  name: string;
  type: number;
  actionTime: string;
};
