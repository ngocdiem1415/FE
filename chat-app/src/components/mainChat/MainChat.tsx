import React from 'react';
import './mainChat.css';
import SearchUser from './../sidebar/SearchUser';
import UserInfor from './../sidebar/UserInfor.tsx';
import '@fortawesome/fontawesome-free/css/all.min.css';

const MainChat: React.FC = () => {
    return (
        <div className='chatAppContainer' style={{ display: 'flex', height: '100vh' }}>
            <div className="leftSide" style={{ width: '30%', borderRight: '1px solid #ddd', display: 'flex', flexDirection: 'column' }}>
                <UserInfor />
                <SearchUser />

                <div className="userListContainer" style={{ flex: 1, overflowY: 'auto' }}>
                    {/* Danh sách người dùng sẽ hiện ở đây */}
                </div>
            </div>

            <div className="mainChat" style={{ width: '70%', display: 'flex', flexDirection: 'column' }}>
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
                    <div className="centerChat" style={{ flex: 1, overflowY: 'auto' }}>
                        <div className="messages">
                            <img src="/img/avatar.jpg" alt="avatar" className="avatar" />
                            <div className="texts">
                                <p className="content">Chào bạn, hôm nay thế nào?</p>
                                <span>10:00</span>
                            </div>
                        </div>
                        <div className="messages own">
                            <div className="texts">
                                <p className="content">Mình vẫn ổn, cảm ơn bạn!</p>
                                <span>10:01</span>
                            </div>
                        </div>
                    </div>

                    {/* Thanh nhập liệu (Bottom) */}
                    <div className="bottomChat">
                        <input type="text" placeholder="Nhập tin nhắn..." />
                        <button className="sendButton">Gửi</button>
                    </div>
                </React.Fragment>
            </div>
        </div>
    );
};

export default MainChat;