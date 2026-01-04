export interface LoginData {
    user: string;
    pass: string;
}

export interface RegisterData {
    user: string;
    pass: string;
}

export interface ReLoginData {
    user: string;
    code: string;
}

export interface ReLoginResponse {
    RE_LOGIN_CODE: string;
}