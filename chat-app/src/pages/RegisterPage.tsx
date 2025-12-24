import { useEffect, useState } from "react";
import { register } from "../api/authApi";
import { connectSocket } from "../api/socket";
import { useNavigate, Link } from "react-router-dom";
import "../styles/LoginPage.css";

const RegisterPage = () => {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    connectSocket((msg) => {

      // REGISTER thành công
      if (msg.event === "REGISTER" && msg.status === "success") {
        alert("Đăng ký thành công, vui lòng đăng nhập");
        navigate("/login");
      }

      // REGISTER lỗi
      if (msg.event === "REGISTER" && msg.status === "error") {
        alert(msg.message || "Đăng ký thất bại");
        setLoading(false);
      }

    });
  }, [navigate]);

  const handleRegister = () => {
    if (!user || !pass) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    setLoading(true);
    register(user, pass);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Đăng ký NLU Chat App</h2>

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

        <button
          className="login-button"
          onClick={handleRegister}
          disabled={loading}
        >
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
