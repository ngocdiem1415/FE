// import { UserItem } from "../../types/chatType";

type RoomListProps = {
    // rooms: UserItem[];
    selectedTarget: string | null;
    onSelectRoom: (roomName: string) => void;
};

export default function RoomList({ rooms, selectedTarget, onSelectRoom }: RoomListProps) {
    // Lọc lấy danh sách phòng (type 1)
    const roomsOnly = rooms.filter(item => item.type === 1);

    return (
        <div className="list-section">
            <h4 style={{ margin: "16px 0 8px" }}>Rooms ({roomsOnly.length})</h4>
            <div className="scroll-box" style={{ maxHeight: "300px", overflowY: "auto" }}>
                {roomsOnly.map((room) => (
                    <div
                        key={room.name}
                        onClick={() => onSelectRoom(room.name)}
                        style={{
                            padding: "10px",
                            marginBottom: "6px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            border: "1px solid",
                            borderColor: selectedTarget === room.name ? "#10b981" : "#eee",
                            backgroundColor: selectedTarget === room.name ? "#ecfdf5" : "#fff"
                        }}
                    >
                        <div style={{ fontWeight: 700, color: "#065f46" }}># {room.name}</div>
                        <div style={{ fontSize: "11px", color: "#999" }}>Created: {room.actionTime}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}