import type {UserItem} from "../../types/userType";
import "./listStyles.css";
import {formatToLocalTime} from "../../utils/dateUtil.ts";

type RoomListProps = {
    rooms: UserItem[];
    selectedTarget: string | null;
    onSelectRoom: (roomName: string) => void;
};

export default function RoomList({rooms, selectedTarget, onSelectRoom}: RoomListProps) {
    const roomsOnly = rooms.filter(item => item.type === 1);

    const formatActivityStatus = (serverTime: string | undefined) => {
        if (!serverTime) return "Không rõ hoạt động";

        // Tính khoảng cách thời gian
        const isoTime = serverTime.replace(" ", "T") + "Z";
        const lastActiveDate = new Date(isoTime);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - lastActiveDate.getTime()) / 1000);

        // 1. Nếu dưới 24 giờ thì tính theo "phút/giờ trước"
        if (diffInSeconds < 60) return "Vừa hoạt động";

        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} giờ trước`;

        // 2. Nếu trên 24 giờ: Gọi thẳng hàm formatToLocalTime của bạn
        return formatToLocalTime(serverTime);
    };

    return (
        <div className="scroll-box">
            {roomsOnly.length > 0 ? (
                roomsOnly.map((room) => (
                    <div
                        key={room.name}
                        onClick={() => onSelectRoom(room.name)}
                        className={`list-item is-room ${selectedTarget === room.name ? 'active' : ''}`}
                    >
                        <div className="avatar-room">
                            <img src="/img/avt_group.jpg" alt="avatar"/>
                            <div className="item-name">{room.name}</div>
                        </div>
                        <div className="item-time">
                            {formatActivityStatus(room.actionTime)}
                        </div>
                    </div>
                ))
            ) : (
                <div className="empty-message">No rooms available</div>
            )}
        </div>
    );
}
