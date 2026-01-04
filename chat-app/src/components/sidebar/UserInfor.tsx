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
        <div className={`user-container ${!isExit ? 'user-not-exit' : ''}`}
             style={{
                 display: "flex",
                 alignItems: "center",
                 gap: "12px",
                 marginBottom: 16
             }}>

            {/* Phần Avatar */}
            <div className="avatar-wrapper" style={{ position: "relative" }}>
                <img src="/img/avatar.jpg" alt="avatar" className="avatar"
                     style={{ width: "40px", height: "40px", borderRadius: "50%" }} />
                <span className={`status-dot ${isOnline ? 'online' : 'offline'}`}
                      style={{
                          position: "absolute",
                          bottom: 0,
                          right: 0,
                          width: "10px",
                          height: "10px",
                          borderRadius: "50%",
                          backgroundColor: isOnline ? "#22c55e" : "#94a3b8",
                          border: "2px solid #fff"
                      }}></span>
            </div>

            <div className="user-details" style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flex: 1
            }}>
                <div style={{ fontWeight: 700, fontSize: "16px" }}>{me}</div>

                <button
                    onClick={logout}
                    style={{
                        padding: "4px 12px",
                        cursor: "pointer",
                        fontSize: "12px",
                        borderRadius: "4px",
                        border: "1px solid #ddd",
                        backgroundColor: "#f8fafc"
                    }}
                >
                    Logout
                </button>
            </div>
        </div>
    );
}