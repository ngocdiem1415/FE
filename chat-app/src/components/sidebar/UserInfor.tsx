import React from "react";
import './userInfor.css';

interface UserInforProps {
    username?: string;
    isOnline: boolean;
}

const UserInfor = ({
                       username = localStorage.getItem('username'),
                       isOnline,
                       isExit
                   }: UserInforProps) => {
    return (
        <div className={`user-avatar ${!isExit ? 'user-not-exit' : ''}`}>
            <div className="avatar-wrapper">
                <img src="/img/avatar.jpg" alt="avatar" className="avatar" />
                {/* Nếu isOnline là true thì thêm class 'online', ngược lại 'offline' */}
                <span className={`status-dot ${isOnline ? 'online' : 'offline'}`}></span>
            </div>

            <div className="user-text">
                <span className="user-name">{username}</span>
            </div>
        </div>
    )
}

export default UserInfor;