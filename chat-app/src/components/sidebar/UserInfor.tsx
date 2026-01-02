import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../../constants/routes";
import { authService } from "../../services/authApi";

type Props = { me: string };

export default function UserInfor({ me }: Props) {
  const navigate = useNavigate();

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

  const logout = () => {
    // gọi WS logout (optional nhưng đúng API)
    try {
      authService.logout();
    } catch {}
    localStorage.removeItem("user");
    navigate(APP_ROUTES.LOGIN, { replace: true });
  };

        
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontWeight: 700 }}>Hello, {me}</div>
      <button onClick={logout} style={{ marginTop: 8 }}>
        Logout
      </button>
    </div>
  );
}
export default UserInfor;