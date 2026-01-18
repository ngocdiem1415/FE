import { useEffect, useState } from "react";
import { getCurrentUser, login, logout, User } from "../services/auth.service";

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = getCurrentUser();
        setUser(storedUser);
        setLoading(false);
    }, []);

    const handleLogin = (username: string) => {
        const u = login(username);
        setUser(u);
    };

    const handleLogout = () => {
        logout();
        setUser(null);
    };

    return {
        user,
        loading,
        login: handleLogin,
        logout: handleLogout,
        isAuthenticated: !!user?.isLoggedIn
    };
}
