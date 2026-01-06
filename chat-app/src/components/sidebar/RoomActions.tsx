import { useState } from "react";
import { roomService } from "../../services/roomApi";

type Props = {
  onSelectRoom: (roomName: string) => void;
};

export default function RoomActions({ onSelectRoom }: Props) {
  const [room, setRoom] = useState("");

  const create = () => {
    const name = room.trim();
    if (!name) return;
    roomService.createRoom(name);
    setRoom("");
  };

  return (
    <div>
      <h4 style={{ margin: "8px 0" }}>Room</h4>
      <input
        value={room}
        onChange={(e) => setRoom(e.target.value)}
        placeholder="room name..."
        style={{ width: "100%", padding: 10, boxSizing: "border-box" }}
      />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
            <button
                style={{
                    padding: "8px 24px",
                    cursor: "pointer",
                    minWidth: "100px"
                }}
                onClick={create}>
                Create
            </button>
        </div>
    </div>
  );
}
