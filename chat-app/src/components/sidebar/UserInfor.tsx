import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../../constants/routes";
import { authService } from "../../services/authApi";

type Props = { me: string };

export default function UserInfor({ me }: Props) {
  const navigate = useNavigate();

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
