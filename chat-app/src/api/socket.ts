const WS_URL = "wss://chat.longapp.site/chat/chat";

let socket: WebSocket | null = null;
let messageQueue: any[] = [];
let onMessageCallback: ((data: any) => void) | null = null;

export function connectSocket(onMessage: (data: any) => void) {
  // luôn update callback (tránh stale closure)
  onMessageCallback = onMessage;

  if (socket) return;

  socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    console.log("WS connected");

    // gửi tất cả message đang chờ
    messageQueue.forEach((msg) => {
      socket?.send(JSON.stringify(msg));
    });
    messageQueue = [];
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessageCallback?.(data);
    } catch (e) {
      console.error("Invalid WS message", event.data);
    }
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
  } else {
    // WS chưa sẵn sàng → đẩy vào queue
    messageQueue.push(payload);
  }
}

export function closeSocket() {
  socket?.close();
  socket = null;
  messageQueue = [];
}
