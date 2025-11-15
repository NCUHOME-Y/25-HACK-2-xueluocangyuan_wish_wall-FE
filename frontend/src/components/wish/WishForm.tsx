import { useState, type FormEvent } from "react";
import { services } from '@/services/wishService';
import { useUserStore } from '@/store/userStore';
import Button from '@/components/common/Button.tsx';
import '@/styles/wishModal.css';
import { getAvatarUrl } from '@/utils/avatar';

interface WishFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function WishForm({ onSuccess, onCancel }: WishFormProps) {
  const user = useUserStore(s => s.user); // 精准订阅用户信息
  const [content, setContent] = useState<string>("");
  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const togglePrivacy = () => setIsPublic(prev => !prev);

  // 统一的提交逻辑，供表单提交与按钮点击复用
  const doSubmit = async () => {
    if (loading) return;

    const trimmed = content.trim();
    if (!trimmed) {
      setError("请输入心愿内容");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await services.createWish(trimmed, isPublic, []);
      setContent("");
      setIsPublic(true);
      onSuccess();
    } catch (err: any) {
      setError(err?.msg || err?.message || "发布心愿失败");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    void doSubmit();
  };
  
  return (
    <div className="wish-modal">
    <form onSubmit={handleFormSubmit} className="wish-form">
      <div className="modal-header">
        {/* 只在用户存在时渲染用户信息 */}
        {user && (
          <div className="profile-information">
            <img
              src={getAvatarUrl(user.avatar_id)}
              alt="头像"
              className="profile-image"
            />
            <span className="profile-nickname">{user.nickname}</span>
          </div>
        )}
      </div>

      <div className="form-group">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="时遇小雪，请写下你此时的心愿："
          className="wish-content-text-area"
          disabled={loading}
        />
      </div>

      <div className="privacy-button-group">
        <Button
          onClick={togglePrivacy}
          type="button"
          className="privacy-button"
          disabled={loading}
        />
        <span className="privacy-status">
          {isPublic ? '公开心愿' : '不公开心愿'}
        </span>
      </div>

      {error && <p className="error-message">{error}</p>}

      </form>

      <div className="modal-actions">
        <Button
          text="取消"
          onClick={onCancel}
          type="button"
          className="cancel-button"
          disabled={loading}
        />
        <Button
          text={loading ? '发布中...' : '发布心愿'}
          onClick={() => { void doSubmit(); }}
          type="button"
          className="submit-button"
          disabled={loading || !content.trim()}
        />
      </div>
    </div>
  );
}

export default WishForm;