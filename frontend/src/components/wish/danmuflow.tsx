import React, { useState, useCallback, useRef, useEffect } from 'react';
import WishDanmu from './WishDanmu.tsx';
import Modal from '@/components/common/Modal.tsx';
import '@/styles/wishdanmu.css';
import '@/styles/wishModal.css';
import commentButton from '@/assets/images/commentButton.svg';
import dislike from '@/assets/images/dislikeButton.svg';
import like from '@/assets/images/likeButton.svg'; 
import { likeWish, addComment, getWishInteractions } from '@/services/wishService';
import { type Wish } from '@/services/wishService';
import type { Comment } from '@/services/wishService.ts'; 
import Button from '@/components/common/Button.tsx';

interface DanmuFlowProps {
  wishes: Wish[];
  loading: boolean;
  onDataChange: () => void;
}

function isAbortError(error: unknown): error is DOMException {
  return error instanceof DOMException && error.name === 'AbortError';
}

const DanmuFlow: React.FC<DanmuFlowProps> = ({ wishes, loading, onDataChange }) => {
  // 使用 ref 管理请求取消
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // 弹窗状态
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalWish, setModalWish] = useState<Wish | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const [isLiking, setIsLiking] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  
  // 新增：控制评论区显隐状态
  const [showComments, setShowComments] = useState(false);

  // 点击弹幕打开详情
  const handleDanmuClick = useCallback(async (wish: Wish) => {
    // 取消之前的请求
    abortControllerRef.current?.abort();
    
    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    setModalWish(wish);
    setIsModalOpen(true);
    setShowComments(false); // 新增：打开弹窗时隐藏评论区
    
    try {
      // 加载评论列表
      const interactions = await getWishInteractions(wish.id);

      const enhancedWish : Wish = {
         ...wish,
         isLiked: interactions.likes.currentUserLiked,
      };

      setModalWish(enhancedWish);
      setIsModalOpen(true);

      const commentsData = interactions.comments.list.map(comment => ({
         ...comment,
      }));
      setComments(commentsData);

    } catch (err) {
      if (!isAbortError(err)) {
        console.error('获取评论失败:', err);
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

  // 点赞处理
  const handleLike = useCallback(async () => {
    if (!modalWish || isLiking || modalWish.isLiked) return;
    
    setIsLiking(true);
    try {
      const result = await likeWish(modalWish.id);
      // 更新本地状态
      setModalWish(prev => prev ? { ...prev, isLiked: true } : null);
      onDataChange(); // 通知父组件刷新
    } catch (err) {
      console.error('点赞失败:', err);
      alert('操作失败，请重试');
    } finally {
      setIsLiking(false);
    }
  }, [modalWish, isLiking, onDataChange]);

  // 新增：处理评论按钮点击
  const handleToggleComments = useCallback(() => {
    setShowComments(prev => !prev);
  }, []);

  // 新增：评论区展开后自动聚焦输入框
  useEffect(() => {
    if (showComments) {
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
      setComments(prev => [newComment, ...prev]);
      setCommentInput('');
      setModalWish(prev => prev ? { ...prev, commentCount: prev.commentCount + 1 } : null);
      onDataChange();
    } catch (err) {
      console.error('评论失败:', err);
    } finally {
      setIsSubmittingComment(false);
    }
  }, [modalWish, commentInput, isSubmittingComment, onDataChange]);

  // 组件卸载时清理请求
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  // 弹幕渲染
  const danmuRows = wishes.map((wish, index) => (
    <div 
      key={wish.id} 
      className="danmu-row"
      style={{ 
        height: '40px', 
        display: 'flex', 
        alignItems: 'center',
        overflow: 'hidden'
      }}
    >
      <WishDanmu
        data={{
          id: wish.id,
          wishContent: wish.content,
          nickName: wish.nickname,
          avatar: wish.avatarId,
        }}
        baseVelocity={(index % 2 === 0 ? -1 : 1) * (50 + (index % 3) * 10)}
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
              <img src={`${modalWish.avatarId}`} alt="头像" className="avatar" />
              <span className="nickname">{modalWish.nickname}</span>
              {modalWish.isOwn && <span className="own-badge">我的</span>}
            </div>

            {/* 心愿内容 */}
            <div className="wish-content">{modalWish.content}</div>

            {/* 互动区 - 优化按钮 */}
            <div className="interaction-bar">
              <Button 
                text={modalWish.isLiked ? '已点赞' : `点赞 ${modalWish.likeCount}`}
                icon={modalWish.isLiked ? like : dislike}
                onClick={handleLike}
                className={`action-button like-button ${modalWish.isLiked ? 'liked' : ''}`}
                disabled={isLiking || modalWish.isLiked}
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
              <div className="comments-section">
                <h4>💬 评论区</h4>
                
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
                        <img src={comment.userAvatar} alt="头像" className="avatar-small" />
                        <div className="comment-main">
                          <span className="comment-author">{comment.userNickname}</span>
                          <p className="comment-text">{comment.content}</p>
                          <span className="comment-time">
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                        </div>
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