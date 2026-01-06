import React, { useState, useEffect } from "react";
import type { ChatMessage } from "../../types/chatType";

type Props = {
    messages: ChatMessage[];
};

const GroupFiles: React.FC<Props> = ({ messages }) => {
    const [isOpen, setIsOpen] = useState(true);
    const [files, setFiles] = useState<string[]>([]);

    useEffect(() => {
        const list: string[] = [];
        messages.forEach(msg => {
            try {
                const decoded = decodeURIComponent(escape(atob(msg.mes)));
                // Logic: Là link (http) NHƯNG KHÔNG PHẢI ảnh
                const isUrl = decoded.startsWith("http");
                const isImage = decoded.match(/\.(jpeg|jpg|gif|png|webp)$/i);

                if (isUrl && !isImage) {
                    list.push(decoded);
                }
            } catch (e) {}
        });
        setFiles(list.reverse());
    }, [messages]);

    // Hàm lấy tên file từ URL (cắt sau dấu / cuối cùng)
    const getFileName = (url: string) => {
        try {
            return url.substring(url.lastIndexOf('/') + 1);
        } catch {
            return url;
        }
    };

    return (
        <div className="rsb-section">
            <div className="rsb-section-title" onClick={() => setIsOpen(!isOpen)}>
                <span>File đính kèm</span>
                <i className={`fa-solid fa-chevron-${isOpen ? 'down' : 'right'}`}></i>
            </div>
            {isOpen && (
                <div className="rsb-section-content">
                    {files.length === 0 ? (
                        <p className="rsb-empty-text">Chưa có file</p>
                    ) : (
                        <div>
                            {files.map((url, idx) => (
                                <div key={idx} className="rsb-file-item" onClick={() => window.open(url, "_blank")}>
                                    <div className="rsb-file-icon">
                                        <i className="fa-solid fa-paperclip"></i>
                                    </div>
                                    <div className="rsb-file-name">
                                        {getFileName(url)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default GroupFiles;