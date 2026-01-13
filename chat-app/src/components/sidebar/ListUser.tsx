import type {UserItem} from "../../types/userType";
import "./listStyles.css";
import UserInfor from "./UserInfor";
import {userService} from "../../services/userService.ts";
import {onSocketMessage} from "../../api/socketClient.ts";
import type {CheckUserExitResponse, ServerResponse} from "../../types/chatType.ts";
import {useEffect, useState} from "react";
import {formatToLocalTime} from "../../utils/dateUtil.ts";

type UserListProps = {
    users: UserItem[];
    onSelectPeople: (username: string) => void;
};

export default function ListUser({users,onSelectPeople}: UserListProps) {
    // Lọc chỉ lấy những item là user
    const userOnly = users.filter(item => item.type === 0);
    const [onlineMap, setOnlineMap] = useState<Record<string, boolean>>({});

    const checkStatusAsync = (userName: string): Promise<boolean> => {
        return new Promise((resolve) => {
            // 1. Gửi request
            userService.checkUserOnline(userName);

            // 2. Lắng nghe phản hồi
            const unsubscribe = onSocketMessage((response: ServerResponse<any>) => {
                if (response.event === "CHECK_USER_ONLINE") {
                    if (response.status === "success") {
                        const {status} = response.data;
                        unsubscribe();
                        resolve(status);
                    } else {
                        resolve(false);
                    }
                }
            });

            // Timeout tránh treo máy nếu server không phản hồi
            setTimeout(() => {
                unsubscribe();
                resolve(false);
            }, 3000);
        });
    };

    useEffect(() => {
        const checkAllUsersSequentially = async () => {
            const results: Record<string, boolean> = {};

            for (const user of userOnly) {
                // Đợi kết quả của từng user trước khi sang người tiếp theo
                const status = await checkStatusAsync(user.name);
                results[user.name] = status;

                // Cập nhật state dần dần để giao diện hiện dot từ từ (trông sẽ mượt hơn)
                setOnlineMap(prev => ({...prev, [user.name]: status}));
            }
        };

        if (userOnly.length > 0) {
            checkAllUsersSequentially();
        }
    }, [userOnly.length]);

    const formatActivityStatus = (serverTime: string | undefined) => {
        if (!serverTime) return "Không rõ hoạt động";

        // Tính khoảng cách thời gian
        const isoTime = serverTime.replace(" ", "T") + "Z";
        const lastActiveDate = new Date(isoTime);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - lastActiveDate.getTime()) / 1000);

        // 1. Nếu dưới 24 giờ thì tính theo "phút/giờ trước"
        if (diffInSeconds < 60) return "Vừa hoạt động";

        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} giờ trước`;

        // 2. Nếu trên 24 giờ: Gọi thẳng hàm formatToLocalTime của bạn
        return formatToLocalTime(serverTime);
    };

    return (
        <div className="scroll-box">
            {userOnly.map((user) => (
                <div key={user.name} className="list-item" onClick={() => onSelectPeople(user.name)}>
                    <UserInfor
                        me={user.name}
                        isOnline={onlineMap[user.name] === true}
                    />
                    <div className="item-time">
                        {formatActivityStatus(user.actionTime)}
                    </div>
                </div>
            ))}
        </div>
    );
}