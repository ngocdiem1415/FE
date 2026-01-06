// src/api/socketClient.ts
const WS_URL = "wss://chat.longapp.site/chat/chat";

let socket: WebSocket | null = null;
let connectPromise: Promise<void> | null = null;

type Handler = (data: any) => void;
const handlers = new Set<Handler>();

// ---- Queue: giữ các message nếu WS chưa open
const sendQueue: any[] = [];
const MAX_QUEUE = 200;

// ---- Reconnect control
let reconnectTimer: any = null;
let reconnectAttempts = 0;
const RECONNECT_BASE_DELAY = 500; // ms
const RECONNECT_MAX_DELAY = 8000; // ms

function isOpen(ws: WebSocket | null) {
  return ws && ws.readyState === WebSocket.OPEN;
}

function clearReconnectTimer() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
}

function scheduleReconnect() {
  if (reconnectTimer) return;

  // exponential backoff
  const delay = Math.min(
    RECONNECT_MAX_DELAY,
    RECONNECT_BASE_DELAY * Math.pow(2, reconnectAttempts)
  );

  reconnectAttempts++;

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connectSocket().catch(() => {
      // nếu connect fail, scheduleReconnect sẽ bị gọi lại trong catch/onclose
      scheduleReconnect();
    });
  }, delay);
}

function flushQueue() {
  if (!isOpen(socket)) return;

  while (sendQueue.length > 0) {
    const payload = sendQueue.shift();
    try {
      socket!.send(JSON.stringify(payload));
    } catch (e) {
      // nếu gửi fail thì đẩy lại vào đầu queue và dừng
      sendQueue.unshift(payload);
      break;
    }
  }
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
      reconnectAttempts = 0; // reset backoff
      clearReconnectTimer();
      resolve();

      // gửi lại các message đang chờ
      flushQueue();
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
      // reject connectPromise để lần sau gọi connectSocket() được reconnect
      reject(new Error("WebSocket error"));
    };

    socket.onclose = () => {
      console.warn("WS closed");
      connectPromise = null;
      socket = null;

      // tự reconnect
      scheduleReconnect();
    };
  }).catch((err) => {
    // allow reconnect next time
    connectPromise = null;
    socket = null;

    // schedule reconnect khi connect fail
    scheduleReconnect();
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
 * Send payload via WS (throws if not connected) - giữ lại nếu bạn muốn strict.
 */
export function sendSocket(payload: any) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    throw new Error("Socket not connected. Call connectSocket() first.");
  }
  socket.send(JSON.stringify(payload));
}

/**
 * ✅ Send an toàn:
 * - Nếu WS đang OPEN -> send ngay
 * - Nếu WS chưa OPEN -> đưa vào queue + tự connect
 * => KHÔNG throw, không crash app
 */
export async function sendSocketSafe(payload: any) {
  if (isOpen(socket)) {
    socket!.send(JSON.stringify(payload));
    return;
  }

  // queue lại (giới hạn)
  if (sendQueue.length >= MAX_QUEUE) sendQueue.shift();
  sendQueue.push(payload);

  // đảm bảo có connect
  try {
    await connectSocket();
    flushQueue();
  } catch {
    // connect fail thì đã scheduleReconnect rồi
  }
}

/**
 * Optional: close socket manually (if you need)
 */
export function closeSocket() {
  clearReconnectTimer();
  reconnectAttempts = 0;

  if (socket) socket.close();
  socket = null;
  connectPromise = null;
  handlers.clear();

  // nếu bạn muốn: xóa queue luôn
  sendQueue.length = 0;
}
