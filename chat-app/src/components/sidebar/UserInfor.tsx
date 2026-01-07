import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../../constants/routes";
import { authService } from "../../services/authApi";
import './userInfor.css';

interface UserInforProps {
    me: string;
    isOnline: boolean;
    isExit?: boolean;
}

export default function UserInfor({ me, isOnline, isExit }: UserInforProps) {
    const navigate = useNavigate();
    const logout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error("Logout failed", error);
        } finally {
            localStorage.removeItem("user");
            localStorage.removeItem("username");
            navigate(APP_ROUTES.LOGIN, { replace: true });
        }
    };

    return (
        <div className={`user-container ${!isExit ? 'user-not-exit' : ''}`}>
            <div className="avatar-wrapper">
                <img src="/img/avatar.jpg" alt="avatar" />
                <span className={`status-dot ${isOnline ? 'online' : 'offline'}`}></span>
            </div>
            <div className="user-name" title={me}>{me}</div>
            <button className="logout-button" onClick={logout}>Logout</button>
        </div>
    );
}