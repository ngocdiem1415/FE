import { useState } from "react";
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
    addMessageManually
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
        <LeftSideBar
            me={me}
            users={users.filter((u) => u.name !== me)}
            selectedTarget={target}
            onSelectPeople={onSelectPeople}
            onSelectRoom={onSelectRoom}
        />

        <div style={{ flex: 1, position: "relative" }}>
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