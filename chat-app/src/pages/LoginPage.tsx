import { useEffect, useRef, useState } from "react";
import { connectSocket, onSocketMessage} from "../api/socketClient";
import { login } from "../services/authApi";
import { useNavigate, Link } from "react-router-dom";
import type {WsResponse} from "../types/commonType";
import "../styles/LoginPage.css";

const LoginPage = () => {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // tránh stale state khi WS trả về
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    let unsubscribe: undefined | (() => void);

    connectSocket().then(() => {
      unsubscribe = onSocketMessage((raw) => {
        const msg = raw as WsResponse<any>;
        // console.log("Server response:", msg);

        if (msg?.event === "LOGIN") {
          setLoading(false);

          if (msg?.status === "success") {
            localStorage.setItem("user", userRef.current);
            if (msg.data && msg.data.RE_LOGIN_CODE)
              localStorage.setItem("reLoginCode", msg.data.RE_LOGIN_CODE);

            navigate("/chat");
          } else {
            alert("Sai tài khoản hoặc mật khẩu");
          }
        }
      });
    });

    return () => unsubscribe?.();
  }, [navigate]);

  const handleLogin = async () => {
    if (!user || !pass) {
      alert("Vui lòng nhập đủ thông tin");
      return;
    }

    try {
      setLoading(true);
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
