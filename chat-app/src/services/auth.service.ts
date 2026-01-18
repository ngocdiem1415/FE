import { getLocal, setLocal, removeLocal } from "../utils/storage";
import {sendSocketSafe} from "../api/socketClient.ts";
import {ACTION_NAME, ChatEvent} from "../constants/chatEvents.ts";

const USER_KEY = "chat_user";

export type User = {
    id: string;
    username: string;
    isLoggedIn: boolean;
};

export function getCurrentUser(): User | null {
    return getLocal<User>(USER_KEY);
}

// export function login(username: string): User {
//     const user: User = {
//         id: crypto.randomUUID(),
//         username,
//         isLoggedIn: true
//     };
//
//     setLocal(USER_KEY, user);
//     return user;
// }

export const login = (user: string, pass: string) => {
    return sendSocketSafe({
        action: ACTION_NAME,
        data: {
            event: ChatEvent.LOGIN,
            data: { user, pass },
        },
    });
};

export function logout() {
    removeLocal(USER_KEY);
}
