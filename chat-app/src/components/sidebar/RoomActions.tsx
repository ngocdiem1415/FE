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
  };

  const join = () => {
    const name = room.trim();
    if (!name) return;
    roomService.joinRoom(name);
    onSelectRoom(name);
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
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button style={{ flex: 1 }} onClick={create}>
          Create
        </button>
        <button style={{ flex: 1 }} onClick={join}>
          Join
        </button>
      </div>
    </div>
  );
}
