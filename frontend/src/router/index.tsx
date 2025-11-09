import { createBrowserRouter } from "react-router-dom";

// 根框架组件
import App from "../App";

// 页面组件
import Login from "../views/Auth/Login";
import Register from "../views/Auth/Register";
import PublicFeed from "../views/PublicFeed/PublicFeed";
import Galaxy from "../views/Galaxy/Galaxy";

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
    // 带 <App> 框架的页面
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <PublicFeed /> },
      { path: "publicfeed", element: <PublicFeed /> },
      { path: "galaxy", element: <Galaxy /> },
    ],
  },
]);

export default router;
