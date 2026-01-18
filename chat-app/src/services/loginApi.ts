import {connectSocket, sendSocketSafe} from "../api/socketClient.ts";
import {ACTION_NAME, ChatEvent} from "../constants/chatEvents.ts";

export const login = async (user: string, pass: string) => {
    await connectSocket();
    return sendSocketSafe({
        action: ACTION_NAME,
        data: {
            event: ChatEvent.LOGIN,
            data: { user, pass },
        },
    });
};