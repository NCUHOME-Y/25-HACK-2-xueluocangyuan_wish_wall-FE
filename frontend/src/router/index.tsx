import { createBrowserRouter } from "react-router-dom";
import { useUserStore } from "@/store/userStore";
import { Navigate, Outlet } from "react-router-dom";
// 根框架组件
import App from "../App";
import ProfileImage from "../views/Profile/ProfileImage"

// 页面组件
import Login from "../views/Auth/Login";
import Register from "../views/Auth/Register";
import Galaxy from "../views/Galaxy/Galaxy";
import PublicFeed from "../views/PublicFeed/PublicFeed";
// 创建路由守卫
const ProtectedRoutes = () => {
  const token = useUserStore((state) => state.token);
  if (!token) {
    // 如果没有 token，重定向到登录页面
    return <Navigate to="/login" replace />;
  }// 如果有token，渲染路由组件
  return <Outlet />;
};

// 创建路由实例
const router = createBrowserRouter([
  {
    // 应用主框架，根路径公开，默认页面为 PublicFeed
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <PublicFeed /> },
      { path: "ProfileImage", element: <ProfileImage /> },
      { path: "galaxy", element: <Galaxy /> },
      // 需要鉴权的路由放到 ProtectedRoutes 下
      {
        element: <ProtectedRoutes />,
        children: [
          { index: true, element: <PublicFeed /> },
          { path: "publicfeed", element: <PublicFeed /> },
          { path: "galaxy", element: <Galaxy /> },
        ],
      },
    ],
  },
  // 登录/注册页面（供 ProtectedRoutes 重定向使用）
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
]);
export default router;
