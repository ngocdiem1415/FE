import React, { useEffect, useMemo, useRef, useState } from "react";
import "./mainChat.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import type { ChatMessage } from "../../types/chatType";
import { chatService } from "../../services/chatService";
import { formatToLocalTime } from "../../utils/dateUtil";

type ChatMode = "people" | "room";

type Props = {
  me: string;
  mode: ChatMode;
  target: string | null;
  messages: ChatMessage[];
  onSendMessage: (msg: ChatMessage) => void; //Tự cập nhật giao diện ngay khi bấm gửi
};

const MainChat: React.FC<Props> = ({ me, mode, target, messages, onSendMessage }) => {
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const title = useMemo(() => {
    if (!target) return "";
    return mode === "people" ? target : `Room: ${target}`;
  }, [mode, target]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    if (!target) return;
    const m = text.trim();
    if (!m) return;

    //--FLOW--
    //1. Gửi request lên server
    if (mode === "people") chatService.sendToPeople(target, m);
    else chatService.sendToRoom(target, m);

    //2. Tự tạo tin nhắn để hiển thị ngay lập tức (vì server không phản hồi cho người gửi)
    const nowISO = new Date().toISOString();
    const serverStyleTime = nowISO.replace("T", " ").split(".")[0];
    const optimisticMsg: ChatMessage = {
      id: Date.now(), // ID tạm
      name: me,
      type: mode === "people" ? 0 : 1,
      to: target,
      mes: m,
      createAt: serverStyleTime,
    };

    //3. Cập nhật UI
    onSendMessage(optimisticMsg);
    setText("");
  };

  if (!target) {
    return (
      <div className="mainChat">
        <p className="noConversation">Hãy chọn một cuộc trò chuyện</p>
      </div>
    );
  }

  return (
    <div className="mainChat">
      <React.Fragment>
        <div className="topChat">
          <div className="user">
            <img src="/img/avatar.jpg" alt="avatar" className="avatar" />
            <div className="texts">
              <span>{title}</span>
              <p>Đang hoạt động</p>
            </div>
          </div>
          <div className="icon">
            <i className="fa-solid fa-circle-info fa-xl" style={{ color: "#333333" }}></i>
          </div>
        </div>

        <div className="centerChat">
          {messages.map((msg) => {
            const isOwn = msg.name === me;
            return (
              <div key={msg.id} className={`messages ${isOwn ? "own" : ""}`}>
                {!isOwn && <img src="/img/avatar.jpg" alt="avatar" className="avatar" />}
                <div className="texts">
                  <p className="content">{msg.mes}</p>
                  <span>{formatToLocalTime(msg.createAt) ?? ""}</span>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef}></div>
        </div>

        <div className="bottomChat">
          <input
            type="text"
            placeholder="Nhập tin nhắn..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
          <div className="emoji">
            <i className="fa-regular fa-face-smile fa-xl"></i>
          </div>
          <button className="sendButton" onClick={send}>
            Gửi
          </button>
        </div>
      </React.Fragment>
    </div>
  );
};

export default MainChat;
