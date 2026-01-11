import React from "react";
import "./rightSideBar.css";
import GroupMembers from "./GroupMembers";
import GroupMedia from "./GroupMedia";
import GroupFiles from "./GroupFiles";
import type { RoomData } from "../../types/roomType";
import type { ChatMessage } from "../../types/chatType";

type Props = {
    mode: "people" | "room";
    target: string | null;
    roomData: RoomData | null; // Dữ liệu phòng (nếu mode là room)
    messages: ChatMessage[]; // Lịch sử chat (để lọc ảnh/file)
};

const RightSideBar: React.FC<Props> = ({ mode, target, roomData, messages }) => {

    if (!target) return null;

    return (
        <div className="rightSideBar">
            <div className="rsb-header">
                <h3 className="rsb-title">
                    {mode === "room" ? "Thông tin nhóm" : "Thông tin hội thoại"}
                </h3>
                <img
                    src={mode === "room" ? "/img/avt_group.jpg" : "/img/anotherAvatar.jpg"}
                    alt="Avatar"
                    className="rsb-avatar"
                />
                <p style={{marginTop: 5, color: "#666"}}>{target}</p>
            </div>

            {mode === "room" && roomData && (
                <GroupMembers
                    members={roomData.userList || []}
                    ownerName={roomData.own}
                />
            )}
            <GroupMedia messages={messages} />
            <GroupFiles messages={messages} />
        </div>
    );
};

export default RightSideBar;