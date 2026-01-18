import {useEffect, useState} from "react";
import type {ChatMessage} from "../types/chatType.ts";
import {peopleService, userService} from "../services/userService.ts";
import {roomService} from "../services/roomApi.ts";
import type {ChatCache} from "../types/chatCacheType";

export function useChatMessages(
    chatKey: string | null,
    getMessages: (key: string) => ChatMessage[]
) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    // load cache + request server
    useEffect(() => {
        if (!chatKey) {
            setMessages([]);
            return;
        }

        const cached = getMessages(chatKey);

        //Xử lí thêm trường hợp hết dữ liệu trong localstorage
        const sorted = [...cached].sort(
            (a, b) =>
                new Date(a.createAt || 0).getTime() -
                new Date(b.createAt || 0).getTime()
        );

        setMessages(sorted);

    }, [chatKey]);

    return {
        messages,
        isEmpty: messages.length === 0,
    };
}
