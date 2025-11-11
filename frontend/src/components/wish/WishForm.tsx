import  { useState } from "react";
// 导入 wishService 和数据类型
import { services } from '../../services/wishService';

// 定义 props，例如表单提交成功后的回调
interface WishFormProps {
  onSuccess: () => void; // 提交成功后调用，例如用来关闭 Modal
}
const WishForm: React.FC<WishFormProps> = ({ onSuccess }) => {
  // 管理心愿状态
    const [content, setContent] = useState<string>("");
  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [tags, setTags] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

// 处理心愿提交
