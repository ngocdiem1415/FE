import { useState } from "react";
import "../styles/ChatPage.css";
import LeftSideBar from "../components/sidebar/LeftSideBar";
import MainChat from "../components/mainChat/MainChat";
import RightSideBar from "../components/rightSideBar/RightSideBar";
import useChatSocket, { type ChatMode } from "../hooks/useChatSocket";

function ChatPage() {
  const me = localStorage.getItem("user") || "";

  const [mode, setMode] = useState<ChatMode>("people");
  const [target, setTarget] = useState<string | null>(null);
  const [showRightBar, setShowRightBar] = useState(true);

  const {
    users,
    messages,
    currentRoomData,
    isTargetOnline,
    addMessageManually,
    isConnected
  } = useChatSocket(mode, target);

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
        {/* HIỂN THỊ THÔNG BÁO MẤT KẾT NỐI */}
        {!isConnected && (
            <div className="connection-overlay">
              <div className="spinner"></div>
              <span className="overlay-text">Mất kết nối. Đang thử lại...</span>
            </div>
        )}
        <LeftSideBar
            me={me}
            users={users.filter((u) => u.name !== me)}
            selectedTarget={target}
            onSelectPeople={onSelectPeople}
            onSelectRoom={onSelectRoom}
        />

        <div style={{ flex: 1, position: "relative", pointerEvents: isConnected ? 'auto' : 'none', opacity: isConnected ? 1 : 0.7 }}>
          <MainChat
              me={me}
              mode={mode}
              target={target}
              messages={messages}
              onSendMessage={addMessageManually}
              isOnline={isTargetOnline}
              onToggleInfo={() => setShowRightBar((prev) => !prev)}
          />
        </div>

        {showRightBar && target && (
            <RightSideBar
                mode={mode}
                target={target}
                roomData={currentRoomData}
                messages={messages}
            />
        )}
      </div>
  );
}

export default ChatPage;