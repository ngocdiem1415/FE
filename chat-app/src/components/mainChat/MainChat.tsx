import React from 'react';
import './mainChat.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const MainChat: React.FC = () => {
    return (
        <div className='mainChat'>
            {/* --- TRƯỜNG HỢP: CHƯA CHỌN CUỘC TRÒ CHUYỆN --- */}
            {/* <p className="noConversation">Hãy chọn một cuộc trò chuyện</p> */}

            {/* --- TRƯỜNG HỢP: GIAO DIỆN CHAT CHÍNH --- */}
            <React.Fragment>
                {/* Header: Thông tin người nhận */}
                <div className="topChat">
                    <div className="user">
                        <img src="/img/avatar.jpg" alt="avatar" className="avatar" />
                        <div className="texts">
                            <span>Tên người dùng</span>
                            <p>Đang hoạt động</p>
                        </div>
                    </div>
                    <div className="icon">
                        <i className="fa-solid fa-circle-info fa-xl" style={{ color: '#333333' }}></i>
                    </div>
                </div>

                {/* Nội dung tin nhắn (Center) */}
                <div className="centerChat">
                    {/* Tin nhắn từ người khác */}
                    <div className="messages">
                        <img src="/img/avatar.jpg" alt="avatar" className="avatar" />
                        <div className="texts">
                            <p className="content">Chào bạn, hôm nay thế nào?</p>
                            <span>10:00</span>
                        </div>
                    </div>

                    {/* Tin nhắn của chính mình (có class 'own') */}
                    <div className="messages own">
                        <div className="texts">
                            <p className="content">Mình vẫn ổn, cảm ơn bạn!</p>
                            <span>10:01</span>
                        </div>
                    </div>

                    {/* Điểm neo để cuộn xuống tin nhắn mới nhất */}
                    <div></div>
                </div>

                {/* Thanh nhập liệu (Bottom) */}
                <div className="bottomChat">
                    <input
                        type="text"
                        placeholder="Nhập tin nhắn..."
                    />
                    <div className="emoji">
                        <i className="fa-regular fa-face-smile fa-xl"></i>
                        {/* Khu vực hiển thị Emoji Picker */}
                        {/* <div className="emojiPicker">
                            <EmojiPicker />
                        </div> */}
                    </div>
                    <button className="sendButton">Gửi</button>
                </div>
            </React.Fragment>
        </div>
    );
};

export default MainChat;