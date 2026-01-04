import { useEffect, useState } from "react";
import { connectSocket, onSocketMessage } from "../api/socketClient";
import { ChatEvent } from "../constants/chatEvents";
import { userService } from "../services/userService";
import { peopleService } from "../services/userService";
import { roomService } from "../services/roomApi";
import type { ChatMessage, UserItem, ServerResponse } from "../types/chatType";

import LeftSideBar from "../components/sidebar/LeftSideBar";
import MainChat from "../components/mainChat/MainChat";

type ChatMode = "people" | "room";

export default function ChatPage() {
  const me = localStorage.getItem("user") || "";

  const [users, setUsers] = useState<UserItem[]>([]);
  const [mode, setMode] = useState<ChatMode>("people");
  const [target, setTarget] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    let unsub: undefined | (() => void);

    connectSocket().then(() => {
      unsub = onSocketMessage((raw) => {
        const msg = raw as ServerResponse<any>;

        if (msg.status === "error") {
          // backend lỗi sẽ trả mes
          alert(msg.data.mes ?? "Có lỗi xảy ra");
          return;
        }

        if (msg.event === ChatEvent.GET_USER_LIST) {
          setUsers(Array.isArray(msg.data) ? msg.data : []);
          return;
        }

        if (msg.event === ChatEvent.GET_PEOPLE_CHAT_MES || msg.event === ChatEvent.GET_ROOM_CHAT_MES) {
          setMessages(Array.isArray(msg.data) ? msg.data : []);
          return;
        }

        if (msg.event === ChatEvent.SEND_CHAT) {
          const m = msg.data as ChatMessage | undefined;
          if (!m || !target) return;

          // append nếu đúng cuộc chat đang mở
          if (mode === "people") {
            // target là username
            if (m.to === target || m.name === target || m.to === me) {
              setMessages((prev) => [...prev, m]);
            }
          } else {
            // room: target là roomName
            if (m.to === target) setMessages((prev) => [...prev, m]);
          }
        }
      });

      // load danh sách users lúc vào chat
      userService.getUserList();
    });

    return () => unsub?.();
  }, [mode, target, me]);

  // chọn chat -> load lịch sử
  useEffect(() => {
    if (!target) {
      setMessages([]);
      return;
    }

    if (mode === "people") {
      peopleService.getPeopleMessages(target, 1);
    } else {
      // room cần join trước để tránh lỗi
      roomService.joinRoom(target);
      roomService.getRoomMessages(target, 1);
    }
  }, [mode, target]);

  const onSelectPeople = (username: string) => {
    setMode("people");
    setTarget(username);
  };

  const onSelectRoom = (roomName: string) => {
    setMode("room");
    setTarget(roomName);
  };

    return (
        <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
            <LeftSideBar
                me={me}
                users={users.filter((u) => u.name !== me)}
                selectedTarget={target}
                onSelectPeople={onSelectPeople}
                onSelectRoom={onSelectRoom}
            />

            <div style={{ flex: 1, position: "relative" }}>
                <MainChat me={me} mode={mode} target={target} messages={messages} />
            </div>
        </div>
    );
}