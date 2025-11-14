import BackButton from "@/components/common/BackButton.tsx";
import ProfileButton from "@/components/common/ProfileButton.tsx";
import snowflakeImg from "@/assets/images/snowflake.svg";
import "@/styles/Galaxy.css"
import { useState, useEffect } from 'react';
// 导入 wishService 和数据类型
import { services, type Wish } from '../../services/wishService';

export const Galaxy = () => {
  // 用 useState 存储心愿列表
  const [wishes, setWishes] = useState<Wish[]>([]);
  // 增加 loading 和 error 状态
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  // 页面加载时调用 getMyWishes
  useEffect(() => {
//每次page变化时加载数据
    let mounted = true;

    const loadWishes = async () => {
      try {
        setLoading(true);
        const res = await services.getMyWishes(page, 20); // 返回 WishListResponse
        if (!mounted) return;
        setWishes(prev => page === 1 ? res.wishes : [...prev, ...res.wishes]);
        setHasMore(res.pagination.hasMore);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || '加载心愿失败');
      } finally {
        mounted && setLoading(false);
      }
    };

    loadWishes();
    // 清理函数，防止内存泄漏
    return () => {
      mounted = false;
    };
  }, [page]);
 
  return (
     <div className="wish-list-container">
  <div className="header">
    <BackButton />
    <h2 className="title">小雪心愿单</h2>
    <ProfileButton />
  </div>
  <div className="wish-list">
    {wishes.map((wish) => (
      <div key={wish.id} className="wish-item">
        <img src={snowflakeImg} alt="雪花" />
        <span className="wish-content">{wish.content}</span>
      </div>
    ))}
  </div>
</div>
  );
};
export default Galaxy;