// src/api/socketClient.ts
const WS_URL = "wss://chat.longapp.site/chat/chat";

let socket: WebSocket | null = null;
let connectPromise: Promise<void> | null = null;

type Handler = (data: any) => void;
const handlers = new Set<Handler>();

function isOpen(ws: WebSocket | null) {
  return ws && ws.readyState === WebSocket.OPEN;
}

/**
 * Connect WebSocket (singleton).
 * - If already OPEN -> resolve immediately
 * - If CONNECTING -> return same promise
 */
export function connectSocket(): Promise<void> {
  if (isOpen(socket)) return Promise.resolve();
  if (connectPromise) return connectPromise;

  connectPromise = new Promise<void>((resolve, reject) => {
    socket = new WebSocket(WS_URL);

    socket.onopen = () => {
      console.log("WS connected");
      resolve();
    };

    socket.onmessage = (e) => {
      try {
        const raw = typeof e.data === "string" ? e.data : String(e.data);
        const data = JSON.parse(raw);
        handlers.forEach((cb) => cb(data));
      } catch (err) {
        console.error("WS message parse error:", err, e.data);
      }
    };

    socket.onerror = () => {
      console.error("WS error");
      reject(new Error("WebSocket error"));
    };

    socket.onclose = () => {
      console.warn("WS closed");
      connectPromise = null;
      socket = null;
    };
  }).catch((err) => {
    // allow reconnect next time
    connectPromise = null;
    socket = null;
    throw err;
  });

  return connectPromise;
}

/**
 * Subscribe socket messages. Returns unsubscribe().
 */
export function onSocketMessage(cb: Handler) {
  handlers.add(cb);
  return () => handlers.delete(cb);
}

/**
 * Send payload via WS (must be connected).
 */
export function sendSocketSafe(payload: any) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    throw new Error("Socket not connected. Call connectSocket() first.");
  }
  socket.send(JSON.stringify(payload));
}

/**
 * Optional: close socket manually (if you need)
 */
export function closeSocket() {
  if (socket) socket.close();
  socket = null;
  connectPromise = null;
  handlers.clear();
}