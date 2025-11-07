import { createBrowserRouter } from "react-router-dom";
//引入根组件
import App from "../App.jsx";
//引入页面组件
import Login from "../views/Auth/Login.jsx"
import Register from "../views/Auth/register.jsx";
import Publicfeed from "../views/PublicFeed/PublicFeed.jsx";
import Galaxy from "../views/Galaxy/Galaxy.jsx";

//创建路由实例
const router = createBrowserRouter([
    {//独立页面路由
        path: "/Login",
        element: <Login />
    },
    {
        path: "/Register",
        element: <Register />
    },
    {//带<App>框架的页面路由
        path: "/",//根路径
        element: <App />,
        children: [
            //默认渲染页面<Publicfeed>
            { index: true, element: <Publicfeed /> },
            { path: "publicfeed", element: <Publicfeed /> },
            { path: "galaxy", element: <Galaxy /> }
        ]
    }
]);
//导出路由实例
export default router;