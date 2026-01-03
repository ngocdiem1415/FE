export type ReqChatType = "room" | "people";
export type ResChatType = 0 | 1;

// Data gửi đi (SEND_CHAT)
export interface SendChatData {
  type: ReqChatType;
  to: string;
  mes: string;
}

// Data tin nhắn nhận về
export type ChatMessage = {
  id: number;
  name: string;
  type: ResChatType;
  to: string;
  mes: string;
  createAt?: string;
};