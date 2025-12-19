const WS_URL = "wss://chat.longapp.site/chat/chat";

let socket: WebSocket | null = null;

export function connectSocket(
  onMessage: (data: any) => void
) {
  if (socket) return;

  socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    console.log("WS connected");
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data);
  };

  socket.onerror = (err) => {
    console.error("WS error", err);
  };

  socket.onclose = () => {
    console.log("WS closed");
    socket = null;
  };
}

export function sendSocket(payload: any) {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(payload));
  }
}

export function closeSocket() {
  socket?.close();
}