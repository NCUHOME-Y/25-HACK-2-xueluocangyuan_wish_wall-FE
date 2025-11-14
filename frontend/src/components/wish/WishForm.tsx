import { useState, type FormEvent } from "react";
import { services } from '../../services/wishService';
import { useUserStore } from '@/store/userStore';
import Button from '@/components/common/Button.tsx';
import '@/styles/wishModal.css';

const SimpleSwitch: React.FC<{ checked: boolean, onChange: (checked: boolean) => void }> = ({ checked, onChange }) => (
  <label className="simple-switch">
    <input 
      type="checkbox" 
      checked={checked} 
      onChange={(e) => onChange(e.target.checked)} 
    />
    <span className="slider round" />
  </label>
);

interface WishFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function WishForm({ onSuccess, onCancel }: WishFormProps) {
  const { user } = useUserStore(); // 获取真实用户数据
  const [content, setContent] = useState<string>("");
  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const togglePrivacy = () => setIsPublic(prev => !prev);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
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
      setError(err?.message || "发布心愿失败");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="wish-form">
      <div className="modal-header">
        {/* 只在用户存在时渲染用户信息 */}
        {user && (
          <div className="profile-information">
            <img 
              src={`/api/avatars/${user.avatar_id}.svg`}
              alt="头像" 
              className="profile-image"
              onError={(e) => {
                e.currentTarget.src = '../assets/images/头像1.svg'; // 加载失败时使用默认头像
              }}
            />
            <span className="profile-nickname">{user.nickname}</span>
          </div>
        )}
        <h4 className="modal-title">时遇小雪，请写下你此时的心愿。</h4>
      </div>

      <div className="form-group">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="写下你的心愿（最多200字）"
          maxLength={200}
          rows={5}
          className="wish-content-textarea"
        />
        <div className="char-count">{content.length}/200</div>
      </div>

      <div className="form-group privacy-toggle">
        <Button 
          text={isPublic ? "设为私密" : "设为公开"}
          onClick={togglePrivacy}
          type="button"
          className="privacy-button"
          disabled={loading}
        />
        <SimpleSwitch checked={isPublic} onChange={setIsPublic} />
        <span className="privacy-status">
          {isPublic ? '公开可见' : '仅自己可见'}
        </span>
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="modal-actions">
        <Button 
          text="取消" 
          onClick={onCancel} 
          type="button"
          className="cancel-button" 
          disabled={loading}
        />
        <Button 
          text={loading ? "发布中..." : "发布心愿"} 
          type="submit" 
          className="submit-button"
          disabled={loading || !content.trim()}
        />
      </div>
    </form>
  );
}

export default WishForm;