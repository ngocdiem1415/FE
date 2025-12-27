import { useEffect, useState } from "react";
import { register } from "../services/authApi";
import { connectSocket, onSocketMessage } from "../api/socketClient";
import { useNavigate, Link } from "react-router-dom";
import "../styles/LoginPage.css";

const RegisterPage = () => {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let unsubscribe: undefined | (() => void);

    connectSocket().then(() => {
      unsubscribe = onSocketMessage((msg) => {
        if (msg?.event === "REGISTER") {
          setLoading(false);

          if (msg?.status === "success") {
            alert(msg?.data ?? "Đăng ký thành công");
            navigate("/login");
          } else {
            alert(msg?.data ?? "Đăng ký thất bại");
          }
        }
      });
    });

    return () => unsubscribe?.();
  }, [navigate]);

  const handleRegister = async () => {
    if (!user || !pass) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      setLoading(true);
      await connectSocket();
      register(user, pass);
    } catch {
      setLoading(false);
      alert("Không thể kết nối WebSocket");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Đăng ký</h2>

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

        <button className="login-button" onClick={handleRegister} disabled={loading}>
          {loading ? "Đang đăng ký..." : "Đăng ký"}
        </button>

        <p className="login-footer">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
