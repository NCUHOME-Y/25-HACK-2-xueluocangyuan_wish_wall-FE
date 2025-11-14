import React, { useState, useEffect, type FormEvent } from 'react';
import Button from '@/components/common/Button';
import { addComment, getWishInteractions } from '@/services/wishService';
import { getAvatarUrl } from '@/utils/avatar';


// 与服务层 wishService 中的 Comment 结构保持一致
type ServiceComment = {
    id: number;
    userId: number;
    userNickname: string;
    userAvatarId: number;
    wishId: number;
    likeCount: number;
    content: string;
    createdAt: string;
    isOwn: boolean;
};


interface WishCommentProps {
    wishId: number | string;
    initialComments?: ServiceComment[];
    onCommentPosted?: (newComment: ServiceComment) => void;
}

const WishComment: React.FC<WishCommentProps> = ({ wishId, initialComments, onCommentPosted }) => {
    const [commentContent, setCommentContent] = useState('');
    const [comments, setComments] = useState<ServiceComment[]>(initialComments || []);
    const [loading, setLoading] = useState(!initialComments); // 如果没有初始数据则加载
    const [error, setError] = useState<string | null>(null);
    const [posting, setPosting] = useState(false);

    // 组件挂载时获取评论
    useEffect(() => {
        if (initialComments) return; // 如果已有初始数据，不再获取
        const id = Number(wishId);
        if (!Number.isFinite(id) || id <= 0) {
            setError('无效的心愿ID');
            return;
        }

        const controller = new AbortController();

        (async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getWishInteractions(id);
                if (controller.signal.aborted) return;
                setComments(data?.comments?.list ?? []);
            } catch (err: any) {
                if (controller.signal.aborted) return;
                setError(err?.msg || err?.message || '获取评论失败，请稍后重试');
                console.error('Failed to fetch comments:', err?.msg || err?.message || err);
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        })();

        return () => controller.abort();
    }, [wishId, initialComments]);

    const handlePostComment = async (e: FormEvent) => {
        e.preventDefault();
        const trimmed = commentContent.trim();
        if (!trimmed) return;

        setPosting(true);
        setError(null);

        try {
            const id = Number(wishId);
            if (!Number.isFinite(id) || id <= 0) {
                setError('无效的心愿ID');
                setPosting(false);
                return;
            }
            const newComment = await addComment(id, trimmed);
            setComments(prev => [...prev, newComment]);
            onCommentPosted?.(newComment);
            setCommentContent('');
        } catch (err: any) {
            setError(err?.msg || err?.message || '发布评论失败，请重试');
            console.error('Failed to post comment:', err?.msg || err?.message || err);
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
                                                        <img
                                                            src={getAvatarUrl(comment.userAvatarId)}
                                                            alt={comment.userNickname}
                                                            className="comment-avatar"
                                                        />
                            <div className="comment-body">
                                <div className="comment-header">
                                    <span className="comment-user">{comment.userNickname}</span>
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
