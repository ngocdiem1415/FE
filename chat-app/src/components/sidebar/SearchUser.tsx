import React, { useEffect, useState, useRef } from "react";
import { onSocketMessage, sendSocket } from "../../api/socketClient.ts";
import type {ChatRequest, CheckUserExitResponse, ServerResponse, UserCheckData} from "../../types/chatType.ts";
import { ACTION_NAME } from "../../types/chatType.ts";

const SearchUser: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [statusMessage, setStatusMessage] = useState<string>("");

    const lastSearchRef = useRef<string>("");
    useEffect(() => {
        // Gọi hàm và lưu hàm dọn dẹp vào biến
        const unsubscribe = onSocketMessage((response: ServerResponse<CheckUserExitResponse>) => {
            if (response.event === "CHECK_USER_EXIST") {
                const { status, user } = response.data;
                if (status) {
                    setStatusMessage(`Người dùng "${user}" hiện đang online/tồn tại!`);
                } else {
                    setStatusMessage(`Không tìm thấy người dùng "${user}".`);
                }
            }
        });
        return () => {
            unsubscribe();
        };
    }, []);

    const handleSearch = () => {
        const trimmedTerm = searchTerm.trim();
        if (!trimmedTerm) return;
        lastSearchRef.current = trimmedTerm;

        const request: ChatRequest<UserCheckData> = {
            action: ACTION_NAME,
            data: {
                event: "CHECK_USER_EXIST",
                data: { user: trimmedTerm }
            }
        };
        try {
            sendSocket(request);
            setStatusMessage(`Đang kiểm tra "${trimmedTerm}"...`);
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
                placeholder="Tìm tên người dùng..."
            />
            <button onClick={handleSearch}>Tìm</button>
            {statusMessage && <p className="status-info">{statusMessage}</p>}
        </div>
    );
};

export default SearchUser;