import { useState } from "react";
import UserList from "./ListUser";
import RoomList from "./ListRoom";
import type { UserItem } from "../../types/userType";
import "./sidebar.css";

type TabProps = {
    me: string,
    selectedTarget: string | null,
    onSelectPeople: (name: string) => void,
    onSelectRoom: (name: string) => void,
    users?: UserItem[]
};

export default function SidebarTabs({ users, selectedTarget, onSelectPeople, onSelectRoom }: TabProps) {
    const [activeTab, setActiveTab] = useState<"user" | "room">("user");
    const safeUsers = users || [];
    const userCount = safeUsers.filter((i: any) => i.type === 0).length;
    const roomCount = safeUsers.filter((i: any) => i.type === 1).length;

    return (
        <div className="tabs-container">
            <div className="tabs-header">
                <button
                    onClick={() => setActiveTab("user")}
                    className={`tab-button ${activeTab === "user" ? "active-user" : ""}`}
                >
                    Users ({userCount})
                </button>
                <button
                    onClick={() => setActiveTab("room")}
                    className={`tab-button ${activeTab === "room" ? "active-room" : ""}`}
                >
                    Rooms ({roomCount})
                </button>
            </div>

            <div className="tabs-content">
                {activeTab === "user" ? (
                    <UserList
                        users={safeUsers}
                        selectedTarget={selectedTarget}
                        onSelectPeople={onSelectPeople}
                    />
                ) : (
                    <RoomList
                        rooms={safeUsers}
                        selectedTarget={selectedTarget}
                        onSelectRoom={onSelectRoom}
                    />
                )}
            </div>
        </div>
    );
}