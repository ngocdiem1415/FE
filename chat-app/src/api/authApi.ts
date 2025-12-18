const API_URL = "https://chat.longapp.site/";

// register
export const register = async (user: string, pass:string) => {
    const res = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            action: "onchat",
            data: {
                event: "REGISTER",
                data: {
                    username: user,
                    password: pass
                },
            },
         }),
    });

    if (!res.ok) {
        throw new Error("Đăng ký thất bại");
    }

    return res.json();
};

export const login = async (user: string, pass:string) => {
    const res = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            action: "onchat",
            data: {
                event: "LOGIN",
                data: {
                    username: user,
                    password: pass
                },
            },
         }),
    });
    if (!res.ok) {
        throw new Error("Đăng nhập thất bại");
    }
    return res.json();
};