import React, { useState, useCallback, useRef, useEffect } from 'react';
import WishDanmu from './WishDanmu.tsx';
import Modal from '@/components/common/Modal.tsx';
import '@/styles/danmuModal.css';
import '@/styles/wishdanmu.css';
import '@/styles/wishModal.css';
import commentButton from '@/assets/images/commentButton.svg';
import like from '@/assets/images/likeButton.svg';
import dislike from '@/assets/images/dislikeButton.svg';
import { addComment, getWishInteractions, likeWish, deleteComment, getWishComments } from '@/services/wishService';
import { type Wish } from '@/services/wishService';
import Button from '@/components/common/Button.tsx';
import { getAvatarUrl } from '@/utils/avatar';
import closeIcon from '@/assets/images/closeButton.svg';
import { useUserStore } from '@/store/userStore';

// 本地定义评论类型，匹配服务端返回字段
type WishComment = {
  id: number;
  userId?: number;
  userNickname: string;
  userAvatarId: number;
  userAvatarUrl?: string;
  content: string;
  createdAt: string;
  isOwn: boolean;
};

interface DanmuFlowProps {
  wishes: Wish[];
  loading: boolean;
  onDataChange: () => void; // 仍可用于强制重新拉取
  onWishUpdate?: (patch: { id: number; likeCount?: number; commentCount?: number; isLiked?: boolean }) => void; // 局部同步
}

interface WishWithLiked extends Wish {
  isLiked: boolean;
}

function isAbortError(error: unknown): error is DOMException {
  return error instanceof DOMException && error.name === 'AbortError';
}

const DanmuFlow: React.FC<DanmuFlowProps> = ({ wishes, loading, onDataChange, onWishUpdate }) => {
  // 使用 ref 管理请求取消
  const abortControllerRef = useRef<AbortController | null>(null);


  // 弹窗状态
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalWish, setModalWish] = useState<WishWithLiked | null>(null);
  const [comments, setComments] = useState<WishComment[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const [isLiking, setIsLiking] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);
  const user = useUserStore(s => s.user);
  const currentUserId = Number((user as any)?.id ?? (user as any)?.userId ?? (user as any)?.uid ?? 0);

  // 新增：控制评论区显隐状态
  const [showComments, setShowComments] = useState(false);
  const commentsSectionRef = useRef<HTMLDivElement | null>(null);

  // 点击弹幕打开详情
  const handleDanmuClick = useCallback(async (wish: Wish) => {
    // 取消之前的请求
    abortControllerRef.current?.abort();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // 先拿点赞等交互状态
      const interactions = await getWishInteractions(wish.id);

      const enhancedWish: WishWithLiked = {
        ...wish,
        // 从交互数据中获取最新点赞状态与数量，避免展示旧数据
        isLiked: interactions?.likes?.currentUserLiked ?? false,
        likeCount: interactions?.wishInfo?.likeCount ?? interactions?.likes?.totalCount ?? wish.likeCount,
        commentCount: interactions?.wishInfo?.commentCount ?? wish.commentCount,
      };

      setModalWish(enhancedWish);
      setIsModalOpen(true);

      // 使用独立评论接口，避免 interactions 返回的点赞列表干扰
      const commentRes = await getWishComments(wish.id, 1, 50);
      const commentsData: WishComment[] = (commentRes?.list ?? [])
        .filter((c: any) => c && typeof c === 'object')
        .map((c: any) => ({
          id: Number(c.id) || 0,
          userId: Number((c as any).userId ?? (c as any).uid ?? (c as any).user_id ?? ((c as any).user && (c as any).user.id) ?? 0),
          userNickname: String(
            (c as any).userNickname || (c as any).userNickName || (c as any).nickname || (c as any).nickName || (c as any).user_name ||
            ((c as any).user && ((c as any).user.nickname || (c as any).user.nickName)) || '匿名用户'
          ),
          userAvatarId: typeof (c as any).userAvatarId === 'number' ? (c as any).userAvatarId : 0,
          userAvatarUrl: (c as any).userAvatarUrl ? (c as any).userAvatarUrl : (typeof (c as any).userAvatar === 'string' ? (c as any).userAvatar :
            (typeof (c as any).userAvatarId === 'string' ? (c as any).userAvatarId :
              (typeof (c as any).avatar_id === 'string' ? (c as any).avatar_id : undefined))),
          content: String(c.content || ''),
          createdAt: c.createdAt || new Date().toISOString(),
          isOwn: Boolean(
            (c as any).isOwn || (c as any).mine || (c as any).own ||
            (currentUserId ? (Number((c as any).userId ?? (c as any).uid ?? (c as any).user_id ?? ((c as any).user && (c as any).user.id) ?? 0) === currentUserId) : false) ||
            ((user?.nickname && typeof user.nickname === 'string') ? (String(
              (c as any).userNickname || (c as any).userNickName || (c as any).nickname || (c as any).nickName || (c as any).user_name ||
              ((c as any).user && ((c as any).user.nickname || (c as any).user.nickName)) || ''
            ) === user.nickname) : false)
          ),
        }));
      setComments(commentsData);
      setShowComments(commentsData.length > 0);

    } catch (err: any) {
      if (!isAbortError(err)) {
        console.error('获取评论失败:', err?.msg || err?.message || err);
        setComments([]); // 失败时清空评论
      }
    }
  }, []);

  // 关闭弹窗
  const handleCloseModal = useCallback(() => {
    // 取消未完成的请求
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;

    setIsModalOpen(false);
    setModalWish(null);
    setComments([]);
    setCommentInput('');
    setIsLiking(false);
    setIsSubmittingComment(false);
    setShowComments(false); // 新增：关闭弹窗时重置评论区状态
  }, []);

  // 已用 handleCloseModal 作为统一关闭并清理函数，去掉未使用的快捷关闭

  // 点赞处理
  const handleLike = useCallback(async () => {
    if (!modalWish || isLiking) return;
    setIsLiking(true);
    const prev = modalWish;
    const optimisticLiked = !prev.isLiked;
    const optimisticCount = Math.max(0, prev.likeCount + (optimisticLiked ? 1 : -1));
    // 乐观切换（支持取消点赞）
    setModalWish(cur => cur ? { ...cur, isLiked: optimisticLiked, likeCount: optimisticCount } : cur);
    try {
      const res = await likeWish(modalWish.id);
      // 兼容 204 或无字段返回：用乐观值兜底
      const nextLiked = (res as any)?.liked ?? optimisticLiked;
      const nextCount = Number.isFinite((res as any)?.likeCount) ? (res as any).likeCount : optimisticCount;
      setModalWish(cur => cur ? { ...cur, likeCount: nextCount, isLiked: nextLiked } : cur);
      onWishUpdate?.({ id: modalWish.id, likeCount: nextCount, isLiked: nextLiked });
    } catch (err: any) {
      console.error('点赞失败:', err?.msg || err?.message || err);
      // 回滚
      setModalWish(prev);
    } finally {
      setIsLiking(false);
    }
  }, [modalWish, isLiking, onWishUpdate]);

  // 新增：处理评论按钮点击
  const handleToggleComments = useCallback(() => {
    setShowComments(true);
  }, []);

  // 新增：评论区展开后自动聚焦输入框
  useEffect(() => {
    if (showComments) {
      commentsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      document.getElementById('comment-input')?.focus();
    }
  }, [showComments]);

  // 评论处理
  const handleComment = useCallback(async () => {
    if (!modalWish || !commentInput.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      const newComment = await addComment(modalWish.id, commentInput.trim());
      // 添加到列表头部，即时反馈
      setComments(prev => [
        {
          id: (newComment as any).id,
          userNickname: (newComment as any).userNickname,
          userAvatarId: typeof (newComment as any).userAvatarId === 'number' ? (newComment as any).userAvatarId : 0,
          userAvatarUrl: typeof (newComment as any).userAvatar === 'string' ? (newComment as any).userAvatar :
            (typeof (newComment as any).userAvatarId === 'string' ? (newComment as any).userAvatarId :
              (typeof (newComment as any).avatar_id === 'string' ? (newComment as any).avatar_id : undefined)),
          content: (newComment as any).content,
          createdAt: (newComment as any).createdAt,
          isOwn: Boolean((newComment as any).isOwn || true),
        } as WishComment,
        ...prev,
      ]);
      setCommentInput('');
      setModalWish(prev => prev ? { ...prev, commentCount: prev.commentCount + 1 } : null);
      onWishUpdate?.({ id: modalWish.id, commentCount: (modalWish.commentCount + 1) });
      // onDataChange(); // 可选刷新
    } catch (err: any) {
      console.error('评论失败:', err?.msg || err?.message || err);
    } finally {
      setIsSubmittingComment(false);
    }
  }, [modalWish, commentInput, isSubmittingComment, onDataChange, onWishUpdate]);

  // 删除评论
  const handleDeleteComment = useCallback(async (commentId: number) => {
    if (!modalWish || deletingCommentId) return;
    const target = comments.find(c => c.id === commentId);
    if (!target || !target.isOwn) return;
    setDeletingCommentId(commentId);
    try {
      await deleteComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
      setModalWish(prev => prev ? { ...prev, commentCount: Math.max(0, prev.commentCount - 1) } : prev);
      if (modalWish) {
        onWishUpdate?.({ id: modalWish.id, commentCount: Math.max(0, modalWish.commentCount - 1) });
      }
    } catch (err: any) {
      console.error('删除评论失败:', err?.msg || err?.message || err);
    } finally {
      setDeletingCommentId(null);
    }
  }, [comments, modalWish, deletingCommentId, onWishUpdate]);

  // 组件卸载时清理请求
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  // 弹幕渲染
  const danmuRows = wishes.slice(0, 15).map((wish) => (
    <div
      key={wish.id}
      className="danmu-row"
      style={{
        height: '50px',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        fontSize: '5rem',
      }}
    >
      <WishDanmu
        data={{
          id: wish.id,
          wishContent: wish.content,
          nickName: wish.nickname,
          avatar: getAvatarUrl(wish.avatarId),
        }}
        onDanmuClick={() => handleDanmuClick(wish)}
      />
    </div>
  ));

  return (
    <div className="danmu-flow-container">
      <div className="danmu-area">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>加载中...</div>
        ) : wishes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>暂无数据</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {danmuRows}
          </div>
        )}
      </div>

      <Modal visible={isModalOpen} onClose={handleCloseModal}>
        {modalWish && (
          <div className="wish-detail-modal">
            {/* 用户信息 */}
            <div className="user-info">
              <img src={getAvatarUrl(modalWish.avatarId)} alt="头像" className="avatar" />
              <span className="nickname">{modalWish.nickname}</span>
              <Button
                onClick={handleCloseModal}
                className="close-button"
                icon={closeIcon}
              />

            </div>

            {/* 心愿内容 */}
            <div className="wish-content">{modalWish.content}</div>

            {/* 互动区 - 优化按钮 */}
            <div className="interaction-bar">
              <Button
                text={`点赞 ${modalWish.likeCount}`}
                icon={modalWish.isLiked ? like : dislike}
                onClick={handleLike}
                className={`action-button like-button ${modalWish.isLiked ? 'liked' : ''}`}
                disabled={isLiking}
              />
              {/* 修改：点击切换评论区显示状态，并添加 active 类 */}
              <Button
                text={`评论 ${modalWish.commentCount}`}
                icon={commentButton}
                onClick={handleToggleComments}
                className={`action-button comment-button ${showComments ? 'active' : ''}`}
              />
            </div>

            {/* 修改：评论区整块条件渲染 */}
            {showComments && (
              <div className="comments-section" ref={commentsSectionRef}>
                <h4>评论区</h4>

                {/* 发表评论 */}
                <div className="comment-input-wrapper">
                  <input
                    id="comment-input"
                    type="text"
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleComment()}
                    placeholder="说点什么..."
                    className="comment-input"
                    disabled={isSubmittingComment}
                  />
                  <Button
                    text={isSubmittingComment ? '发送中...' : '发送'}
                    icon={commentButton}
                    onClick={handleComment}
                    disabled={!commentInput.trim() || isSubmittingComment}
                    className="send-button"
                  />
                </div>

                {/* 评论列表 */}
                <div className="comments-list">
                  {comments.length === 0 ? (
                    <p className="no-comments">暂无评论，快来抢沙发吧～</p>
                  ) : (
                    comments.map(comment => (
                      <div key={comment.id} className="comment-item">
                        <img src={(comment as any).userAvatarUrl ? (comment as any).userAvatarUrl : getAvatarUrl(comment.userAvatarId)} alt="头像" className="avatar-small" />
                        <div className="comment-body">
                          <span className="comment-author">{comment.userNickname}</span>
                          <div className="comment-main">
                            <p className="comment-text">{comment.content}</p>
                            <span className="comment-time">
                              {new Date(comment.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        {comment.isOwn && (
                          <Button
                            text={deletingCommentId === comment.id ? '删除中...' : '删除'}
                            onClick={() => handleDeleteComment(comment.id)}
                            disabled={deletingCommentId === comment.id}
                            className="delete-comment-button"
                          />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DanmuFlow;