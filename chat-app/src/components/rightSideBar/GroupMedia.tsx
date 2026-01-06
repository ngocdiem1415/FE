import React, { useState, useEffect } from "react";
import type { ChatMessage } from "../../types/chatType";

type Props = {
    messages: ChatMessage[];
};

const GroupMedia: React.FC<Props> = ({ messages }) => {
    const [isOpen, setIsOpen] = useState(true);
    const [images, setImages] = useState<string[]>([]);

    useEffect(() => {
        // Lọc các tin nhắn là ảnh
        const list: string[] = [];
        messages.forEach(msg => {
            try {
                // Giải mã Base64 trước
                const decoded = decodeURIComponent(escape(atob(msg.mes)));
                // Kiểm tra xem có phải link ảnh không (đơn giản)
                if (decoded.match(/\.(jpeg|jpg|gif|png|webp)$/i) || decoded.startsWith("data:image")) {
                    list.push(decoded);
                }
            } catch (e) {
                // Bỏ qua lỗi decode
            }
        });
        // Đảo ngược để hiện ảnh mới nhất lên đầu
        setImages(list.reverse());
    }, [messages]);

    return (
        <div className="rsb-section">
            <div className="rsb-section-title" onClick={() => setIsOpen(!isOpen)}>
                <span>Ảnh / Video</span>
                <i className={`fa-solid fa-chevron-${isOpen ? 'down' : 'right'}`}></i>
            </div>
            {isOpen && (
                <div className="rsb-section-content">
                    {images.length === 0 ? (
                        <p className="rsb-empty-text">Chưa có hình ảnh</p>
                    ) : (
                        <div className="rsb-media-grid">
                            {images.map((src, idx) => (
                                <img
                                    key={idx}
                                    src={src}
                                    alt="media"
                                    className="rsb-media-img"
                                    onClick={() => window.open(src, "_blank")}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default GroupMedia;