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