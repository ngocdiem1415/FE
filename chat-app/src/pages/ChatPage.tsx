import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {connectSocket, onSocketMessage, closeSocket} from "../api/socketClient";
import {ChatEvent} from "../constants/chatEvents";
import { userService } from "../services/userService";
import { peopleService } from "../services/userService";
import { roomService } from "../services/roomApi";
import { relogin } from "../services/authApi.ts";
import { APP_ROUTES } from "../constants/routes";

import type { ChatMessage} from "../types/chatType";
import type { UserItem } from "../types/userType";
import type { WsResponse } from "../types/commonType";
import type { RoomData } from "../types/roomType";

import LeftSideBar from "../components/sidebar/LeftSideBar";
import MainChat from "../components/mainChat/MainChat";
import RightSideBar from "../components/rightSideBar/RightSideBar.tsx";

type ChatMode = "people" | "room";

export default function ChatPage() {
  const me = localStorage.getItem("user") || "";
  const savedReLoginCode = localStorage.getItem("reLoginCode");
  const navigate = useNavigate();

  const [users, setUsers] = useState<UserItem[]>([]);
  const [mode, setMode] = useState<ChatMode>("people");
  const [target, setTarget] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Refs để truy cập state mới nhất trong socket callback
  const modeRef = useRef<ChatMode>("people");
  const targetRef = useRef<string | null>(null);
  const isRedirectingRef = useRef(false);

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
    isRedirectingRef.current = false;

    const initSocket = async () => {
      // 1. Kết nối (Cookie session sẽ tự gửi đi)
      try {
        await connectSocket();
        console.log("Socket Connected!");
        if (me && savedReLoginCode) {
          console.log("Found re-login code, attempting to login...");
          await relogin(me, savedReLoginCode);
        } else {
          console.warn("No credentials found, redirecting to login.");
          navigate(APP_ROUTES.LOGIN);
        }
      } catch (err) {
        console.error("Lỗi kết nối ban đầu:", err);
        return;
      }

      // 2. KÍCH HOẠT HEARTBEAT
      heartbeatInterval = setInterval(async () => {

        // BỌC TRY-CATCH ĐỂ TRÁNH CRASH APP KHI MẤT MẠNG
        try {
          await userService.checkUserOnline(me);
          console.log("Sent Heartbeat...");
        } catch (error) {
          console.warn("Heartbeat lỗi: Socket đã mất kết nối. ", error);
          try {
            await connectSocket();

            if (me && savedReLoginCode) {
              relogin(me, savedReLoginCode);
              console.log("Đã gửi Re-login sau khi reconnect WS");
            }
          } catch (reconnectErr) {
            console.error("Reconnect thất bại:", reconnectErr);
          }
        }
      }, 60000);

      // 3. LẮNG NGHE TIN NHẮN TỪ SERVER
      unsub = onSocketMessage((raw) => {
        const msg = raw as WsResponse<any>;

        if (msg.status === "error") {
          if (!isRedirectingRef.current) {
            if (msg.event === ChatEvent.RE_LOGIN || msg.mes?.includes("User not Login")) {
              isRedirectingRef.current = true;
              alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
              localStorage.clear();
              navigate(APP_ROUTES.LOGIN);
            }
          }
          console.error("Socket Error:", msg.mes);
          return;
        }

        if (msg.event === ChatEvent.RE_LOGIN && msg.status === "success") {
          console.log("Re-login success!");
          if (msg.data?.RE_LOGIN_CODE) {
            localStorage.setItem("reLoginCode", msg.data.RE_LOGIN_CODE);
          }
          userService.getUserList();
          return;
        }

        // --- XỬ LÝ DANH SÁCH USER ---
        if (msg.event === ChatEvent.GET_USER_LIST) {
          setUsers(Array.isArray(msg.data) ? msg.data : []);
          return;
        }

        // --- XỬ LÝ LỊCH SỬ TIN NHẮN ---
        // -- people --
        if (msg.event === ChatEvent.GET_PEOPLE_CHAT_MES) {
          const list = Array.isArray(msg.data) ? msg.data : [];
          const sortedList = [...list].sort((a, b) => {
            return new Date(a.createAt || 0).getTime() - new Date(b.createAt || 0).getTime();
          });

          setMessages(sortedList);
          return;
        }

        // -- room --
        if ((msg.event === ChatEvent.JOIN_ROOM || msg.event === ChatEvent.GET_ROOM_CHAT_MES)
            && msg.status === "success") {

          const roomData = msg.data as RoomData;

          // Chỉ cập nhật nếu đúng là phòng đang mở (đề phòng mạng lag trả về phòng cũ)
          // if (roomData.name === targetRef.current) { // Optional: check kỹ hơn
          // console.log("Joined Room & Loaded Messages:", roomData.name);

          const list = roomData.chatData || [];
          const sortedList = [...list].sort((a, b) => {
            return new Date(a.createAt || 0).getTime() - new Date(b.createAt || 0).getTime();
          });

          setMessages(sortedList);
          // }
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

      closeSocket();
    };
  }, [me, savedReLoginCode, navigate]);

  // ----CHƯA TEST LẤY LỊCH SỬ CHAT-----
  // chọn chat -> load lịch sử
  useEffect(() => {
    if (!target) return;

    if (mode === "people") {
      peopleService.getPeopleMessages(target, 1);
    } else {
      // room cần join trước để tránh lỗi
      roomService.joinRoom(target);
      // roomService.getRoomMessages(target, 1);
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
        <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
            <LeftSideBar
                me={me}
                users={users.filter((u) => u.name !== me)}
                selectedTarget={target}
                onSelectPeople={onSelectPeople}
                onSelectRoom={onSelectRoom}
            />

            <div style={{ flex: 1, position: "relative" }}>
                <MainChat me={me} 
                          mode={mode} 
                          target={target} 
                          messages={messages}
                          onSendMessage={handleManualAddMessage}/>
            </div>
          <RightSideBar/>
        </div>
    );
}