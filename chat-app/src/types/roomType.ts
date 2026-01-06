import type { ChatMessage } from "./chatType";

export interface RoomMember {
    id: number;
    name: string;
}

export interface RoomData {
    id: number;
    name: string;
    own: string;
    createTime: string;
    userList: RoomMember[];
    chatData: ChatMessage[];
}