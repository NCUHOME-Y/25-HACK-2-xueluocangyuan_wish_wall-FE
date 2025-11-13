import React, { useState, type FormEvent } from 'react';
import Button from '@/components/common/Button.tsx'; 
interface Comment {
    id: number;
    userId: string;
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

// 模拟评论列表
const mockComments: Comment[] = [
    { id: 1, userId: 'user1', userName: '小雪粉丝1号', avatar: 'path/to/avatar1.svg', content: '好棒的心愿！希望可以实现！', createdAt: '2025-11-12' },
    { id: 2, userId: 'user2', userName: '路人甲', avatar: 'path/to/avatar2.svg', content: '点赞支持！', createdAt: '2025-11-12' },
    // 更多评论...
];

const WishComment: React.FC<WishCommentProps> = ({ wishId, initialComments, onCommentPosted }) => {
    const [commentContent, setCommentContent] = useState('');
    const [comments, setComments] = useState<Comment[]>(initialComments || mockComments); // 使用 initialComments 或 mock数据

    const handlePostComment = async (e: FormEvent) => {
        e.preventDefault();
        const trimmed = commentContent.trim();
        if (!trimmed) return;

        // TODO: 发送评论请求
        // 临时：模拟新评论
        const newMockComment: Comment = {
            id: Date.now(), 
            userId: 'currentUser', 
            userName: '当前用户', 
            avatar: 'path/to/current-user-avatar.svg', 
            content: trimmed, 
            createdAt: new Date().toISOString().split('T')[0],
        };
        setComments(prev => [...prev, newMockComment]);
        onCommentPosted(newMockComment);
        setCommentContent('');
    };

    return (
        <div className="wish-comment-section">
            <h4 className="comment-title">评论 ({comments.length})</h4>
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
                    placeholder="写下你的评论..."
                    rows={3}
                    className="comment-textarea"
                />
                <Button
                    text="发布评论"
                    type="submit"
                    disabled={!commentContent.trim()}
                    className="post-comment-button"
                />
            </form>
        </div>
    );
};

export default WishComment;