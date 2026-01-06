import type { UserItem } from "../../types/userType";
import "./listStyles.css";

type RoomListProps = {
    rooms: UserItem[];
    selectedTarget: string | null;
    onSelectRoom: (roomName: string) => void;
};

export default function RoomList({ rooms, selectedTarget, onSelectRoom }: RoomListProps) {
    const roomsOnly = rooms.filter(item => item.type === 1);

    return (
        <div className="list-section">
            <div className="scroll-box">
                {roomsOnly.map((room) => (
                    <div
                        key={room.name}
                        onClick={() => onSelectRoom(room.name)}
                        className={`list-item is-room ${selectedTarget === room.name ? 'active' : ''}`}
                    >
                        <div className="item-name"># {room.name}</div>
                        <div className="item-time">Created: {room.actionTime}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}