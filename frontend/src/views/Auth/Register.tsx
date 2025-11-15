import  React, { useState } from 'react';
import { useNavigate, Link } from "react-router-dom";
import { useUserStore } from '@/store/userStore';
import { authService } from '@/services/authService';
import Button from '@/components/common/Button';
import '@/styles/register.css';
import '@/styles/main.css'

export const Register = () => {
  const [username, setUsername] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
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
      const res = await authService.register({nickname, username, password });
      if (res.code === 200) {
        const { token, user } = res.data;
        setToken(token);
        setUser(user);
        setPassword(''); // 清理敏感数据
        navigate('/');   // 注册即登录
      } else {
        setError(res.msg || '注册失败');
      }
    } catch (err: any) {
      setError(err?.message || '网络错误');
    } finally {
      setLoading(false);
    }
  };

  return (
     <div className="register-container">
            <div className="register-title">创建账户</div>
            <div className="input-container">
            <div className="nickname">
                <span className="nickname-label">昵称：</span>
                <input
                    type="text"
                    value={nickname}
                    placeholder="请输入昵称"
                    onChange={(e) => setNickname(e.target.value)}
                    disabled={loading}
                />
            </div>
            <div className="username">
                <span className="username-label">学号：</span>
                <input
                    type="text"
                    value={username}
                    placeholder="请输入账号/学号"
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                />
            </div>
            <div className="password">
                <span className="password-label">密码：</span>
                <input
                    type="password"
                    value={password}
                    placeholder="请输入密码"
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                />
            </div>
            </div>
            
            <div className="register-button-container">
              {!loading && (
                <Button 
                    onClick={handleSubmit} 
                    text="注册"
                    className="register-button"
                    disabled={!username || !password || !nickname}
                />
              )}
            </div>

                {error && (
                    <div className="error-message">
                      {error}
                    </div>
                )}

                <div className="register-notice">已有账号？
                  <Link to="/login" className="register-link">立即登录</Link>
                </div>
        </div>
  );
};

export default Register;