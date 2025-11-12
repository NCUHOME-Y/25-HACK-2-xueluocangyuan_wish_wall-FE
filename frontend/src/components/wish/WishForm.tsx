import { useState, type FormEvent, type KeyboardEvent } from "react";
// 导入 wishService 和数据类型
import { services } from '../../services/wishService';

// 定义 props，例如表单提交成功后的回调
interface WishFormProps {
  onSuccess: () => void; // 提交成功后调用，例如用来关闭 Modal
}

export function WishForm({ onSuccess }: WishFormProps) {
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
      await services.createWish(trimmed, isPublic, tags);
      setContent("");
      setTag("");
      setTags([]);
      onSuccess?.();
    } catch (err: any) {
      setError(err?.message || "发布心愿失败");
    } finally {
      setLoading(false);
    }
  };
  return (
   //你来完成表单的UI部分吧
  );
}

export default WishForm;