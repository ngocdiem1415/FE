import { useState } from "react";
import { register } from "../api/authApi";
import { useNavigate, Link } from "react-router-dom";
import "../styles/LoginPage.css"; // dùng chung CSS với Login

const RegisterPage = () => {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!user || !pass) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      setLoading(true);
      const res = await register(user, pass);

      if (res.status === "success" && res.event === "RE_LOGIN") {
        localStorage.setItem("RE_LOGIN_CODE", res.data.RE_LOGIN_CODE);
        localStorage.setItem("user", user);

        alert("Đăng ký thành công – tự động đăng nhập");
        navigate("/chat");
      } else {
        alert("Đăng ký thất bại");
      }
    } catch {
      alert("Không kết nối được server");
    } finally {
      setLoading(false);
    }
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
