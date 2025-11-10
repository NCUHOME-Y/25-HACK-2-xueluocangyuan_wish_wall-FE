import Button from '../common/Button.tsx';

interface WishCardProps {
    wishText: string;
    nickname: string;
    profilePictureUrl: string;
    onDelete?: () => void;
    onLike?: () => void;
    onComment?: () => void;
}

const WishCard = ({
    wishText,
    nickname,
    profilePictureUrl,
    onDelete,
    onLike,
    onComment,
}: WishCardProps) => {
    return (
        <div className="wish-card">
            <div className="basic-information">
                <img src={profilePictureUrl} alt="头像" />
                <div className="nickname">{nickname}</div>
            </div>
            <div className="wish-text">{wishText}</div>
            {onLike && <div className="like-button-container">
                <Button
                    onClick={onLike}
                    className="like-button"
                    text=""
                    icon
                />
            </div>}
            {onComment && <div className="comment-button-container">
                <Button 
                    onClick={onComment}
                    className="comment-button"
                    text=""
                    icon
                />
            </div>}
            {onDelete && <div className="delete-button-container">
                <Button 
                    onClick={onDelete}
                    className="delete-button"
                    text="删除"
                />
            </div>}
        </div>
    );
};

export default WishCard;
