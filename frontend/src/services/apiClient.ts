import axios, {
    type AxiosInstance,
    type InternalAxiosRequestConfig,
    type AxiosResponse,
} from "axios";
// 假设用户数据存储在 userStore.ts 中
import { useUserStore } from "../store/userStore";
// 设置基础 URL（从 Apifox 获取）
const API_BASE_URL: string = "http://127.0.0.1:4523/m1/7353183-7083985-default/api";

// 创建 axios 实例
const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 5000, // 5 秒超时
    headers: {
        "Content-Type": "application/json",
    },
});

// 设置请求拦截器（自动附加 Token）
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // 从全局 store  中获取 token
        const token = useUserStore.getState().token;

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

// 设置响应拦截器（统一处理错误和响应）
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        const res = response.data;

        // 统一处理业务错误
        if (res.code !== 200) {

            console.error("业务错误:", res.msg);

            // 拒绝 Promise，让调用方可以 .catch()
            return Promise.reject(new Error(res.msg || "Error"));
        }

        // 如果业务成功，返回完整的 response
        return response;
    },
    (error) => {
        // 统一处理 HTTP 错误
        if (error.response) {
            // 统一处理 401 Token 失效 
            if (error.response.status === 401) {
                // 在这里执行“强制跳转到登录页”的逻辑
                // window.location.href = '/login'; 
                console.error("Token 失效或未认证，请重新登录");
            }
        }
        return Promise.reject(error);
    }
);

//  导出配置好的实例
export default apiClient;