const WS_URL = "wss://chat.longapp.site/chat/chat";

let socketClient: WebSocket | null = null;

export function connectSocket(
  onMessage: (data: any) => void
) {
  if (socketClient) return;

  socketClient = new WebSocket(WS_URL);

  socketClient.onopen = () => {
    console.log("WS connected");
  };

  socketClient.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data);
  };

  socketClient.onerror = (err) => {
    console.error("WS error", err);
  };

  socketClient.onclose = () => {
    console.log("WS closed");
    socketClient = null;
  };
}

export function sendSocket(payload: any) {
  if (socketClient?.readyState === WebSocket.OPEN) {
    socketClient.send(JSON.stringify(payload));
  }
}

export function closeSocket() {
  socketClient?.close();
}