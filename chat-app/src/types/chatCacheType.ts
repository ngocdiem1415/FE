import type {ChatMessage} from "./chatType.ts";

export interface ChatCache {
    messages: ChatMessage[];
    loadedPages: number; // đã load bao nhiêu page
    lastUpdated: number;
}
