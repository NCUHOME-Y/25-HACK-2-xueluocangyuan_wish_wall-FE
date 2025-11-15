import { useState } from 'react';
import profileImageOne from "@/assets/images/头像1.svg";
import profileImageTwo from "@/assets/images/头像2.svg";
import profileImageThree from "@/assets/images/头像3.svg";
import profileImageFour from "@/assets/images/头像4.svg";
import profileImageFive from "@/assets/images/头像5.svg";
import profileImageSix from "@/assets/images/头像6.svg";
import BackButton from "@/components/common/BackButton";
import styles from "@/styles/profileImage.module.css"
import Button from '@/components/common/Button';
import { useUserStore } from '@/store/userStore';
import { userService } from '@/services/userService';
import { useNavigate } from 'react-router-dom';

// 创建一个头像数据数组，包含 ID 和路径，方便管理和映射
const profileImages = [
    { id: '1', src: profileImageOne, alt: "头像1" },
    { id: '2', src: profileImageTwo, alt: "头像2" },
    { id: '3', src: profileImageThree, alt: "头像3" },
    { id: '4', src: profileImageFour, alt: "头像4" },
    { id: '5', src: profileImageFive, alt: "头像5" },
    { id: '6', src: profileImageSix, alt: "头像6" },
];

function ProfileImage() {
    const navigate = useNavigate();
    const user = useUserStore((s) => s.user);
    const setUser = useUserStore((s) => s.setUser);
    // 初始选中当前头像（若有）
    const [selectedImageId, setSelectedImageId] = useState<string | null>(
        user?.avatar_id != null ? String(user.avatar_id) : null
    );
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 处理头像点击事件
    const handleImageClick = (id: string) => {
        // 如果点击的是当前已选中的头像，则取消选中；否则选中它
        setSelectedImageId(id);
    };

    // 处理确认按钮点击事件
    const handleConfirm = async () => {
        if (!selectedImageId) return;
        const newId = Number(selectedImageId);
        // 未变化则直接返回到 PublicFeed
        if (user?.avatar_id === newId) {
            navigate('/');
            return;
        }
        try {
            setSaving(true);
            setError(null);
            const updated = await userService.updateUserProfile({ avatar_id: newId });
            setUser(updated as any);
            // 成功后按期望返回到 PublicFeed
            navigate('/');
        } catch (err: any) {
            setError(err?.msg || err?.message || '更新头像失败');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles["back-button-container"]}>
                <BackButton />
                </div>
                <h1 className={styles.title}>选择头像</h1>
                <Button
                    text={saving ? '保存中...' : '确认'}
                    className={styles.confirmButton}
                    onClick={handleConfirm}
                    disabled={saving || !selectedImageId}
                />
            </div>
            {error && <div className={styles['error-message']}>{error}</div>}
            <div className={styles.images}>
                {profileImages.map((image) => (
                    <img 
                        key={image.id}
                        src={image.src} 
                        alt={image.alt} 
                        // 动态添加 styles.selectedImage 类名
                        className={`${styles.image} ${selectedImageId === image.id ? styles.selectedImage : ''}`} 
                        onClick={() => handleImageClick(image.id)} // 绑定点击事件
                    />
                ))}
            </div>
        </div>
    );
};

export default ProfileImage;