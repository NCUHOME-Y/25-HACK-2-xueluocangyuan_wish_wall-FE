// src/main.tsx (修复后的版本)

import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import router from './router/index';
import './styles/main.css';

// 1. 导入你的 apiClient 和 userStore
import apiClient from './services/apiClient.ts';
import { useUserStore } from './store/userStore.ts';

// 2. ‼️ 在这里配置拦截器 ‼️
// (这段代码是从你 apiClient.ts 中剪切过来的)
// (请确保你 apiClient.ts 中的拦截器代码已被删除)

// 防止 401 导致重复跳转
let redirecting = false;

// 设置请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // ‼️ 现在可以安全地调用，不再需要 (as any) ?. ‼️
    const token = useUserStore.getState().token;
    
    // (你代码中的回退逻辑，虽然不推荐，但保持不变)
    const finalToken = token ?? localStorage.getItem("token");

    if (finalToken) {
      config.headers.set("Authorization", `Bearer ${finalToken}`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 设置响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (res.code !== 200) {
      return Promise.reject({
        code: res.code,
        msg: res.msg || "业务错误",
        data: res.data,
        isBusinessError: true,
      });
    }
    return res;
  },
  (error) => {
    if (error.response) {
      const status = error.response.status as number;
      const body = error.response.data;

      if (status === 401 && !redirecting) {
        redirecting = true;
        try { localStorage.removeItem("token"); } catch { }
        
        // ‼️ 现在可以安全地调用 ‼️
        try { useUserStore.getState().logout(); } catch { }

        console.error("未认证或 token 失效，正在跳转登录");
        window.location.href = '/login';
      }

      return Promise.reject({
        httpStatus: status,
        code: body?.code,
        msg: body?.msg || '请求失败',
        data: body?.data,
        isHttpError: true,
      });
    }
    // 网络错误
    return Promise.reject({
      code: -1,
      msg: error?.message || '网络错误',
      data: null,
      isNetworkError: true,
    });
  }
);

// 3. 启动应用
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);