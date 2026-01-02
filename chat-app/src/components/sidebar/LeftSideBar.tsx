import { useMemo, useState } from "react";
import RoomActions from "./RoomActions";
import UserInfor from "./UserInfor";
import type { UserItem } from "../../types/chatType";

type Props = {
  me: string;
  users: UserItem[];
  selectedMode: "people" | "room";
  selectedTarget: string | null;

  onRefreshUsers: () => void;
  onSelectPeople: (username: string) => void;
  onSelectRoom: (roomName: string) => void;
};

export default function LeftSideBar({
  me,
  users,
  selectedMode,
  selectedTarget,
  onRefreshUsers,
  onSelectPeople,
  onSelectRoom,
}: Props) {
  const [q, setQ] = useState("");

  const filteredUsers = useMemo(() => {
    const keyword = q.trim().toLowerCase();
    if (!keyword) return users;

    return users.filter((u) => u.name.toLowerCase().includes(keyword));
  }, [q, users]);

  return (
    <div style={{ width: 300, borderRight: "1px solid #eee", padding: 12 }}>
      <UserInfor me={me} />

      <RoomActions onSelectRoom={onSelectRoom} />

      <hr style={{ margin: "12px 0" }} />

      {/* Header + refresh */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h4 style={{ margin: 0 }}>Users</h4>
        <button onClick={onRefreshUsers}>Refresh</button>
      </div>

      {/* Search box */}
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Tìm user..."
        style={{
          width: "100%",
          marginTop: 10,
          padding: 10,
          borderRadius: 10,
          border: "1px solid #ddd",
          boxSizing: "border-box",
        }}
      />

      {/* Result count (optional) */}
      <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
        {filteredUsers.length} kết quả
      </div>

      {/* User list */}
      <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8, overflow: "auto" }}>
        {filteredUsers.map((u) => {
          const active = selectedMode === "people" && selectedTarget === u.name;
          return (
            <button
              key={u.name}
              onClick={() => onSelectPeople(u.name)}
              style={{
                textAlign: "left",
                padding: 10,
                borderRadius: 10,
                border: "1px solid #ddd",
                background: active ? "#eef2ff" : "white",
                cursor: "pointer",
              }}
            >
              <div style={{ fontWeight: 700 }}>{u.name}</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>{u.actionTime}</div>
            </button>
          );
        })}

        {filteredUsers.length === 0 && (
          <div style={{ marginTop: 10, fontSize: 13, opacity: 0.7 }}>
            Không tìm thấy user phù hợp.
          </div>
        )}
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import UserInfor from './UserInfor';
import './leftSidebar.css';

interface ChatItem {
    name: string;
    page: number;
    isExit: boolean;
}

const LeftSidebar = () => {
    const [chatList, setChatList] = useState<ChatItem[]>([]);
    const [activeChat, setActiveChat] = useState<string>('');

    // Giả lập gọi API GET_USER_LIST khi component load
    useEffect(() => {
        // Thực tế: socket.send({ action: "onchat", data: { event: "GET_USER_LIST" } })
        const mockData: ChatItem[] = [
            { name: "Ngọc Diễm (Bạn)", page: 0, isExit: true },
            { name: "Thanh Dịu", page: 0, isExit: true },
        ];
        setChatList(mockData);
    }, []);

    const handleCreateRoom = () => {
        const roomName = prompt("Nhập tên phòng muốn tạo:");
        if (roomName) {
            // Thực tế: gửi socket CREATE_ROOM
            console.log("Yêu cầu tạo phòng:", roomName);
        }
    };

    const handleJoinChat = (item: ChatItem) => {
        setActiveChat(item.name);
        if (item.page === 1) {
            console.log(`Gửi lệnh JOIN_ROOM cho phòng: ${item.name}`);
        } else {
            console.log(`Bắt đầu chat riêng với: ${item.name}`);
        }
    };

    return (
        <aside className="left-sidebar">
            <div className="sidebar-header">
                <div className="current-user-box">
                    <UserInfor isOnline={true} isExit={true} />
                </div>
                <button className="btn-add-room" onClick={handleCreateRoom} title="Tạo phòng mới">
                    +
                </button>
            </div>

            {/* Danh sách Chat */}
            <div className="sidebar-content">
                <div className="list-section">
                    <p className="section-label">Phòng Chat</p>
                    {chatList.filter(i => i.page === 1).map((room, idx) => (
                        <div
                            key={idx}
                            className={`chat-item-wrapper ${activeChat === room.name ? 'active' : ''}`}
                            onClick={() => handleJoinChat(room)}
                        >
                            <UserInfor username={room.name} isOnline={true} isExit={room.isExit} />
                        </div>
                    ))}
                </div>

                <div className="list-section">
                    <p className="section-label">Bạn bè</p>
                    {chatList.filter(i => i.page === 0).map((user, idx) => (
                        <div
                            key={idx}
                            className={`chat-item-wrapper ${activeChat === user.name ? 'active' : ''}`}
                            onClick={() => handleJoinChat(user)}
                        >
                            <UserInfor username={user.name} isOnline={user.isExit} isExit={user.isExit} />
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    );
};

export default LeftSidebar;