import { createBrowserRouter } from "react-router-dom";
import { useUserStore } from "@/store/userStore";
import { Navigate, Outlet } from "react-router-dom";
// 根框架组件
import App from "../App";

// 页面组件
import Login from "../views/Auth/Login";
import Register from "../views/Auth/Register";
import PublicFeed from "../views/PublicFeed/PublicFeed";
import Galaxy from "../views/Galaxy/Galaxy";
import Profile from "../views/Profile/Profile";
import ProfileImage from "../views/Profile/ProfileImage";
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
    // 独立页面
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    // 下面这些路由都需要已登录
    element: <ProtectedRoutes />,
    children: [
      {
        path: "/",
        element: <App />,
        children: [
          { index: true, element: <PublicFeed /> },
          { path: "publicfeed", element: <PublicFeed /> },
          { path: "galaxy", element: <Galaxy /> },
          { path: "profile", element: <Profile /> },
          { path: "profileImage", element: <ProfileImage /> },
        ],
      },
    ],
  },
]);
export default router;