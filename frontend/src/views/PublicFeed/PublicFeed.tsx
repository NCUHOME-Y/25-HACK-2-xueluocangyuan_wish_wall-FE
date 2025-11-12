import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/common/Button.tsx";
import DanmuFlow from "@/components/wish/danmuflow";
import Modal from "@/components/common/Modal.tsx";
import "@/styles/PublicFeed.css";

function PublicFeed() {
  const navigate = useNavigate();

  const CheckWishes = () => {
    navigate("/Galaxy");
  }

  const [visible, setVisible] = React.useState<boolean>(false);

  const handleOpenModal = () => {
    setVisible(true);
  };

  return (
    <div className="public-feed-page">
      <div className="title">雪落心愿集</div>
      <div className="danmu-flow">
        <DanmuFlow />
      </div>
      <div className="action-buttons">
        <Button
          text="发布小雪心愿"
          onClick={handleOpenModal}
          className="publish-wish-button"
        />
        <Button
          text="查看心愿清单"
          onClick={CheckWishes}
          className="check-wish-button"
        />
      </div>
      <Modal
        visible={visible}
        children={
          <div className="modal-container">
          <img src="" alt="头像" className="profile-image" />
          <span className="profile-nickname">NayyByte</span>
          <div className="modal-content">
            时遇小雪，请写下你此时的心愿。
            <input type="text" />
          </div>
          <div className="modal-actions">
          <Button text="取消" onClick={() => setVisible(false)} />
          <Button text="发布" className="submit-wish-button" />
          </div>
          </div>
        }
        onClose={() => setVisible(false)}
      />
    </div>
  );
}

export default PublicFeed;