import  React, { useState } from 'react';
import { authService } from '@/services/authService';
import { useNavigate, Link } from "react-router-dom";
import { useUserStore } from '@/store/userStore';
import Button from '@/components/common/Button';
import '@/styles/login.css'

export const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess]= useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
 
  //从store获取设置用户信息的方法
  const setToken = useUserStore((state) => state.setToken);
  const setUser = useUserStore((state) => state.setUser);

  const handleSubmit = async (e: React.FormEvent) => {
    if (loading) return; // 防止重复提交
    e.preventDefault();
    if (!username || !password) {
      setError('请输入用户名与密码');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await authService.login({ username, password });
      if (res.code === 200 || res.code === 201) {
        const { token, user } = res.data;
        setToken(token);
        setUser(user);
        setPassword(''); // 清理敏感数据
        navigate('/');   // 登录后跳转
        setSuccess(true);
      } else {
        setError(res.msg || '登录失败');
      }
    } catch (err: any) {
      setError(err?.msg || err?.message || '网络错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-title">欢迎来到雪落藏愿</div>
      
      <div className="input-container">
      <div className="username-input-container">
        <span className="username">账号：</span>
        <input
          type="text"
          value={username}
          placeholder="请输入账号/学号"
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading || success}
        />
      </div>

      <div className="password-input-container">
        <span className="password">密码：</span>
        <input
          type="password"
          value={password}
          placeholder="请输入密码"
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading || success}
        />
      </div>
      </div>

       <div className="login-button-container">

        {!loading && !success && (
          <Button 
            text="登录"
            className="login-button" 
            onClick={handleSubmit}
          />
        )}
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="login-note">
        没有账号？<Link to="/register" className="register-link">立即注册</Link>
      </div>
    </div>
  );
};

export default Login;