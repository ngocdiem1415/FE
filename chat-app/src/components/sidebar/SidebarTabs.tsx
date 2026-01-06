import { useState } from "react";
import UserList from "./ListUser";
import RoomList from "./ListRoom";

export default function SidebarTabs({ users, selectedTarget, onSelectPeople, onSelectRoom }: any) {
    const [activeTab, setActiveTab] = useState<"user" | "room">("user");
    const userCount = users.filter((i: any) => i.type === 0).length;
    const roomCount = users.filter((i: any) => i.type === 1).length;

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <div style={{ display: "flex", backgroundColor: "#f9fafb" }}>
                <button
                    onClick={() => setActiveTab("user")}
                    style={{
                        flex: 1, padding: "12px", cursor: "pointer", border: "none",
                        borderBottom: activeTab === "user" ? "3px solid #4f46e5" : "1px solid #eee",
                        color: activeTab === "user" ? "#4f46e5" : "#666",
                        fontWeight: activeTab === "user" ? "bold" : "normal"
                    }}
                >
                    Users ({userCount})
                </button>
                <button
                    onClick={() => setActiveTab("room")}
                    style={{
                        flex: 1, padding: "12px", cursor: "pointer", border: "none",
                        borderBottom: activeTab === "room" ? "3px solid #10b981" : "1px solid #eee",
                        color: activeTab === "room" ? "#10b981" : "#666",
                        fontWeight: activeTab === "room" ? "bold" : "normal"
                    }}
                >
                    Rooms ({roomCount})
                </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
                {activeTab === "user" ? (
                    <UserList users={users} selectedTarget={selectedTarget} onSelectPeople={onSelectPeople} />
                ) : (
                    <RoomList rooms={users} selectedTarget={selectedTarget} onSelectRoom={onSelectRoom} />
                )}
            </div>
        </div>
    );
}