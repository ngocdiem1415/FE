import {useEffect, useState, useRef} from "react";
import {useNavigate} from "react-router-dom";
import {connectSocket, onSocketMessage, closeSocket} from "../api/socketClient";
import {ChatEvent} from "../constants/chatEvents";
import {userService} from "../services/userService";
import {peopleService} from "../services/userService";
import {roomService} from "../services/roomApi";
import {relogin} from "../services/authApi.ts";
import {APP_ROUTES} from "../constants/routes";

import type {ChatMessage} from "../types/chatType";
import type {UserItem} from "../types/userType";
import type {WsResponse} from "../types/commonType";
import type {RoomData} from "../types/roomType";

import LeftSideBar from "../components/sidebar/LeftSideBar";
import MainChat from "../components/mainChat/MainChat";
import RightSideBar from "../components/rightSideBar/RightSideBar.tsx";
import {useChatMessages} from "../hook/useChatMessages";
import {useMessageStore} from "../hook/useMessageStore.ts";


type ChatMode = "people" | "room";

function ChatPage() {
    const me = localStorage.getItem("user") || "";
    const savedReLoginCode = localStorage.getItem("reLoginCode");
    const navigate = useNavigate();

    const [users, setUsers] = useState<UserItem[]>([]);
    // const [users, setUsers] = useState<UserItem[]>([{name: "22130039VoNguyenThanhDieu", type: 0, actionTime:"test"}]);
    const [mode, setMode] = useState<ChatMode>("people");
    const [target, setTarget] = useState<string | null>(null);
    // const [messages, setMessages] = useState<ChatMessage[]>([]);
    const {
        setActiveChat,
        getMessages,
        isFetching,
        markFetching,
        ingest,
    } = useMessageStore();
    const messageStore = useMessageStore();

    const activeChatKey = null;
    const {messages, isEmpty} = useChatMessages(
        activeChatKey,
        messageStore.getMessages
    );

    const PAGE_SIZE = 50;
    const REQUEST_PAGES = 2; // 1 lần = 2 page = 100 msg

    const [currentRoomData, setCurrentRoomData] = useState<RoomData | null>(null);
    const [isTargetOnline, setIsTargetOnline] = useState(false);

    // Refs để truy cập state mới nhất trong socket callback
    const modeRef = useRef<ChatMode>("people");
    const targetRef = useRef<string | null>(null);
    const isRedirectingRef = useRef(false);
    const historyBufferRef = useRef<ChatMessage[]>([]);

    useEffect(() => {
        modeRef.current = mode;
        targetRef.current = target;
    }, [mode, target]);

    const type = modeRef.current === "people" ? 0 : 1;

    //Nhận tin nhắn từ MainChat (do chính mình gửi)
    const handleManualAddMessage = (msg: ChatMessage) => {
        // setMessages((prev) => [...prev, msg]);
        // appendMessage(msg)
    };
    const filterPeopleMessages = (
        messages: ChatMessage[],
        me: string,
        target: string
    ) => {
        return messages.filter(m =>
            m.type === 0 &&
            (
                (m.name === me && m.to === target) ||
                (m.name === target && m.to === me)
            )
        );
    };

    useEffect(() => {
            let unsub: (() => void) | undefined;
            let heartbeatInterval: any = null;
            isRedirectingRef.current = false;

            const initSocket = async () => {
                // 1. Kết nối (Cookie session sẽ tự gửi đi)
                try {
                    await connectSocket();
                    console.log("Socket Connected!");
                    if (me && savedReLoginCode) {
                        console.log("Found re-login code, attempting to login...");
                        await relogin(me, savedReLoginCode);
                    } else {
                        console.warn("No credentials found, redirecting to login.");
                        navigate(APP_ROUTES.LOGIN);
                    }
                } catch (err) {
                    console.error("Lỗi kết nối ban đầu:", err);
                    return;
                }

                // 2. KÍCH HOẠT HEARTBEAT
                heartbeatInterval = setInterval(async () => {

                    // BỌC TRY-CATCH ĐỂ TRÁNH CRASH APP KHI MẤT MẠNG
                    try {
                        const currentMode = modeRef.current;
                        const currentTarget = targetRef.current;
                        if (currentMode === "people" && currentTarget) {
                            userService.checkUserOnline(currentTarget);
                        } else {
                            userService.checkUserOnline(me);
                        }
                        console.log("Sent Heartbeat...");
                    } catch (error) {
                        //xuử lí thêm trường hợp mạng yếu
                        console.warn("Heartbeat lỗi: Socket đã mất kết nối. ", error);
                        try {
                            await connectSocket();

                            if (me && savedReLoginCode) {
                                relogin(me, savedReLoginCode);
                                console.log("Đã gửi Re-login sau khi reconnect WS");
                            }
                        } catch (reconnectErr) {
                            console.error("Reconnect thất bại:", reconnectErr);
                        }
                    }
                }, 60000);

                // 3. LẮNG NGHE TIN NHẮN TỪ SERVER
                unsub = onSocketMessage((raw) => {
                        const msg = raw as WsResponse<any>;

                        if (msg.status === "error") {
                            if (!isRedirectingRef.current) {
                                if (msg.event === ChatEvent.RE_LOGIN || msg.mes?.includes("User not Login")) {
                                    isRedirectingRef.current = true;
                                    // alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
                                    console.log("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
                                    // xử lí tự đăng nhập vào cho người dùng
                                    // localStorage.clear();
                                    navigate(APP_ROUTES.LOGIN);
                                    closeSocket();
                                }
                            }
                            console.error("Socket Error:", msg.mes);
                            return;
                        }

                        if (msg.event === ChatEvent.RE_LOGIN && msg.status === "success") {
                            console.log("Re-login success!");
                            if (msg.data?.RE_LOGIN_CODE) {
                                localStorage.setItem("reLoginCode", msg.data.RE_LOGIN_CODE);
                            }
                            userService.getUserList();
                            return;
                        }

                        if (msg.event === ChatEvent.CHECK_USER_ONLINE && msg.status === "success") {
                            const isOnline = msg.data?.status === true;
                            if (modeRef.current === "people") {
                                setIsTargetOnline(isOnline);
                            }
                            return;
                        }

                        // --- XỬ LÝ DANH SÁCH USER ---
                        if (msg.event === ChatEvent.GET_USER_LIST) {
                            setUsers(Array.isArray(msg.data) ? msg.data : []);
                            return;
                        }

                        // --- XỬ LÝ LỊCH SỬ TIN NHẮN ---
                        // -- people --
                        if (msg.event === ChatEvent.GET_PEOPLE_CHAT_MES) {
                            console.log("Du lieu page 1 da duoc lay")
                            const key = chatKey(me, targetRef.current, type);
                            console.log("lắng nghe để lưu cache: " + key)
                            const list = Array.isArray(msg.data) ? msg.data : [];
                            historyBufferRef.current.push(...list);

                            if (
                                historyBufferRef.current.length > 0 &&
                                historyBufferRef.current.length >= PAGE_SIZE * REQUEST_PAGES
                            ) {
                                const sorted = [...historyBufferRef.current].sort(
                                    (a, b) =>
                                        new Date(a.createAt || 0).getTime() -
                                        new Date(b.createAt || 0).getTime()
                                );

                                const currentTarget = targetRef.current;
                                if (!currentTarget) return;

                                const filtered = filterPeopleMessages(
                                    sorted,
                                    me,
                                    currentTarget
                                );

                                if (filtered.length === 0) return;

                                const key = chatKey(me, currentTarget, 0);
                                ingest(key, filtered);

                                console.log(sorted)
                                historyBufferRef.current = [];
                                return;
                            }
                        }

                        // -- room --
                        if ((msg.event === ChatEvent.JOIN_ROOM || msg.event === ChatEvent.GET_ROOM_CHAT_MES)
                            && msg.status === "success") {

                            const roomData = msg.data as RoomData;

                            setCurrentRoomData(roomData);

                            const list = roomData.chatData || [];
                            const sortedList = [...list].sort((a, b) => {
                                return new Date(a.createAt || 0).getTime() - new Date(b.createAt || 0).getTime();
                            });

                            // replaceMessages(sortedList);
                            // }
                            return;
                        }

                        // --- XỬ LÝ TIN NHẮN REALTIME (Người khác gửi đến) ---
                        if (msg.event === ChatEvent.SEND_CHAT) {
                            const m = msg.data as ChatMessage | undefined;

                            // Lấy giá trị hiện tại từ Ref
                            const currentTarget = targetRef.current;
                            const currentMode = modeRef.current;

                            if (!m || !currentTarget) return;

                            // Logic kiểm tra xem tin nhắn đến có thuộc cuộc trò chuyện đang mở không

                            // Case 1: Chat 1-1 (People) - Server trả về type: 0
                            if (currentMode === "people" && m.type === 0) {
                                // Chỉ hiện nếu người gửi (m.name) chính là người mình đang chat (target)
                                if (m.name === currentTarget) {
                                    // appendMessage(m);
                                }
                            }

                            // Case 2: Chat Room - Server trả về type: 1
                            else if (currentMode === "room" && m.type === 1) {
                                // Với room, tin nhắn phải có 'to' trùng với tên phòng
                                if (m.to === currentTarget) {
                                    // appendMessage(m);
                                }
                            }
                        }
                    }
                )
                ;

                // Load danh sách user sau khi connect xong
                userService.getUserList();
            };

            initSocket();

            // Cleanup khi thoát trang
            return () => {
                if (heartbeatInterval) clearInterval(heartbeatInterval);
                if (unsub) unsub();
            };
        }, []
    )
    ;


    // ----CHƯA TEST LẤY LỊCH SỬ CHAT-----
    // chọn chat -> load lịch sử
    const chatKey = (me: string, target: string | null, type: 0 | 1) =>
        `chat_${type}_${me}_${target}`;

    useEffect(() => {
        if (!target) return;
        console.log("Lay dư lieu lan dau")
        const key = chatKey(me, target, type);
        console.log("useEffct chạy: " + key)

        setActiveChat(key);
        const cached = getMessages(key);

        // nếu đã có đủ ít nhất 2 page thì KHÔNG gọi
        if (cached.length >= PAGE_SIZE * REQUEST_PAGES) {
            return;
        }
        // tránh gửi request trùng
        if (isFetching(key)) return;

        // đánh dấu đang fetch
        markFetching(key);

        if (mode === "people") {
            peopleService.getPeopleMessages(target, 1);
            // peopleService.getPeopleMessages(target, 2);
        } else {
            // roomService.getRoomMessages(target, 1);
            // roomService.getRoomMessages(target, 2);
        }
    }, [mode, target]);

    const onSelectPeople = (username: string) => {
        setCurrentRoomData(null);
        setIsTargetOnline(false);
        setMode("people");
        setTarget(username);
    };

    const onSelectRoom = (roomName: string) => {
        setCurrentRoomData(null);
        setIsTargetOnline(false);
        setMode("room");
        setTarget(roomName);
    };

    return (
        <div style={{display: "flex", height: "100vh", overflow: "hidden"}}>
            <LeftSideBar
                me={me}
                users={users.filter((u) => u.name !== me)}
                selectedTarget={target}
                onSelectPeople={onSelectPeople}
                onSelectRoom={onSelectRoom}
            />

            <div style={{flex: 1, position: "relative"}}>
                <MainChat me={me}
                          mode={mode}
                          target={target}
                          messages={messages}
                          onSendMessage={handleManualAddMessage}
                          isOnline={isTargetOnline}/>
            </div>
            {target && (
                <RightSideBar
                    mode={mode}
                    target={target}
                    roomData={currentRoomData}
                    messages={messages}
                />
            )}
        </div>
    );
}

export default ChatPage;