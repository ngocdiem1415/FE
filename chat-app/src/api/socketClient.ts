// src/api/socketClient.ts
import {ACTION_NAME} from "../types/chatType.ts";
import {ChatEvent} from "../constants/chatEvents.ts";

const WS_URL = "wss://chat.longapp.site/chat/chat";

let socket: WebSocket | null = null;
let connectPromise: Promise<void> | null = null;

let isIntentionalClose = false;
let isAuthError = false;

type ConnectionHandler = (isConnected: boolean) => void;
const connectionListeners = new Set<ConnectionHandler>();

export function onConnectionChange(cb: ConnectionHandler) {
    connectionListeners.add(cb);
    cb(isOpen(socket));
    return () => connectionListeners.delete(cb);
}

function notifyConnectionChange(status: boolean) {
    connectionListeners.forEach(cb => cb(status));
}

type Handler = (data: any) => void;
const handlers = new Set<Handler>();

let sessionExpiredHandler: (() => void) | null = null;
export const setSessionExpiredHandler = (handler: () => void) => {
    sessionExpiredHandler = handler;
};

const sendQueue: any[] = [];
const MAX_QUEUE = 200;

//reconnect
let reconnectTimer: any = null;
let reconnectAttempts = 0;
const RECONNECT_BASE_DELAY = 1000;
const RECONNECT_MAX_DELAY = 10000;

//heart beat
let heartbeatTimer: any = null;
const HEARTBEAT_INTERVAL = 30000;
let missedHeartbeats = 0;
const MAX_MISSED_HEARTBEATS = 3;

const getPingPayload = () => {
    const me = localStorage.getItem("user");
    if (!me) return null;
    return {
        action: ACTION_NAME,
        data: {
            event: ChatEvent.CHECK_USER_EXIST,
            data: {user: me}
        }
    };
};

function isOpen(ws: WebSocket | null): boolean {
    return !!(ws && ws.readyState === WebSocket.OPEN);
}

/**
 * HEARTBEAT
 * - if websocket already open but server not response (in case of network failure)
 * => If you call the API three times and receive no response, try reconnecting.*/
function startHeartbeat() {
    stopHeartbeat();
    missedHeartbeats = 0;

    heartbeatTimer = setInterval(() => {
        if (!isOpen(socket)) return;

        // 1. Kiểm tra xem server có im lặng quá lâu không
        if (missedHeartbeats >= MAX_MISSED_HEARTBEATS) {
            console.warn(`Mạng yếu: Server không phản hồi ${missedHeartbeats} lần. Đang tái kết nối...`);
            socket?.close();
            return;
        }

        // 2. Gửi Ping
        try {
            const payload = getPingPayload();
            if (!payload) {
                return;
            }
            missedHeartbeats++;
            socket?.send(JSON.stringify(payload));
            console.log("Sent heartbeat...");
        } catch (e) {
            console.warn("Ping failed", e);
        }
    }, HEARTBEAT_INTERVAL);
}

function stopHeartbeat() {
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    heartbeatTimer = null;
    missedHeartbeats = 0;
}

//Khi nhận bất kì message nào của server trả về thì reset lại missedHeartbeats
function resetHeartbeatCounter() {
    if (missedHeartbeats > 0) {
        missedHeartbeats = 0;
    }
}

/**
 * RECONNECT
 * - If you actively disconnect, ignore this.
 * - If the socket is suddenly disconnected =>  reconnect.*/
function scheduleReconnect() {
    if (isIntentionalClose) return; // Nếu chủ động đóng thì không reconnect

    if (isAuthError) {
        console.log("Dừng Reconnect do lỗi xác thực (Auth Error).");
        return;
    }

    if (reconnectTimer) return;

    const delay = Math.min(RECONNECT_MAX_DELAY, RECONNECT_BASE_DELAY * Math.pow(2, reconnectAttempts));
    console.log(`WS: Mất kết nối. Thử lại sau ${delay}ms... (Lần ${reconnectAttempts + 1})`);

    reconnectAttempts++;
    reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        // Kiểm tra lại mạng trước khi connect
        if (navigator.onLine) {
            connectSocket().catch(() => scheduleReconnect());
        } else {
            // Nếu trình duyệt đang offline, chờ sự kiện 'online' của window hoặc thử lại sau
            scheduleReconnect();
        }
    }, delay);
}

function attemptAutoRelogin() {
    const user = localStorage.getItem("user");
    const code = localStorage.getItem("reLoginCode");

    if (user && code) {
        console.log("Auto-Relogin triggered on socket open...");
        const payload = {
            action: ACTION_NAME,
            data: {
                event: ChatEvent.RE_LOGIN,
                data: { user, code }
            }
        };
        socket?.send(JSON.stringify(payload));
    } else {
        console.log("No credentials found. Waiting for manual login.");
    }
}

/**
 * Connect WebSocket (singleton).
 * - If already OPEN -> resolve immediately
 * - If CONNECTING -> return same promise
 */
function handleSocketOpen(){
    console.log("WS connected");
    notifyConnectionChange(true);
    isAuthError = false;
    reconnectAttempts = 0;
    startHeartbeat();
    flushQueue();
    attemptAutoRelogin();
}

function handleSocketMessage(e: MessageEvent){
    resetHeartbeatCounter();
    try {
        const raw = typeof e.data === "string" ? e.data : String(e.data);
        const msg = JSON.parse(raw);

        if (msg.status === "success" && (msg.event === ChatEvent.LOGIN || msg.event === ChatEvent.RE_LOGIN)) {
            const newCode = msg.data?.RE_LOGIN_CODE || msg.data?.code;
            if (newCode) {
                localStorage.setItem("reLoginCode", newCode);
                flushQueue();
            }
        }

        // Check Session Expired
        if (msg.status === "error" &&
            (msg.event === ChatEvent.RE_LOGIN || msg.mes?.includes("User not Login"))) {
            if (msg.event === ChatEvent.CHECK_USER_ONLINE) {
                return;
            }
            if (!localStorage.getItem("user")) {
                return;
            }
            console.warn("Session Expired - Closing Socket intentionally");
            isAuthError = true;
            localStorage.removeItem("reLoginCode");
            if (sessionExpiredHandler) sessionExpiredHandler();
            closeSocket();
            return;
        }

        handlers.forEach((cb) => cb(msg));
    } catch (err) {
        console.error("WS message parse error:", err, e.data);
    }
}

function handleSocketClose(event: CloseEvent){
    connectPromise = null;
    socket = null;
    stopHeartbeat();
    notifyConnectionChange(false);

    // Case 1: Người dùng chủ động Logout hoặc gọi closeSocket()
    if (isIntentionalClose) {
        console.log("WS Closed intentionally (User logout/Manual close).");
        return;
    }

    // Case 2. Lỗi xác thực do người dùng chưa đăng nhập hoặc mã relogin hết hạn
    if (isAuthError) {
        console.warn("Lỗi xác thực (Token không hợp lệ).");
        return;
    }

    //Case 3. Server Crash/Bug (thường xảy ra khi gọi các api liên quan đến room)
    if (event.code === 1000) {
        console.warn("Lỗi Server -> Đang Reconnect...");
        scheduleReconnect();
        return;
    }

    // Case 4. Mất mạng hoặc Server lỗi (Code 1006 - Abnormal Closure)
    console.warn(`WS Closed unexpectedly. Code: ${event.code}, Reason: ${event.reason}`);
    scheduleReconnect();
}

export function connectSocket(): Promise<void> {
    if (isOpen(socket)) {
        notifyConnectionChange(true);
        return Promise.resolve();
    }
    if (connectPromise) return connectPromise;

    isIntentionalClose = false;

    connectPromise = new Promise<void>((resolve, reject) => {
        socket = new WebSocket(WS_URL);
        socket.onopen = () => {
            handleSocketOpen()
            resolve();
        };

        socket.onmessage = handleSocketMessage;
        socket.onclose = handleSocketClose;

        socket.onerror = (err) => {
            console.error("WS Error: " + err);
            if (socket?.readyState === WebSocket.CONNECTING) {
                reject(new Error("Connection failed"));
            }
        };
    }).catch((err) => {
        connectPromise = null;
        socket = null;
        stopHeartbeat();
        notifyConnectionChange(false);
        scheduleReconnect();
        throw err;
    });

    return connectPromise;
}

function flushQueue() {
    if (!isOpen(socket)) return;
    const queueLength = sendQueue.length;

    for (let i = 0; i < queueLength; i++) {
        const payload = sendQueue[0];
        const eventType = payload?.data?.event;

        // 1. Kiểm tra xem đây có phải là tin nhắn Auth không?
        const isAuthMessage =
            eventType === ChatEvent.LOGIN ||
            eventType === ChatEvent.REGISTER ||
            eventType === ChatEvent.RE_LOGIN;

        // 2. Kiểm tra xem đã đăng nhập chưa?
        const hasCredentials = !!localStorage.getItem("reLoginCode");

        if (isAuthMessage || hasCredentials) {
            sendQueue.shift();
            try {
                socket!.send(JSON.stringify(payload));
            } catch (e) {
                sendQueue.unshift(payload);
                console.log(e);
                break;
            }
        } else {
            break;
        }
    }
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
    // Nếu WS đang mở => gửi request luôn
    if (isOpen(socket)) {
        socket!.send(JSON.stringify(payload));
        return;
    }

    //Nếu WS chưa mở => xếp vào hàng đợi
    if (sendQueue.length >= MAX_QUEUE) sendQueue.shift();
    sendQueue.push(payload);

    // Kiểm tra xem hệ thống có đang tự phục hồi không
    // Nếu đang chờ Reconnect hoặc đang trong quá trình Connect
    // -> return
    if (reconnectTimer || connectPromise) {
        console.log("Đang chờ Reconnect/Connect => Đã xếp request vào hàng đợi.");
        return;
    }

    // Chỉ gọi connect nếu chưa có tiến trình connect nào đang chạy
    connectSocket().catch(()=>{});
}

export function closeSocket() {
    isIntentionalClose = true;
    stopHeartbeat();

    if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
    }
    if (socket) {
        if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
            socket.close(1000, "Client closed intentionally");
        }
    }
    socket = null;
    connectPromise = null;
    notifyConnectionChange(false);
}