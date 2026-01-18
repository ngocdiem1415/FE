import {useState} from "react";
import {roomService} from "../../services/roomApi";
import "./roomAction.css";

export default function RoomActions({onSelectRoom}) {
    const [room, setRoom] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const create = () => {
        const name = room.trim();
        if (!name) return;
        roomService.createRoom(name);
    };

    //xử lí báo lỗi => chuyển về service
    const join = () => {
        const name = room.trim();
        if (!name) return;
        roomService.joinRoom(name);
        onSelectRoom(name);
    };

    return (
        <div className="room-actions-wrapper">
            {/* Click vào header để đóng/mở */}
            <div className="room-header" onClick={() => setIsOpen(!isOpen)}>
                <h4 className="titleRoom">Room</h4>
                <i className={`fas fa-chevron-down toggle-icon ${isOpen ? 'open' : ''}`}></i>
            </div>

            {/* Chỉ hiển thị nội dung khi isOpen là true */}
            {isOpen && (
                <div className="room-content-expand">
                    <input
                        className="input-name-room"
                        value={room}
                        onChange={(e) => setRoom(e.target.value)}
                        placeholder="Tên phòng..."
                    />
                    <div className="room-buttons-container">
                        <button className="btn-action" onClick={create}>
                            Create
                        </button>
                        <button className="btn-action" onClick={join}>
                            Join
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
