import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/common/Button.tsx";
import DanmuFlow from "@/components/wish/danmuflow";
import Modal from "@/components/common/Modal.tsx";
import { WishForm } from "@/components/wish/WishForm";
import { getPublicWishes, type Wish } from "@/services/wishService";
import "@/styles/PublicFeed.css";

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
      setWishes(response.wishes);
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

  const CheckWishes = () => navigate("/Galaxy");

  return (
    <div className="public-feed-page">
      <div className="title">雪落心愿集</div>
      <div className="danmu-flow">
        <DanmuFlow 
          wishes={wishes} 
          loading={loading} 
          onDataChange={fetchWishes}  // 关键：传递刷新函数
        />
      </div>
      <div className="action-buttons">
        <Button text="发布小雪心愿" onClick={handleOpenModal} className="publish-wish-button" />
        <Button text="查看心愿清单" onClick={CheckWishes} className="check-wish-button" />
      </div>
      <Modal
        visible={visible}
        onClose={handleCloseModal} 
        children={
          <WishForm onSuccess={handleWishPostSuccess} onCancel={handleCloseModal} />
        }
      />
    </div>
  );
}

export default PublicFeed;