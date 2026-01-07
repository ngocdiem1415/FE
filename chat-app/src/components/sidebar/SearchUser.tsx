import React, { useEffect, useState, useRef } from "react";
import { onSocketMessage } from "../../api/socketClient.ts";
import type { CheckUserExitResponse, ServerResponse } from "../../types/chatType.ts";
import { userService } from "../../services/userService.ts";
import "./searchUser.css";
import "../sidebar/listStyles.css";

interface SearchUserProps {
    onSelectPeople: (username: string) => void;
    selectedTarget: string | null;
}

const SearchUser: React.FC<SearchUserProps> = ({ onSelectPeople, selectedTarget }) => {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [foundUser, setFoundUser] = useState<string | null>(null);
    const [errorMes, setErrorMes] = useState<string | null>(null);
    const lastSearchRef = useRef<string>("");

    useEffect(() => {
        const unsubscribe = onSocketMessage((response: ServerResponse<CheckUserExitResponse>) => {
            if (response.event === "CHECK_USER_EXIST") {
                const { status} = response.data;
                if (status) {
                    console.log(lastSearchRef)
                    setFoundUser(lastSearchRef.current)
                    setErrorMes(null);
                } else {
                    setFoundUser(null);
                    setErrorMes(`Không tìm thấy người dùng!`);
                }
            }
        });
        return () => {unsubscribe()};
    }, []);

    const handleSearch = () => {
        const trimmedTerm = searchTerm.trim();
        if (!trimmedTerm) return;

        lastSearchRef.current = trimmedTerm;
        setFoundUser(null);
        setErrorMes(null);
        try {
            userService.checkUserExist(trimmedTerm);
        } catch (error) {
            console.error("Socket error:", error);
            setErrorMes("Lỗi kết nối máy chủ.");
        }
    };

    const handleSelectFoundUser = (username: string) => {
        onSelectPeople(username);
        setFoundUser(null);
        setSearchTerm("");
        setErrorMes(null);
        lastSearchRef.current = "";
    };

    return (
        <div className="search-container">
            <div className="search-input-group">
                <input
                    className="input-search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Tìm tên người dùng..."/>
                <button className="btSearch" onClick={handleSearch}>Tìm</button>
            </div>

            {errorMes && <p className="status-info error">{errorMes}</p>}

            {foundUser && (
                <div className="search-result-item">
                    <div
                        onClick={() => foundUser && handleSelectFoundUser(foundUser)}
                        className={`list-item is-user ${selectedTarget === foundUser ? 'active' : ''}`}>
                        <div className="item-name">{foundUser}</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchUser;