import { Outlet } from 'react-router-dom';

function App() {
  return (
    <div className="app-container">
      {/* 这里可以放置一些所有页面共享组件 */}

      <main className="main-content">

        {/* 渲染子路由组件 */}
        <Outlet />
      </main>

    </div>
  );
}

export default App;