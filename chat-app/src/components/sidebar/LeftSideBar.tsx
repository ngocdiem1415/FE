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
