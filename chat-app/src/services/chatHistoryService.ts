import { peopleService } from "./userService";
import { roomService } from "./roomApi";
import type { ChatMessage } from "../types/chatType";

type ChatMode = "people" | "room";

const DEFAULT_PAGES = [1, 2, 3];

async function fetchPeopleHistory(
    target: string,
    pages = DEFAULT_PAGES
): Promise<ChatMessage[]> {
    // const responses = await Promise.all(
    //     pages.map(p => peopleService.getPeopleChatMes(target, p))
    // );
    // return responses.flat();
    for (let page = 1; page < 4 ; page++) {
        peopleService.getPeopleMessages(target!, page);
    }
}

async function fetchRoomHistory(
    room: string,
    pages = DEFAULT_PAGES
): Promise<ChatMessage[]> {
    // const responses = await Promise.all(
        // pages.map(p => roomService.getRoomChatMes(room, p))
    // );

    // return responses.flat();
}
import fs from 'fs';
import {sendSocketSafe} from "../api/socketClient.ts";
import {ACTION_NAME, ChatEvent} from "../constants/chatEvents.ts";

// Hàm đọc file bạn đã có (giữ nguyên hoặc đưa ra ngoài)
function readChatJson(filePath: string, page: number): ChatMessage[] {
    try {
        const rawContent = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(rawContent);

        // Lấy 20 tin nhắn đầu tiên từ property "data"
        const top20 = parsed.data.slice(0, 20);
        return top20;
    } catch (error) {
        console.error("JSON không hợp lệ hoặc lỗi đọc file:", error);
        return [];
    }
}

// Tích hợp vào hàm testLoadMessage
async function testLoadMessage(
    target: string,
    pages = 20 // Mặc định là trang 1
): Promise<ChatMessage[]> {

    // Gọi hàm đọc file và truyền đường dẫn file json của bạn
    const messages = readChatJson("D:\\Project\\13.AppChat\\FE\\chat-app\\src\\api\\data.json", pages);
    //
    // // Nếu bạn muốn lọc tin nhắn theo 'target' (người nhận)
    // const filteredMessages = messages.filter(m => m.to === target);

    return messages;
}

// export async function fetchChatHistory(
//     mode: ChatMode,
//     target: string,
//     pages = DEFAULT_PAGES
// ): Promise<ChatMessage[]> {
//     if (mode === "people") {
//         return fetchPeopleHistory(target, pages);
//         // return testLoadMessage(target, 20);
//     }
//     return fetchRoomHistory(target, pages);
// }
export const getPeopleMessagesService = (name: string, startPage = 1) => {
    // Chạy vòng lặp để gửi 3 message liên tiếp lên socket
    for (let i = startPage; i <= 1; i++) {
        sendSocketSafe({
            action: ACTION_NAME,
            data: {
                event: ChatEvent.GET_PEOPLE_CHAT_MES,
                data: { name, page: i }, // Sử dụng i để lấy các trang khác nhau
            },
        });
    }

    // Vì sendSocketSafe không trả về giá trị hoặc bạn không cần đợi,
    // chúng ta trả về một Promise giả để không làm lỗi cú pháp .catch() của bạn
    return Promise.resolve();
};