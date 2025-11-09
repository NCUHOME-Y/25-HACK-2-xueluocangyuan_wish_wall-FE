
import apiClient from "./apiClient";
//登录/注册发送给后端的类型
export interface AuthCredentials {
    username: string;
    password: string;
}
//登录注册成功后，data返回的数据
interface AuthData{
    token: string;
    user: {
        id: number;
        username: string;
        avatar_id: string;
        nickname: string;
    }
}

//完整api响应体
interface ApiResponse<T> {
    data: T;
    code: number;
    msg: string;
}
//api函数
//用户登录
export const login= async (credentials: AuthCredentials) => {
    const response = await apiClient.post<ApiResponse<AuthData>>("/login", credentials);
    return response.data;
}
//用户注册
export const register= async (credentials: AuthCredentials) => {
    const response = await apiClient.post<ApiResponse<AuthData>>("/register", credentials);
    return response.data;
}
export const authService = {
    login,
    register,
};