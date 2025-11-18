import axios, {
    type AxiosInstance,
    type InternalAxiosRequestConfig,
    type AxiosResponse,
} from "axios";
import { useUserStore } from "../store/userStore";



// 设置基础 URL（从环境变量获取）
const API_BASE_URL: string | undefined = import.meta.env.VITE_API_BASE_URL;
// 创建 axios 实例
const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000, // 5 秒超时
    headers: {
        "Content-Type": "application/json",
    },
});
// 定义统一业务响应包装体
interface ApiEnvelope<T> {
    code: number;
    msg?: string;      // 设为可选
    message?: string;
    data: T;
}

// 设置请求拦截器（自动附加 Token）
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // 优先从全局 store 获取 token，不存在再回退到 localStorage
        const storeToken = (useUserStore as any)?.getState?.()?.token as string | null | undefined;
        const token = storeToken ?? localStorage.getItem("token");

        // 如果 token 存在，就把它添加到每个请求的 Header 中
        if (token) {
            config.headers.set("Authorization", `Bearer ${token}`);
        }

        return config; // 放行请求
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 防止 401 导致重复跳转
let redirecting = false;

// 设置响应拦截器（统一处理错误和响应）
apiClient.interceptors.response.use(
    (response: AxiosResponse): any => {
        const res = response.data;
        console.log('API Response:', res);
        // 统一处理业务错误，后面发现后端用状态码区分业务错误，暂时保留这段逻辑
        if (res.code !== 200) {
            // 拒绝结构化业务错误，便于调用方分支处理
            const errorMessage = res.data?.error || res.message || res.msg || "业务错误";
            console.log(errorMessage);
            return Promise.reject({
                code: res.code,
                msg: errorMessage,
                data: res.data,
                isBusinessError: true,
            });
        }
        // 保持返回包装体 { code, msg, data }
        return res;
    },
    (error) => {
        // 统一处理 HTTP 错误里的业务错误
        if (error.response) {
            const status = error.response.status as number;
            const body = error.response.data as Partial<ApiEnvelope<any>> | undefined;
            const errorMessage = body?.data.error;
            if (status === 401 && !redirecting) {
                redirecting = true;
                try { localStorage.removeItem("token"); } catch { }
                try { (useUserStore as any)?.getState?.()?.logout?.(); } catch { }
                console.error("未认证或 token 失效，正在跳转登录");
                window.location.href = '/login';
            }

            return Promise.reject({
                httpStatus: status,
                code: body?.code,
                msg: errorMessage || '请求失败',
                data: body?.data,
                isHttpError: true,
            });
        }

        // 网络错误
        return Promise.reject({
            code: -1,
            msg: '网络错误',
            data: null,
            isNetworkError: true,
        });
    }
);

//  导出配置好的实例
export default apiClient;