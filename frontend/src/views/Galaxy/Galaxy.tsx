 import { useState, useEffect } from 'react';
import BackButton from "@/components/common/BackButton.tsx";
import ProfileButton from "@/components/common/ProfileButton.tsx";
import snowflakeImg from "@/assets/images/雪花.svg";
import "@/styles/Galaxy.css"
import { services, type Wish } from '../../services/wishService';

function Galaxy() {
  // 核心状态
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);

  // 数据加载逻辑
  useEffect(() => {
    let mounted = true;
    const loadWishes = async () => {
      if (page === 1) setLoading(true);
      setError(null);
      
      try {
        const res = await services.getMyWishes(page, 20);
        if (!mounted) return;
        setWishes(prev => page === 1 ? res.wishes : [...prev, ...res.wishes]);
        setHasMore(res.pagination.hasMore);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || '加载心愿失败');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadWishes();
    return () => { mounted = false; };
  }, [page]);

  // 滚动加载
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrollPosition = target.scrollTop + target.clientHeight;
    const threshold = target.scrollHeight - 100;
    
    if (scrollPosition >= threshold && hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <div className="wish-list-container">
      {/* 头部导航 */}
      <div className="header">
        <BackButton />
        <h2 className="title">小雪心愿单</h2>
        <ProfileButton />
      </div>
      
      {/* 心愿列表 */}
      <div className="wish-list" onScroll={handleScroll}>
        {/* 加载中状态 */}
        {loading && page === 1 && (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>正在加载心愿...</p>
          </div>
        )}
        
        {/* 错误提示 */}
        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => setPage(1)}>重新加载</button>
          </div>
        )}
        
        {/* 空状态 */}
        {!loading && !error && wishes.length === 0 && (
          <div className="empty-state">
            <img src={snowflakeImg} alt="空心愿单" />
            <p>还没有心愿哦~</p>
          </div>
        )}
        
        {/* 加载更多提示 */}
        {loading && page > 1 && (
          <div className="loading-more">
            <span>加载更多心愿...</span>
          </div>
        )}
        {!hasMore && wishes.length > 0 && (
          <div className="no-more">已经到底啦~</div>
        )}
      </div>
    </div>
  );
};
export default Galaxy;