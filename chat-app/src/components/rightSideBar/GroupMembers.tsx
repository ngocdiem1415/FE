import React, { useState } from "react";
import type { RoomMember } from "../../types/roomType";

type Props = {
    members: RoomMember[];
    ownerName: string; // Tên của người tạo phòng (own)
};

const GroupMembers: React.FC<Props> = ({ members, ownerName }) => {
    const [isOpen, setIsOpen] = useState(true);
    const me = localStorage.getItem("user") || "";

    return (
        <div className="rsb-section">
            <div className="rsb-section-title" onClick={() => setIsOpen(!isOpen)}>
                <span>Thành viên nhóm</span>
                <i className={`fa-solid fa-chevron-${isOpen ? 'down' : 'right'}`}></i>
            </div>

            {isOpen && (
                <div className="rsb-section-content">
                    {members.length === 0 ? (
                        <p className="rsb-empty-text">Chưa có thành viên</p>
                    ) : (
                        members.map((mem) => {
                            const isMe = mem.name === me;

                            return (
                                <div key={mem.id} className="rsb-member-item">
                                    <img
                                        src={isMe ? "/img/avatar.jpg" : "/img/anotherAvatar.jpg"}
                                        alt="avt"
                                        className="rsb-member-avatar"
                                    />
                                    <div className="rsb-member-info">
                                        <span className="rsb-member-name">
                                            {mem.name}
                                        </span>

                                        {mem.name === ownerName && (
                                            <span className="rsb-role-admin">
                                                <i className="fa-solid fa-key" style={{marginRight: 4}}></i>
                                                Trưởng nhóm
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
};

export default GroupMembers;