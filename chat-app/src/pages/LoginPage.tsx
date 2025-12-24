import { useEffect, useState } from "react";
import { connectSocket, sendSocket } from "../api/socket";
import { login } from "../api/authApi";
import { useNavigate, Link } from "react-router-dom";
import "../styles/LoginPage.css";

const LoginPage = () => {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    connectSocket((msg) => {

      // 🔹 BƯỚC 1: Server yêu cầu RE_LOGIN
      if (msg.event === "RE_LOGIN" && msg.status === "success") {
        const code = msg.data?.RE_LOGIN_CODE;
        if (!code) return;

        localStorage.setItem("RE_LOGIN_CODE", code);
        localStorage.setItem("user", user);

        // gửi lại RE_LOGIN để hoàn tất login
        sendSocket({
          action: "onchat",
          data: {
            event: "RE_LOGIN",
            data: {
              user,
              code
            }
          }
        });
      }

      // 🔹 BƯỚC 2: Login hoàn tất
      if (msg.event === "LOGIN" && msg.status === "success") {
        navigate("/chat");
      }

      if (msg.status === "error") {
        alert("Sai tài khoản hoặc mật khẩu");
      }
    });
  }, [navigate, user]);

  const handleLogin = () => {
    if (!user || !pass) {
      alert("Vui lòng nhập đủ thông tin");
      return;
    }
    login(user, pass);
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

        <button className="login-button" onClick={handleLogin}>
          Đăng nhập
        </button>

        <p className="login-footer">
          Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
