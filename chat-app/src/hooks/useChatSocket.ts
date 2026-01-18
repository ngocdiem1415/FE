import {useEffect, useRef, useState, useCallback} from "react";
import {useNavigate} from "react-router-dom";
import {
    connectSocket,
    onSocketMessage,
    closeSocket,
    setSessionExpiredHandler,
    onConnectionChange
} from "../api/socketClient";
import {ChatEvent} from "../constants/chatEvents";
import {userService, peopleService} from "../services/userService";
import {roomService} from "../services/roomApi";
import {APP_ROUTES} from "../constants/routes";

import type {ChatMessage} from "../types/chatType";
import type {UserItem} from "../types/userType";
import type {WsResponse} from "../types/commonType";
import type {RoomData} from "../types/roomType";
// import {mainchatController} from "../controller/MainChatController.ts"

export type ChatMode = "people" | "room";

const useChatSocket = (mode: ChatMode, target: string | null) => {
    const navigate = useNavigate();

    const [users, setUsers] = useState<UserItem[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [currentRoomData, setCurrentRoomData] = useState<RoomData | null>(null);
    const [isTargetOnline, setIsTargetOnline] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const modeRef = useRef<ChatMode>(mode);
    const targetRef = useRef<string | null>(target);

    useEffect(() => {
        modeRef.current = mode;
        targetRef.current = target;
    }, [mode, target]);

    useEffect(() => {
        setSessionExpiredHandler(() => {
            // alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
            // localStorage.clear();
            navigate(APP_ROUTES.LOGIN);
        });

        // connectSocket().then(() => {
        //     console.log("Hook: Socket Connected");
        //     setIsConnected(true);
        //     userService.getUserList();
        // }).catch(err => {
        //     console.error("Hook: Connection failed", err)
        //     setIsConnected(false);
        // });
        connectSocket().catch(err => console.error(err));

        const unsubConnection = onConnectionChange((status) => {
            setIsConnected(status);
        });

        return () => {
            closeSocket();
            unsubConnection();
        };
    }, [navigate]);

    useEffect(() => {
        const unsub = onSocketMessage((raw) => {
            const msg = raw as WsResponse<any>;
            if (msg.status === "error") return;

            switch (msg.event) {
                case ChatEvent.CHECK_USER_ONLINE:
                    if (msg.status === "success" && modeRef.current === "people") {
                        setIsTargetOnline(msg.data?.status === true);
                    }
                    break;

                case ChatEvent.GET_USER_LIST:
                    setUsers(Array.isArray(msg.data) ? msg.data : []);
                    break;

                case ChatEvent.GET_PEOPLE_CHAT_MES: {
                    const list = Array.isArray(msg.data) ? msg.data : [];
                    // TRƯỜNG HỢP HẾT DỮ LIỆU
                    if (list.length === 0) {
                        setHasMore(false);
                        setIsLoadingMore(false);
                        break;
                    }

                    const sortedNewList = list.sort((a: any, b: any) =>
                        new Date(a.createAt || 0).getTime() - new Date(b.createAt || 0).getTime()
                    );

                    setMessages((prev) => {
                        if (prev.length === 0) return sortedNewList;

                        // Kiểm tra xem tin nhắn này đã tồn tại chưa để tránh trùng lặp
                        const existingIds = new Set(prev.map(m => m.id));
                        const uniqueNewList = sortedNewList.filter(m => !existingIds.has(m.id));

                        return [...uniqueNewList, ...prev];
                    });
                    setIsLoadingMore(false);
                    break;
                }

                case ChatEvent.JOIN_ROOM:{
                    if (msg.status === "success") {
                        const rData = msg.data as RoomData;
                        setCurrentRoomData(rData);
                    }
                    break;
                }
                case ChatEvent.GET_ROOM_CHAT_MES: {
                    const rData = msg.data as RoomData;
                    const list = rData.chatData || [];
                    // TRƯỜNG HỢP HẾT DỮ LIỆU
                    if (list.length === 0) {
                        setHasMore(false);
                        setIsLoadingMore(false);
                        break;
                    }

                    const sortedNewList = list.sort((a: any, b: any) =>
                        new Date(a.createAt || 0).getTime() - new Date(b.createAt || 0).getTime()
                    );

                    setMessages((prev) => {
                        if (prev.length === 0) return sortedNewList;

                        // Kiểm tra xem tin nhắn này đã tồn tại chưa để tránh trùng lặp
                        const existingIds = new Set(prev.map(m => m.id));
                        const uniqueNewList = sortedNewList.filter(m => !existingIds.has(m.id));

                        return [...uniqueNewList, ...prev];
                    });
                    setIsLoadingMore(false);
                    break;
                }

                //Xử lý nhận tin nhắn realtime
                case ChatEvent.SEND_CHAT: {
                    const m = msg.data as ChatMessage | undefined;
                    const currTarget = targetRef.current;
                    const currMode = modeRef.current;

                    if (!m || !currTarget) return;

                    const isPeopleChat = currMode === "people" && m.type === 0 && m.name === currTarget;
                    const isRoomChat = currMode === "room" && m.type === 1 && m.to === currTarget;

                    if (isPeopleChat || isRoomChat) {
                        setMessages((prev) => [...prev, m]);
                    }
                    break;
                }
            }
        });

        return () => {
            unsub();
        };
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            if (modeRef.current === "people" && targetRef.current) {
                userService.checkUserOnline(targetRef.current);
            }
        }, 45000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (isConnected) {
            const me = localStorage.getItem("user");
            if (me) {
                userService.getUserList();
            }
        }
    }, [isConnected]);

    //Xử lý chọn cuộc hội thoại/ room mới
    useEffect(() => {
        const fetchData = async () => {
            if (!target) {
                setMessages([]);
                return;
            }

            setMessages([]);
            setCurrentRoomData(null);
            setIsTargetOnline(false);
            setIsLoadingMore(false);
            setHasMore(true);

            try {
                if (mode === "people") {
                    peopleService.getPeopleMessages(target, 1); //Xử lý lại đoạn get message này
                    userService.checkUserOnline(target);
                } else {
                    roomService.joinRoom(target);
                    roomService.getRoomMessages(target, 1);
                }
            } catch (error) {
                console.error("Lỗi tải dữ liệu chat:", error);
            }
        };

        fetchData().then();

    }, [mode, target]);

    const addMessageManually = useCallback((msg: ChatMessage) => {
        setMessages((prev) => [...prev, msg]);
    }, []);

    const loadMoreMessages = async (nextPage: number) => {
        if (!target) return;
        setIsLoadingMore(true)
        try {
            if (mode === "people") {
                console.log(nextPage);
                await peopleService.getPeopleMessages(target, nextPage);
            } else {
                console.log(nextPage);
                await roomService.getRoomMessages(target, nextPage);
            }
        } catch (error) {
            setIsLoadingMore(false);
            console.error("Lỗi tải thêm tin nhắn:", error);
        }
    };

    return {
        users,
        messages,
        currentRoomData,
        isTargetOnline,
        addMessageManually,
        loadMoreMessages,
        hasMore,
        isLoadingMore,
        isConnected
    };
};
export default useChatSocket