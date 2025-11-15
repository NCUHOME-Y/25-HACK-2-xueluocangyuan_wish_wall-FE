import { useState, useEffect, useCallback } from 'react';
import { useUserStore } from '@/store/userStore';
import { services, type Wish } from '../../services/wishService';
import BackButton from '@/components/common/BackButton.tsx';
// 移除右上角个人心愿跳转按钮
import { getAvatarUrl } from '@/utils/avatar';
import '@/styles/Galaxy.css';
import commentButton from '@/assets/images/commentButton.svg';

export const Galaxy = () => {
  // 心愿列表与分页状态
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [openCommentsId, setOpenCommentsId] = useState<number | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<number, { list: Array<{id:number;userNickname:string;userAvatarId:number;userAvatarUrl?: string; content:string;createdAt:string; isOwn?: boolean}>; loading: boolean; error?: string }>>({});
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);
  const user = useUserStore(s => s.user);

  const handleDeleteComment = useCallback(async (wishId: number, commentId: number) => {
    const entry = commentsMap[wishId];
    if (!entry) return;
    const target = entry.list.find(c => c.id === commentId);
    if (!target || !target.isOwn) return;
    setDeletingCommentId(commentId);
    // 乐观更新：先从列表移除
    const prevList = entry.list;
    setCommentsMap(prev => ({ ...prev, [wishId]: { ...prev[wishId], list: prevList.filter(c => c.id !== commentId) } }));
    try {
      await services.deleteComment(commentId);
      // 同步减少展示的 commentCount（可选）
      setWishes(prev => prev.map(w => w.id === wishId ? { ...w, commentCount: Math.max(0, (w.commentCount || 0) - 1) } : w));
    } catch (e) {
      // 回滚
      setCommentsMap(prev => ({ ...prev, [wishId]: { ...prev[wishId], list: prevList } }));
    } finally {
      setDeletingCommentId(null);
    }
  }, [commentsMap, setCommentsMap, setWishes]);

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
              <img src={(w as any).avatarUrl ? (w as any).avatarUrl : getAvatarUrl(w.avatarId)} alt={w.nickname} className="wish-avatar" />
              <div className="wish-main">
                <div className="wish-header">
                  <span className="wish-time">{new Date(w.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="wish-content">{w.content}</p>
                <div className="wish-meta">
                  <span>点赞: {w.likeCount}</span>
                  <button
                    className="comment-button"
                    onClick={async () => {
                      if (openCommentsId === w.id) {
                        setOpenCommentsId(null);
                        return;
                      }
                      setOpenCommentsId(w.id);
                      setCommentsMap(prev => ({
                        ...prev,
                        [w.id]: { list: prev[w.id]?.list || [], loading: true }
                      }));
                      try {
                        const res = await services.getWishComments(w.id, 1, 50);
                        const list = (res as any)?.list || [];
                        const normalized = list.filter((c: any) => c && typeof c === 'object').map((c: any) => ({
                          id: Number(c.id) || 0,
                          userId: Number((c as any).userId ?? (c as any).uid ?? (c as any).user_id ?? ((c as any).user && (c as any).user.id) ?? 0),
                          userNickname: String(
                            c.userNickname || c.userNickName || c.nickname || c.nickName || c.user_name ||
                            (c.user && (c.user.nickname || c.user.nickName)) || '匿名用户'
                          ),
                          userAvatarId: typeof (c as any).userAvatarId === 'number' ? (c as any).userAvatarId : 0,
                          userAvatarUrl: (c as any).userAvatarUrl ? (c as any).userAvatarUrl : (typeof (c as any).userAvatar === 'string' ? (c as any).userAvatar :
                            (typeof (c as any).userAvatarId === 'string' ? (c as any).userAvatarId :
                              (typeof (c as any).avatar_id === 'string' ? (c as any).avatar_id : undefined))),
                          content: String(c.content || ''),
                          createdAt: c.createdAt || new Date().toISOString(),
                          isOwn: Boolean(
                            (c as any).isOwn || (c as any).mine || (c as any).own ||
                            ((user?.id != null) ? (Number((c as any).userId ?? 0) === Number(user.id)) : false) ||
                            ((user?.nickname && typeof user.nickname === 'string') ? (String(
                              c.userNickname || c.userNickName || c.nickname || c.nickName || c.user_name ||
                              (c.user && (c.user.nickname || c.user.nickName)) || ''
                            ) === user.nickname) : false)
                          ),
                        }))
                        // 时间升序，阅读更有序；如需最新在前可改为 b-a
                        .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                        setCommentsMap(prev => ({ ...prev, [w.id]: { list: normalized, loading: false } }));
                      } catch (e: any) {
                        setCommentsMap(prev => ({ ...prev, [w.id]: { list: [], loading: false, error: e?.message || '加载失败' } }));
                      }
                    }}
                  >
                    <img src={commentButton} alt="评论" className="icon-image" />
                    <span className="text">{openCommentsId === w.id ? '评论' : '评论'} {w.commentCount}</span>
                  </button>
                </div>
                {openCommentsId === w.id && (
                  <div className="galaxy-comments">
                    {commentsMap[w.id]?.loading ? (
                      <div className="galaxy-comments-status">加载评论中...</div>
                    ) : (commentsMap[w.id]?.error ? (
                      <div className="galaxy-comments-status error">{commentsMap[w.id]?.error}</div>
                    ) : (
                      (commentsMap[w.id]?.list?.length ?? 0) === 0 ? (
                        <div className="galaxy-comments-status empty">暂无评论</div>
                      ) : (
                        commentsMap[w.id]!.list.map(c => (
                          <div key={c.id} className="comment-item">
                            <img src={(c as any).userAvatarUrl ? (c as any).userAvatarUrl : getAvatarUrl(c.userAvatarId)} alt="头像" className="avatar-small" />
                            <div className="comment-body">
                              <span className="comment-author">{c.userNickname}</span>
                              <div className="comment-main">
                                <p className="comment-text">{c.content}</p>
                                <span className="comment-time">{new Date(c.createdAt).toLocaleString()}</span>
                              </div>
                              {c.isOwn && (
                                <button
                                  className="delete-comment-button"
                                  onClick={() => handleDeleteComment(w.id, c.id)}
                                  disabled={deletingCommentId === c.id}
                                >{deletingCommentId === c.id ? '删除中...' : '删除'}</button>
                              )}
                            </div>
                          </div>
                        ))
                      )
                    ))}
                  </div>
                )}
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
        <div style={{ width: 90 }} />
      </div>
      <div className="galaxy-body">
        {renderContent()}
      </div>
    </div>
  );
}

export default Galaxy;