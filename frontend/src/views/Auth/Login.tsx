
import {useState} from 'react';
import {authService} from '@/services/authService';
import { useNavigate } from "react-router-dom";
import { useUserStore } from '@/store/userStore';

export const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [ loading,setLoading]= useState<boolean>(false);
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
      if (res.code === 200) {
        const { token, user } = res.data;
        setToken(token);
        setUser(user);
        setPassword(''); // 清理敏感数据
        navigate('/');   // 登录后跳转
      } else {
        setError(res.msg || '登录失败');
      }
    } catch (err: any) {
      setError(err?.message || '网络错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    //曾，页面样式就交给你了，页面跳转可以看看我的router，
  );
};
export default Login;