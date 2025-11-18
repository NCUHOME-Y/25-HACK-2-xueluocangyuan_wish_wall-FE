import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/common/Button.tsx";
import DanmuFlow from "@/components/wish/danmuflow";
import Modal from "@/components/common/Modal.tsx";
import { WishForm } from "@/components/wish/WishForm";
import { getPublicWishes, type Wish } from "@/services/wishService";
import "@/styles/PublicFeed.css";
import ProfileButton from "@/components/common/ProfileButton";

function PublicFeed() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);

  // 获取数据函数
  const fetchWishes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getPublicWishes(1, 50);
      // 仅展示公开心愿
      setWishes(response.wishes || []);
    } catch (err) {
      console.error('获取失败:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 首次加载
  useEffect(() => {
    fetchWishes();
  }, [fetchWishes]);

  const handleOpenModal = () => setVisible(true);
  const handleCloseModal = () => setVisible(false);

  // 发布成功后刷新
  const handleWishPostSuccess = () => {
    handleCloseModal();
    fetchWishes();
  };

  // 局部更新（无需等待后端刷新即可在列表中看到点赞/评论变化）
  const handleWishPatch = useCallback((patch: { id: number; likeCount?: number; commentCount?: number; isLiked?: boolean }) => {
    setWishes(prev => prev.map(w => {
      if (w.id !== patch.id) return w;
      return {
        ...w,
        likeCount: patch.likeCount !== undefined ? patch.likeCount : w.likeCount,
        commentCount: patch.commentCount !== undefined ? patch.commentCount : w.commentCount,
      };
    }));
  }, []);

  const CheckWishes = () => navigate("/Galaxy");

  return (
    <div className="public-feed-page">
      <div className="header">
      <div className="title">雪落心愿集</div>
      <ProfileButton />
      </div>
      <div className="danmu-flow">
        <DanmuFlow 
          wishes={wishes} 
          loading={loading} 
          onDataChange={fetchWishes}
          onWishUpdate={handleWishPatch}
        />
      </div>
      <div className="action-buttons">
        <Button text="发布小雪心愿" onClick={handleOpenModal} className="publish-wish-button" />
        <Button text="查看心愿清单" onClick={CheckWishes} className="check-wish-button" />
      </div>
      <Modal
        visible={visible}
        children={
          <WishForm onSuccess={handleWishPostSuccess} onCancel={handleCloseModal} />
        }
      />
    </div>
  );
}

export default PublicFeed;