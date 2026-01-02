import { useEffect, useState, useRef } from "react";
import {connectSocket, onSocketMessage, sendSocket} from "../api/socketClient";
import {ACTION_NAME, ChatEvent} from "../constants/chatEvents";
import { userService } from "../services/userService";
import { peopleService } from "../services/userService";
import { roomService } from "../services/roomApi";
import type { ChatMessage, UserItem, WsResponse } from "../types/chatType";

import LeftSideBar from "../components/sidebar/LeftSideBar";
import MainChat from "../components/mainChat/MainChat";

type ChatMode = "people" | "room";

export default function ChatPage() {
  const me = localStorage.getItem("user") || "";

  const [users, setUsers] = useState<UserItem[]>([]);
  const [mode, setMode] = useState<ChatMode>("people");
  const [target, setTarget] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Refs để truy cập state mới nhất trong socket callback
  const modeRef = useRef<ChatMode>("people");
  const targetRef = useRef<string | null>(null);

  useEffect(() => {
    modeRef.current = mode;
    targetRef.current = target;
  }, [mode, target]);

  //Nhận tin nhắn từ MainChat (do chính mình gửi)
  const handleManualAddMessage = (msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  };

  useEffect(() => {
    let unsub: (() => void) | undefined;
    let heartbeatInterval: any = null;

    const initSocket = async () => {
      // 1. Kết nối (Cookie session sẽ tự gửi đi)
      await connectSocket();
      console.log("Socket Connected!");

      // 2. KÍCH HOẠT HEARTBEAT (Giữ kết nối sống mãi)
      heartbeatInterval = setInterval(() => {
        const pingPayload = {
          action: ACTION_NAME,
          data: {
            event: ChatEvent.CHECK_USER_ONLINE, // Hoặc event nào nhẹ nhất
            data: { user: me }
          }
        };
        // Gửi gói tin để server không timeout
        sendSocket(pingPayload);
        // console.log("Sent Heartbeat...");
      }, 50000); // 50 giây gửi 1 lần (An toàn dưới mức 2 phút)

      // 3. LẮNG NGHE TIN NHẮN TỪ SERVER
      unsub = onSocketMessage((raw) => {
        const msg = raw as WsResponse<any>;

        if (msg.status === "error") {
          console.error("Socket Error:", msg.mes);
          return;
        }

        // --- XỬ LÝ DANH SÁCH USER ---
        if (msg.event === ChatEvent.GET_USER_LIST) {
          setUsers(Array.isArray(msg.data) ? msg.data : []);
          return;
        }

        // --- XỬ LÝ LỊCH SỬ TIN NHẮN ---
        if (msg.event === ChatEvent.GET_PEOPLE_CHAT_MES || msg.event === ChatEvent.GET_ROOM_CHAT_MES) {
          setMessages(Array.isArray(msg.data) ? msg.data : []);
          return;
        }

        // --- XỬ LÝ TIN NHẮN REALTIME (Người khác gửi đến) ---
        if (msg.event === ChatEvent.SEND_CHAT) {
          const m = msg.data as ChatMessage | undefined;

          // Lấy giá trị hiện tại từ Ref
          const currentTarget = targetRef.current;
          const currentMode = modeRef.current;

          if (!m || !currentTarget) return;

          // Logic kiểm tra xem tin nhắn đến có thuộc cuộc trò chuyện đang mở không

          // Case 1: Chat 1-1 (People) - Server trả về type: 0
          if (currentMode === "people" && m.type === 0) {
            // Chỉ hiện nếu người gửi (m.name) chính là người mình đang chat (target)
            if (m.name === currentTarget) {
              setMessages((prev) => [...prev, m]);
            }
          }

          // Case 2: Chat Room - Server trả về type: 1
          else if (currentMode === "room" && m.type === 1) {
            // Với room, tin nhắn phải có 'to' trùng với tên phòng
            if (m.to === currentTarget) {
              setMessages((prev) => [...prev, m]);
            }
          }
        }
      });

      // Load danh sách user sau khi connect xong
      userService.getUserList();
    };

    initSocket();

    // Cleanup khi thoát trang
    return () => {
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      if (unsub) unsub();
    };
  }, []);

  // ----CHƯA TEST LẤY LỊCH SỬ CHAT-----
  // chọn chat -> load lịch sử
  useEffect(() => {
    if (!target) return;

    if (mode === "people") {
      peopleService.getPeopleMessages(target, 1);
    } else {
      // room cần join trước để tránh lỗi
      roomService.joinRoom(target);
      roomService.getRoomMessages(target, 1);
    }
  }, [mode, target]);

  const onSelectPeople = (username: string) => {
    setMessages([]);
    setMode("people");
    setTarget(username);
  };

  const onSelectRoom = (roomName: string) => {
    setMessages([]);
    setMode("room");
    setTarget(roomName);
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <LeftSideBar
        me={me}
        users={users.filter((u) => u.name !== me)}
        selectedMode={mode}
        selectedTarget={target}
        onRefreshUsers={() => userService.getUserList()}
        onSelectPeople={onSelectPeople}
        onSelectRoom={onSelectRoom}
      />

      <div style={{ flex: 1 }}>
        <MainChat me={me}
                  mode={mode}
                  target={target}
                  messages={messages}
                  onSendMessage={handleManualAddMessage}/>
      </div>
    </div>
  );
}
