import {useEffect, useRef, useState} from "react";
import type {ChatMessage} from "../types/chatType.ts";

const MAX_MESSAGES = 400;
const MAX_KEY = 3;
const PAGE_SIZE = 50;

export type ChatCache = {
    messages: ChatMessage[];
    loadedPages: number;
    lastUpdated: number;
};

type IngestPayload = {
    key: string;
    mode: "HISTORY" | "REALTIME";
    messages: ChatMessage[];
};

export function useMessageStore() {
    const activeKeyRef = useRef<string | null>(null);
    const fetchingRef = useRef<Record<string, boolean>>({});

    const [, forceRender] = useState(0);
    const notify = () => forceRender(x => x + 1);

    const readCache = (key: string): ChatCache | null => {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
    };

    const writeCache = (key: string, cache: ChatCache) => {
        localStorage.setItem(key, JSON.stringify(cache));
    };

    /** ChatPage gọi khi đổi target */
    const setActiveChat = (key: string) => {
        activeKeyRef.current = key;
        notify(); // render từ cache
    };

    /** ChatPage đọc message để render */
    const getMessages = (key: string): ChatMessage[] => {
        return readCache(key)?.messages ?? [];
    };

    /** Tránh fetch trùng */
    const isFetching = (key: string) => {
        return !!fetchingRef.current[key];
    };

    /** Đánh dấu đang fetch */
    const markFetching = (key: string) => {
        fetchingRef.current[key] = true;
    };

    /**
     * ChatPage gửi dữ liệu đã merge + sort vào
     */
    const ingest = (key: string, incoming: ChatMessage[]) => {
        console.log("key " + key)

        const now = Date.now();

        // đọc cache cũ
        const oldCache = readCache(key);
        let final: ChatMessage[];

        if (!oldCache) {
            final = [...incoming].sort(
                (a, b) =>
                    new Date(a.createAt || 0).getTime() -
                    new Date(b.createAt || 0).getTime()
            );
            console.log("final " + final)
        }
        else {
            const merged = [...incoming, ...oldCache.messages];

            const map = new Map<string, ChatMessage>();
            for (const msg of merged) {
                map.set(String(msg.id), msg);
            }

            final = Array.from(map.values()).sort(
                (a, b) =>
                    new Date(a.createAt || 0).getTime() -
                    new Date(b.createAt || 0).getTime()
            );
        }

        // cap tối đa 400 tin mới nhất
        //Giữu lại 220 tin nhắn mới nhất
        if (final.length > 400) {
            final = final.slice(final.length - 400);
        }

        // update meta
        const newCache: ChatCache = {
            messages: final,
            loadedPages: Math.ceil(final.length / 50),
            lastUpdated: now,
        };

        // ghi localStorage
        localStorage.setItem(key,
            JSON.stringify(newCache)
        );
        // console.log("Dữ liệu của " + key + " nội dung " +  JSON.stringify(oldCache))

        // clear fetching flag
        fetchingRef.current[key] = false;

        // render nếu đang mở chat này
        if (activeKeyRef.current === key) {
            notify();
        }
    };

    //Theo dõi 3 cuộc chat gần nhất
    const CHAT_INDEX_KEY = "chat_index";

    function updateChatIndex(key: string) {
        const list: string[] = JSON.parse(
            localStorage.getItem(CHAT_INDEX_KEY) || "[]"
        );
        const newList = [key, ...list.filter(k => k !== key)];
        if (newList.length > 3) {
            const removed = newList.pop();
            if (removed) localStorage.removeItem(removed);
        }
        localStorage.setItem(CHAT_INDEX_KEY, JSON.stringify(newList));
    }

    return {
        setActiveChat,
        getMessages,
        isFetching,
        markFetching,
        ingest,
    };
}

