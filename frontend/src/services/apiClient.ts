import axios, {
    type AxiosInstance,
    type InternalAxiosRequestConfig,
    type AxiosResponse,
} from "axios";
import { useUserStore } from "../store/userStore";
// 设置基础 URL（从 Apifox 获取）
const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL;
// 创建 axios 实例
const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000, // 10 秒超时
    headers: {
        "Content-Type": "application/json",
    },
});

// 设置请求拦截器（自动附加 Token）
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
    // 优先从全局 store 获取 token，不存在再回退到 localStorage
    const storeToken = (useUserStore as any)?.getState?.()?.token as string | null | undefined;
    const token = storeToken ?? localStorage.getItem("token");

        // 如果 token 存在，就把它添加到每个请求的 Header 中
        if (token) {
            const headers: any = config.headers as any;
            if (typeof headers?.set === "function") {
                headers.set("Authorization", `Bearer ${token}`);
            } else {
                headers["Authorization"] = `Bearer ${token}`;
            }
        }

        return config; // 放行请求
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 设置响应拦截器（统一处理错误和响应）
apiClient.interceptors.response.use(
    (response: AxiosResponse): any => {
        const res = response.data;

        // 统一处理业务错误
        if (res.code !== 200) {

            console.error("业务错误:", res.msg);

            // 拒绝 Promise，让调用方可以 .catch()
            return Promise.reject(new Error(res.msg || "Error"));
        }

        // 如果业务成功，只返回业务数据 data
        return res.data;
    },
    (error) => {
        // 统一处理 HTTP 错误
        if (error.response) {
            // 统一处理 401 Token 失效 
            if (error.response.status === 401) {
                // 在这里执行“强制跳转到登录页”的逻辑
                // window.location.href = '/login'; 
                // 简单清理本地 token，避免后续请求继续携带无效凭证
                try { localStorage.removeItem("token"); } catch {}
                try { (useUserStore as any)?.getState?.()?.logout?.(); } catch {}
                console.error("Token 失效或未认证，请重新登录");
            }
        }
        return Promise.reject(error);
    }
);

//  导出配置好的实例
export default apiClient;