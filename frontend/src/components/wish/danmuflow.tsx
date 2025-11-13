import React, { useState, useCallback } from 'react';
import WishDanmu from './WishDanmu.tsx';
import Modal from '@/components/common/Modal.tsx';
import '@/styles/wishdanmu.css';
import '@/styles/wishModal.css';
import commentButton from '@/assets/images/commentButton.svg';
import likeButton from '@/assets/images/likeButton.svg';
import { getPublicWishes, likeWish, addComment } from '@/services/wishService';
import { type Wish } from '@/services/wishService'; // 直接使用 Wish 类型

// 评论类型（显式定义）
interface Comment {
  id: number | string;
  content: string;
  userNickname: string;
  userAvatar: string;
  createdAt: string;
}

interface DanmuFlowProps {
  wishes: Wish[];
  loading: boolean;
  onDataChange: () => void; // 父组件刷新回调
}

const DanmuFlow: React.FC<DanmuFlowProps> = ({ wishes, loading, onDataChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalWish, setModalWish] = useState<Wish | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const [isLiking, setIsLiking] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // 点击弹幕打开详情
  const handleDanmuClick = useCallback((wish: Wish) => {
    setModalWish(wish);
    setIsModalOpen(true);
    // 这里可以调用获取评论列表的 API（如果后端有）
    // 假设 comments 也在 wish 对象里，或者需要单独获取
    // 暂时用空数组，实际项目中调用：fetchComments(wish.id)
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalWish(null);
    setComments([]);
    setCommentInput('');
  };

  // 点赞处理（乐观更新）
  const handleLike = useCallback(async () => {
    if (!modalWish || isLiking) return;
    setIsLiking(true);
    try {
      const result = await likeWish(modalWish.id);
      // 本地立即更新状态
      setModalWish(prev => prev ? { ...prev, likeCount: result.likeCount } : null);
      // 通知父组件刷新弹幕流（同步最新数据）
      onDataChange();
    } catch (err) {
      console.error('点赞失败:', err);
      alert('操作失败，请重试');
    } finally {
      setIsLiking(false);
    }
  }, [modalWish, onDataChange]);

  // 评论处理
  const handleComment = useCallback(async () => {
    if (!modalWish || !commentInput.trim() || isSubmittingComment) return;
    setIsSubmittingComment(true);
    try {
      const newComment = await addComment(modalWish.id, commentInput.trim());
      // 添加到评论列表头部
      setComments(prev => [newComment, ...prev]);
      // 清空输入框
      setCommentInput('');
      // 更新评论数
      setModalWish(prev => prev ? { ...prev, commentCount: prev.commentCount + 1 } : null);
      // 通知父组件刷新
      onDataChange();
    } catch (err) {
      console.error('评论失败:', err);
      alert('评论发送失败');
    } finally {
      setIsSubmittingComment(false);
    }
  }, [modalWish, commentInput, isSubmittingComment, onDataChange]);

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
          avatar: wish.avatar,
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

      {/* 详情弹窗 */}
      <Modal visible={isModalOpen} onClose={handleCloseModal}>
        {modalWish && (
          <div className="wish-detail-modal">
            {/* 用户信息 */}
            <div className="user-info">
              <img src={modalWish.avatar} alt="头像" className="avatar" />
              <span className="nickname">{modalWish.nickname}</span>
              {modalWish.isOwn && <span className="own-badge">我的</span>}
            </div>

            {/* 心愿内容 */}
            <div className="wish-content">{modalWish.content}</div>

            {/* 标签 */}
            {modalWish.tags?.length > 0 && (
              <div className="tags-display">
                {modalWish.tags.map(tag => (
                  <span key={tag} className="tag-item">#{tag}</span>
                ))}
              </div>
            )}

            {/* 互动区 */}
            <div className="interaction-bar">
              <Button 
                text={isLiking ? '...' : `点赞 ${modalWish.likeCount}`}
                icon={likeButton}
                onClick={handleLike}
                className={`action-button ${modalWish.isLiked ? 'liked' : ''}`}
                disabled={isLiking}
              />
              <Button 
                text={`评论 ${modalWish.commentCount}`}
                icon={commentButton}
                onClick={() => document.getElementById('comment-input')?.focus()}
                className="action-button"
              />
            </div>

            {/* 评论区 */}
            <div className="comments-section">
              <h4>评论区</h4>
              
              {/* 发表评论 */}
              <div className="comment-input-wrapper">
                <input
                  id="comment-input"
                  type="text"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleComment()}
                  placeholder="写下你的评论..."
                  className="comment-input"
                />
                <Button 
                  text={isSubmittingComment ? '发送中...' : '发送'} 
                  onClick={handleComment}
                  disabled={!commentInput.trim() || isSubmittingComment}
                />
              </div>

              {/* 评论列表 */}
              <div className="comments-list">
                {comments.length === 0 ? (
                  <p className="no-comments">暂无评论</p>
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
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DanmuFlow;