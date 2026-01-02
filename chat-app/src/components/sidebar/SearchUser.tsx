import React, {useEffect, useState} from "react";
import {onSocketMessage, sendSocket} from "../../api/socketClient.ts";
import type {ChatRequest, ServerResponse, UserCheckData} from "../../types/chatType.ts";
import {ACTION_NAME} from "../../types/chatType.ts";

const SearchUser: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [statusMessage, setStatusMessage] = useState<string>("");

    useEffect(() => {
        const unsubscribe = onSocketMessage((response: ServerResponse) => {
            if (response.event === "CHECK_USER_EXIST") {
                if (response.data.status) {
                    setStatusMessage(`Người dùng "${searchTerm}" tồn tại!`);
                } else {
                    setStatusMessage("Người dùng không tồn tại.");
                }
            }
        });

        return () => {unsubscribe()};
    }, [searchTerm]); // Re-run effect nếu searchTerm thay đổi để xử lý logic hiển thị

    const handleSearch = () => {
        if (!searchTerm.trim()) return;

        const request: ChatRequest<UserCheckData> = {
            action: ACTION_NAME,
            data: {
                event: "CHECK_USER_EXIST",
                data: { user: searchTerm }
            }
        };

        try {
            sendSocket(request);
            setStatusMessage("Đang kiểm tra...");
        } catch (error) {
            console.error(error);
            setStatusMessage("Lỗi: Chưa kết nối Socket.");
        }
    };

    return (
        <div className="search-box">
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Tìm người dùng..."
            />
            <button onClick={handleSearch}>Tìm</button>
            {statusMessage && <p>{statusMessage}</p>}
        </div>
    );
};
export default SearchUser;