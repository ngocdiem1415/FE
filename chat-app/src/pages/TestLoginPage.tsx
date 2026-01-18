import React, { useEffect, useState } from 'react';
import {Link, useNavigate} from 'react-router-dom';
import { connectSocket } from '../api/socketClient';
import {relogin} from "../services/authApi";
import {login} from "../services/loginApi";

const TestLoginPage: React.FC = () => {
    // const [user, setUser] = useState("");
    // const [pass, setPass] = useState("");
    const navigate = useNavigate();
    const [isChecking, setIsChecking] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const autoCheck = async () => {
            const me = localStorage.getItem("user");
            const savedReLoginCode = localStorage.getItem("reLoginCode");

            // Nếu có dữ liệu trong Local thì mới bắt đầu xử lý tự động đăng nhập
            if (me && savedReLoginCode) {
                setIsChecking(true); // Hiển thị trạng thái đang xử lý (nếu cần)
                try {
                    await connectSocket();
                    await relogin(me, savedReLoginCode);

                    // Nếu relogin không ném ra lỗi, chuyển thẳng vào Chat
                    navigate("/chat", { replace: true });
                } catch (error) {
                    console.error("Tự động đăng nhập thất bại:", error);
                    setIsChecking(false); // Ở lại trang Login để người dùng nhập tay
                }
            }
        };

        autoCheck();
    }, [navigate]);


    const handleLogin = async () => {
        if (!user || !pass) {
            alert("Vui lòng nhập đủ thông tin");
            return;
        }
        try {
            setLoading(true);
            await login(user,pass);
            // await connectSocket();
            // login(user, pass);
            console.log(localStorage.getItem("reLoginCode"));
        } catch {
            setLoading(false);
            alert("Không thể kết nối WebSocket");
        }
    };

    if (isChecking) {
        return <div className="overlay">Đang tự động đăng nhập...</div>;
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <h2 className="login-title">Đăng nhập</h2>

                <div className="login-form">
                    <input
                        className="login-input"
                        placeholder="Username"
                        value={user}
                        onChange={(e) => setUser(e.target.value)}
                    />
                    <input
                        className="login-input"
                        type="password"
                        placeholder="Password"
                        value={pass}
                        onChange={(e) => setPass(e.target.value)}
                    />
                </div>

                <button className="login-button" onClick={handleLogin} disabled={loading}>
                    {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                </button>

                <p className="login-footer">
                    Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
                </p>
            </div>
        </div>
    );
};

export default TestLoginPage;