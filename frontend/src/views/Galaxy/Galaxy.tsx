import { useState, useEffect } from 'react';
import { services, type Wish } from '../../services/wishService';
import BackButton from '@/components/common/BackButton.tsx';
import ProfileButton from '@/components/common/ProfileButton.tsx';
import { getAvatarUrl } from '@/utils/avatar';
import '@/styles/Galaxy.css';

export const Galaxy = () => {
  // 心愿列表与分页状态
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // 加载心愿列表（首次与翻页）
  useEffect(() => {
    // 每次 page 变化时加载数据
    let mounted = true;
    const loadWishes = async () => {
      try {
        setLoading(true);
        const res = await services.getMyWishes(page, 20);
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

  // 重试加载（重置到第一页）
  const handleRetry = () => {
    setError(null);
    setPage(1);
  };

  // 加载更多
  const handleLoadMore = () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    // 使用 setTimeout 模拟微小延迟，避免与主 loading 状态冲突
    setTimeout(() => {
      setPage(prev => prev + 1);
      setLoadingMore(false);
    }, 0);
  };

  const renderContent = () => {
    if (loading && page === 1) {
      return <div className="galaxy-status">正在加载心愿...</div>;
    }
    if (error) {
      return (
        <div className="galaxy-status error">
          <span>{error}</span>
          <button className="retry-button" onClick={handleRetry}>重试</button>
        </div>
      );
    }
    if (!loading && wishes.length === 0) {
      return <div className="galaxy-status empty">暂无心愿，快去许一个吧~</div>;
    }
    return (
      <>
        <ul className="wish-list">
          {wishes.map(w => (
            <li key={w.id} className="wish-item">
              <img src={getAvatarUrl(w.avatarId)} alt={w.nickname} className="wish-avatar" />
              <div className="wish-main">
                <div className="wish-header">
                  <span className="wish-nickname">{w.nickname}{w.isOwn && <span className="own-tag">(我)</span>}</span>
                  <span className="wish-time">{new Date(w.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="wish-content">{w.content}</p>
                <div className="wish-meta">
                  <span>点赞: {w.likeCount}</span>
                  <span>评论: {w.commentCount}</span>
                  <span>{w.isPublic ? '公开' : '私密'}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="pagination-bar">
          {hasMore ? (
            <button
              className="load-more-button"
              onClick={handleLoadMore}
              disabled={loadingMore}
            >{loadingMore ? '加载中...' : '加载更多'}</button>
          ) : (
            <span className="no-more">已到底部</span>
          )}
        </div>
      </>
    );
  };

  return (
    <div className="wish-list-container">
      <div className="header">
        <BackButton />
        <h2 className="title">小雪心愿单</h2>
        <ProfileButton />
      </div>
      <div className="galaxy-body">
        {renderContent()}
      </div>
    </div>
  );
}

export default Galaxy;