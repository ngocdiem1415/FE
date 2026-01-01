import { sendSocket } from "../api/socketClient";
import { ACTION_NAME, ChatEvent } from "../constants/chatEvents";

export const peopleService = {
  getPeopleMessages: (name: string, page = 1) =>
    sendSocket(
        { action: ACTION_NAME, data: 
            { event: ChatEvent.GET_PEOPLE_CHAT_MES,
                 data: { name, page } 
                } }
            ),
};

export const userService = {
  getUserList: () => 
    sendSocket(
        { action: ACTION_NAME, data: 
            { event: 
                ChatEvent.GET_USER_LIST 
            } }
        ),
};
