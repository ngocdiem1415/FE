import { useEffect, useRef, useState } from "react";
import { connectSocket, onSocketMessage } from "../api/socketClient";
import { login } from "../services/authApi";
import { useNavigate, Link } from "react-router-dom";
import type { WsResponse } from "../types/commonType";
import "../styles/LoginPage.css";
import { ChatEvent } from "../constants/chatEvents";

const LoginPage = () => {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // chốt username tại thời điểm bấm login (tránh stale state)
  const attemptUserRef = useRef("");

  useEffect(() => {
    let unsubscribe: undefined | (() => void);

    connectSocket().then(() => {
      unsubscribe = onSocketMessage((raw) => {
        const msg = raw as WsResponse<any>;

        if (msg?.event === ChatEvent.LOGIN) {
          setLoading(false);

          const mes = (msg as any)?.mes || "";
          const isAlreadyLoggedIn =
            typeof mes === "string" && mes.includes("already logged in");

          if (msg?.status === "success" || isAlreadyLoggedIn) {
            const u = attemptUserRef.current || user;
            localStorage.setItem("user", u);

            if (msg.data?.RE_LOGIN_CODE) {
              localStorage.setItem("reLoginCode", msg.data.RE_LOGIN_CODE);
            }

            navigate("/chat");
            return;
          }

          alert("Sai tài khoản hoặc mật khẩu");
        }
      });
    });

    return () => unsubscribe?.();
  }, [navigate, user]);

  const handleLogin = async () => {
    if (!user || !pass) {
      alert("Vui lòng nhập đủ thông tin");
      return;
    }

    try {
      setLoading(true);
      attemptUserRef.current = user; // chốt user cho lần login này
      await connectSocket();
      login(user, pass);
    } catch {
      setLoading(false);
      alert("Không thể kết nối WebSocket");
    }
  };

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

export default LoginPage;
