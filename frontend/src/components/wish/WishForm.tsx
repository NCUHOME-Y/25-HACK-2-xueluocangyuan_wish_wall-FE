import { useState, type FormEvent, type KeyboardEvent } from "react";
// 导入 wishService 和数据类型
import { services } from '../../services/wishService'; // 引用 services 对象
import Button from '@/components/common/Button.tsx'; 
import '@/styles/WishForm.css'; 

// 模拟一个简单的 Switch 组件
const SimpleSwitch: React.FC<{ checked: boolean, onChange: (checked: boolean) => void, id?: string, label?: string }> = ({ checked, onChange, id, label }) => (
    <label className="simple-switch" htmlFor={id}>
        {label && <span className="sr-only">{label}</span>}
        <input 
            id={id}
            type="checkbox" 
            checked={checked} 
            onChange={(e) => onChange(e.target.checked)} 
            aria-label={label}
        />
        <span className="slider round" />
    </label>
);

// 新增 onCancel 用于关闭 Modal
interface WishFormProps {
  onSuccess: () => void; // 提交成功后调用
  onCancel: () => void; // 取消操作时调用
}

export function WishForm({ onSuccess, onCancel }: WishFormProps) {
  // 管理心愿状态
  const [content, setContent] = useState<string>("");
  const [isPublic, setIsPublic] = useState<boolean>(true);
  //标签输入框的内容
  const [tag, setTag] = useState<string>("");
  //已添加标签
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

   const addTag = () => {
    const t = tag.trim();
    if (!t) return;
    if (tags.includes(t)) {
      setTag("");
      return;
    }
    setTags(prev => [...prev, t]);
    setTag("");
  };

  const handleTagKey = (e: KeyboardEvent<HTMLInputElement>) => {
    // 允许使用 Enter, 英文逗号, 中文逗号添加标签
    if (e.key === "Enter" || e.key === "," || e.key === "，") {
      e.preventDefault();
      addTag();
    }
  };

  const removeTag = (t: string) => {
    setTags(prev => prev.filter(x => x !== t));
  };

  // 处理心愿提交
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
      // 调用 wishService.ts 中导出的 createWish 函数
      await services.createWish(trimmed, isPublic, tags); 
      
      // 清空表单
      setContent("");
      setTag("");
      setTags([]);
      
      onSuccess(); // 成功后执行回调，关闭 Modal
    } catch (err: any) {
      // 错误处理
      setError(err?.message || "发布心愿失败");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="wish-form">
      <div className="modal-header">
        <div className="profile-information">
          <img src="" alt="头像" className="profile-image" />
          <span className="profile-nickname">NayyByte</span>
        </div>
        <h4 className="modal-title">时遇小雪，请写下你此时的心愿。</h4>
      </div>

      <div className="form-group">
        {/* 心愿内容输入区 */}
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

      <div className="form-group tag-input-group">
        <label htmlFor="tag-input" className="tag-label">心愿标签：</label>
        {/* 标签展示区 */}
        <div className="tags-display">
          {tags.map((t) => (
            <span key={t} className="tag-item">
              {t}
              <button 
                type="button" 
                onClick={() => removeTag(t)} 
                className="remove-tag-button"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
        {/* 标签输入框 */}
        <input
          id="tag-input"
          type="text"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          onKeyDown={handleTagKey}
          placeholder="输入标签，按回车/逗号添加"
          className="tag-input"
        />
      </div>

      <div className="form-group privacy-toggle">
        <label className="privacy-label">公开/仅自己可见</label>
        {/* 公开/私有切换开关 */}
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