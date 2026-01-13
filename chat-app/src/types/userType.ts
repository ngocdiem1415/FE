export type UserItem = {
    name: string;
    type: number;
    actionTime: string;
};

export interface CheckUserExitResponse {
    status: boolean;
    user: string;
}