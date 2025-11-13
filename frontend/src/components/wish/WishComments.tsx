import React, { useState, useEffect, type FormEvent } from 'react';
import Button from '@/components/common/Button.tsx';
import { addComment, getWishInteractions } from '@/services/wishService'; // 导入 API 函数

interface Comment {
    id: number;
    userId: number;        
    userName: string;      
    avatar: string;        
    content: string;
    createdAt: string;
}

interface WishCommentProps {
    wishId: number | string;
    initialComments?: Comment[]; 
    onCommentPosted: (newComment: Comment) => void; 
}

const WishComment: React.FC<WishCommentProps> = ({ wishId, initialComments, onCommentPosted }) => {
    const [commentContent, setCommentContent] = useState('');
    const [comments, setComments] = useState<Comment[]>(initialComments || []);
    const [loading, setLoading] = useState(!initialComments); // 如果没有初始数据则加载
    const [error, setError] = useState<string | null>(null);
    const [posting, setPosting] = useState(false);

    // 组件挂载时获取评论
    useEffect(() => {
        if (initialComments) return; // 如果已有初始数据，不再获取
        
        const fetchComments = async () => {
            try {
                setLoading(true);
                setError(null);
                // 调用 API 获取评论
                const data = await getWishInteractions(Number(wishId));
                // 转换数据格式以匹配组件的 Comment 类型
                const formattedComments = data.comments.list.map(comment => ({
                    id: comment.id,
                    userId: comment.userId,
                    userName: comment.userNickname, // 字段名转换
                    avatar: comment.userAvatar,
                    content: comment.content,
                    createdAt: comment.createdAt
                }));
                setComments(formattedComments);
            } catch (err) {
                setError('获取评论失败，请稍后重试');
                console.error('Failed to fetch comments:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchComments();
    }, [wishId, initialComments]);

    const handlePostComment = async (e: FormEvent) => {
        e.preventDefault();
        const trimmed = commentContent.trim();
        if (!trimmed) return;

        setPosting(true);
        setError(null);
        
        try {
            // 调用真实 API 发布评论
            const newComment = await addComment(Number(wishId), trimmed);
            
            // 转换数据格式
            const formattedComment: Comment = {
                id: newComment.id,
                userId: newComment.userId,
                userName: newComment.userNickname,
                avatar: newComment.userAvatar,
                content: newComment.content,
                createdAt: newComment.createdAt
            };
            
            setComments(prev => [...prev, formattedComment]);
            onCommentPosted(formattedComment);
            setCommentContent('');
        } catch (err) {
            setError('发布评论失败，请重试');
            console.error('Failed to post comment:', err);
        } finally {
            setPosting(false);
        }
    };

    // 渲染加载状态
    if (loading) {
        return <div className="wish-comment-section">加载评论中...</div>;
    }

    return (
        <div className="wish-comment-section">
            <h4 className="comment-title">评论 ({comments.length})</h4>
            
            {/* 错误提示 */}
            {error && <div className="comment-error">{error}</div>}
            
            <div className="comment-list">
                {comments.length === 0 ? (
                    <p className="no-comments">还没有评论，快来抢沙发吧！</p>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} className="comment-item">
                            <img src={comment.avatar} alt={comment.userName} className="comment-avatar" />
                            <div className="comment-body">
                                <div className="comment-header">
                                    <span className="comment-user">{comment.userName}</span>
                                    <span className="comment-date">{comment.createdAt}</span>
                                </div>
                                <p className="comment-content">{comment.content}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <form onSubmit={handlePostComment} className="comment-form">
                <textarea
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    placeholder="说点什么..."
                    rows={3}
                    className="comment-textarea"
                    disabled={posting}
                />
                <Button
                    text={posting ? '发布中...' : '发送'}
                    type="submit"
                    disabled={!commentContent.trim() || posting}
                    className="post-comment-button"
                />
            </form>
        </div>
    );
};

export default WishComment;
