import React, { useState, useCallback, useRef, useEffect } from 'react';
import WishDanmu from './WishDanmu.tsx';
import Modal from '@/components/common/Modal.tsx';
import '@/styles/wishdanmu.css';
import commentButton from '@/assets/images/commentButton.svg';
import dislike from '@/assets/images/dislikeButton.svg';
import like from '@/assets/images/likeButton.svg';
import { addComment, getWishInteractions } from '@/services/wishService';
import { type Wish } from '@/services/wishService';
import type { Comment } from '@/services/wishService.ts';
import Button from '@/components/common/Button.tsx';

interface DanmuFlowProps {
  wishes: Wish[];
  loading: boolean;
  onDataChange: () => void;
}

interface WishWithLiked extends Wish {
  isLiked: boolean;
}

// 活跃弹幕实例接口
interface ActiveDanmu {
  id: string | number; // 愿望ID
  instanceId: string; // 唯一实例ID（用于重复利用同一愿望）
  wish: Wish;
  trackIndex: number; // 所在轨道索引
  isActive: boolean;
}

function isAbortError(error: unknown): error is DOMException {
  return error instanceof DOMException && error.name === 'AbortError';
}

const DanmuFlow: React.FC<DanmuFlowProps> = ({ wishes, loading, onDataChange }) => {
  // 配置常量
  const TRACK_COUNT = 8; // 轨道数量
  const MIN_ACTIVE_PER_TRACK = 1; // 每轨道最少弹幕数

  // 使用 ref 管理请求取消
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // 弹窗状态
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalWish, setModalWish] = useState<WishWithLiked | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const [isLiking, setIsLiking] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showComments, setShowComments] = useState(false);

  // 新增：弹幕管理系统状态
  const [activeDanmus, setActiveDanmus] = useState<ActiveDanmu[]>([]);
  const availableWishesRef = useRef<Wish[]>([]); // 使用 ref 避免频繁重渲染
  const instanceCounterRef = useRef(0); // 实例ID生成器

  // 初始化或更新可用弹幕池
  useEffect(() => {
    if (wishes.length > 0) {
      availableWishesRef.current = [...wishes];
      // 初次加载时随机分配弹幕到各轨道
      initializeTracks();
    }
  }, [wishes]);

  // 生成唯一实例ID
  const generateInstanceId = useCallback(() => {
    instanceCounterRef.current += 1;
    return `instance-${instanceCounterRef.current}-${Date.now()}`;
  }, []);

  // 获取随机轨道索引（优先选择弹幕较少的轨道）
  const getRandomAvailableTrack = useCallback((currentActive: ActiveDanmu[]) => {
    // 统计每个轨道的当前弹幕数
    const trackCounts = new Array(TRACK_COUNT).fill(0);
    currentActive.forEach(danmu => {
      if (danmu.trackIndex < TRACK_COUNT) {
        trackCounts[danmu.trackIndex] += 1;
      }
    });

    // 找出弹幕数少于最小值的轨道
    const availableTracks = trackCounts
      .map((count, index) => ({ index, count }))
      .filter(({ count }) => count < MIN_ACTIVE_PER_TRACK)
      .map(({ index }) => index);

    if (availableTracks.length > 0) {
      // 随机选择一个可用轨道
      return availableTracks[Math.floor(Math.random() * availableTracks.length)];
    }

    // 如果所有轨道都满足最小值，随机返回任意轨道
    return Math.floor(Math.random() * TRACK_COUNT);
  }, [TRACK_COUNT, MIN_ACTIVE_PER_TRACK]);

  // 从愿望池获取一个愿望（循环使用）
  const getWishFromPool = useCallback(() => {
    if (availableWishesRef.current.length === 0) {
      // 如果池子空了，重新填满（实现循环）
      availableWishesRef.current = [...wishes];
    }

    // 随机选择一个愿望
    const randomIndex = Math.floor(Math.random() * availableWishesRef.current.length);
    const selectedWish = availableWishesRef.current[randomIndex];
    
    // 从池中移除（避免短时间内重复）
    availableWishesRef.current.splice(randomIndex, 1);
    
    return selectedWish;
  }, [wishes]);

  // 添加新弹幕到轨道
  const addDanmuToTrack = useCallback(() => {
    setActiveDanmus(prev => {
      const wish = getWishFromPool();
      if (!wish) return prev;

      const trackIndex = getRandomAvailableTrack(prev);
      const newDanmu: ActiveDanmu = {
        id: wish.id,
        instanceId: generateInstanceId(),
        wish,
        trackIndex,
        isActive: true,
      };

      return [...prev, newDanmu];
    });
  }, [getWishFromPool, getRandomAvailableTrack, generateInstanceId]);

  // 初始化轨道
  const initializeTracks = useCallback(() => {
    const initialCount = Math.min(wishes.length, TRACK_COUNT * 2); // 初始加载2倍轨道数的弹幕
    for (let i = 0; i < initialCount; i += 1) {
      // 使用 setTimeout 错开初始化时间，看起来更自然
      setTimeout(() => {
        addDanmuToTrack();
      }, i * 200);
    }
  }, [wishes.length, TRACK_COUNT, addDanmuToTrack]);

  // 弹幕动画完成后的回调
  const handleDanmuComplete = useCallback((instanceId: string) => {
    // 移除完成的弹幕
    setActiveDanmus(prev => prev.filter(danmu => danmu.instanceId !== instanceId));
    
    // 延迟补充新弹幕（模拟弹幕循环）
    setTimeout(() => {
      addDanmuToTrack();
    }, Math.random() * 1000 + 500); // 随机间隔0.5-1.5秒
  }, [addDanmuToTrack]);

  // 持续检查并补充弹幕
  useEffect(() => {
    if (loading) return;

    const interval = setInterval(() => {
      setActiveDanmus(prev => {
        // 统计每个轨道的弹幕数
        const trackCounts = new Array(TRACK_COUNT).fill(0);
        prev.forEach(danmu => trackCounts[danmu.trackIndex] += 1);

        // 检查是否需要补充弹幕
        const needsRefill = trackCounts.some(count => count < MIN_ACTIVE_PER_TRACK);
        
        if (needsRefill && availableWishesRef.current.length > 0) {
          // 在下一个 tick 中补充，避免在 setState 中直接调用 setState
          setTimeout(() => addDanmuToTrack(), 0);
        }

        return prev;
      });
    }, 1000); // 每秒检查一次

    return () => clearInterval(interval);
  }, [loading, addDanmuToTrack, TRACK_COUNT, MIN_ACTIVE_PER_TRACK]);

  // 点击弹幕打开详情
  const handleDanmuClick = useCallback(async (wish: Wish) => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    try {
      const interactions = await getWishInteractions(wish.id);
      const enhancedWish: WishWithLiked = {
        ...wish,
        isLiked: interactions.likes.currentUserLiked,
      };
      setModalWish(enhancedWish);
      setIsModalOpen(true);
      setShowComments(false);
      setComments(interactions.comments.list);
    } catch (err) {
      if (!isAbortError(err)) {
        console.error('获取评论失败:', err);
        setComments([]);
      }
    }
  }, []);

  // 关闭弹窗
  const handleCloseModal = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsModalOpen(false);
    setModalWish(null);
    setComments([]);
    setCommentInput('');
    setIsLiking(false);
    setIsSubmittingComment(false);
    setShowComments(false);
  }, []);

  // 点赞处理
  const handleLike = useCallback(async () => {
    if (!modalWish || isLiking || modalWish.isLiked) return;
    setIsLiking(true);
    try {
      setModalWish(prev => prev ? {
        ...prev,
        isLiked: true,
        likeCount: prev.likeCount + 1,
      } : null);
      onDataChange();
    } catch (err) {
      console.error('点赞失败:', err);
    } finally {
      setIsLiking(false);
    }
  }, [modalWish, isLiking, onDataChange]);

  // 切换评论区（保持不变）
  const handleToggleComments = useCallback(() => {
    setShowComments(prev => !prev);
  }, []);

  // 评论区聚焦（保持不变）
  useEffect(() => {
    if (showComments) {
      document.getElementById('comment-input')?.focus();
    }
  }, [showComments]);

  // 评论处理（保持不变）
  const handleComment = useCallback(async () => {
    if (!modalWish || !commentInput.trim() || isSubmittingComment) return;
    setIsSubmittingComment(true);
    try {
      const newComment = await addComment(modalWish.id, commentInput.trim());
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

  // 组件卸载清理（保持不变）
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  // 渲染弹幕轨道（改造部分）
  const renderDanmuTracks = () => {
    // 按轨道分组弹幕
    const tracks = new Array(TRACK_COUNT).fill(null).map(() => [] as ActiveDanmu[]);
    activeDanmus.forEach(danmu => {
      if (danmu.trackIndex < TRACK_COUNT) {
        tracks[danmu.trackIndex].push(danmu);
      }
    });

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {tracks.map((trackDanmus, trackIndex) => (
          <div 
            key={trackIndex}
            className="danmu-track"
            style={{ 
              height: '40px', 
              display: 'flex', 
              alignItems: 'center',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {trackDanmus.map((danmu) => (
              <WishDanmu
                key={danmu.instanceId}
                data={{
                  id: danmu.wish.id,
                  wishContent: danmu.wish.content,
                  nickName: danmu.wish.nickname,
                  avatar: danmu.wish.avatarId,
                }}
                baseVelocity={(trackIndex % 2 === 0 ? -1 : 1) * (50 + (trackIndex % 3) * 10)}
                onDanmuClick={() => handleDanmuClick(danmu.wish)}
                onAnimationComplete={() => handleDanmuComplete(danmu.instanceId)}
              />
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="danmu-flow-container">
      <div className="danmu-area">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>加载中...</div>
        ) : wishes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>暂无数据</div>
        ) : (
          renderDanmuTracks()
        )}
      </div>

      <Modal visible={isModalOpen} onClose={handleCloseModal}>
        {modalWish && (
          <div className="wish-detail-modal">
            <div className="user-info">
              <img src={`${modalWish.avatarId}`} alt="头像" className="avatar" />
              <span className="nickname">{modalWish.nickname}</span>
              {modalWish.isOwn && <span className="own-badge">我的</span>}
            </div>
            <div className="wish-content">{modalWish.content}</div>
            <div className="interaction-bar">
              <Button 
                text={modalWish.isLiked ? '已点赞' : `点赞 ${modalWish.likeCount}`}
                icon={modalWish.isLiked ? like : dislike}
                onClick={handleLike}
                className={`action-button like-button ${modalWish.isLiked ? 'liked' : ''}`}
                disabled={isLiking || modalWish.isLiked}
              />
              <Button 
                text={`评论 ${modalWish.commentCount}`}
                icon={commentButton}
                onClick={handleToggleComments}
                className={`action-button comment-button ${showComments ? 'active' : ''}`}
              />
            </div>
            {showComments && (
              <div className="comments-section">
                <h4>评论区</h4>
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