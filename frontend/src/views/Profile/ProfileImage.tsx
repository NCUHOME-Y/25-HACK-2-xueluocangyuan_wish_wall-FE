import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from "@/components/common/BackButton";
import styles from "@/styles/profileImage.module.css";
import Button from '@/components/common/Button';
import { getAvatarUrl, allAvatarIds } from '@/utils/avatar';
import { useUserStore } from '@/store/userStore';
import { userService } from '@/services/userService';

const profileImages = allAvatarIds.map(id => ({ id, src: getAvatarUrl(id), alt: `头像${id}` }));

function ProfileImage() {
    const navigate = useNavigate();
    const user = useUserStore(state => state.user);
    const setUser = useUserStore(state => state.setUser);
    const [selectedImageId, setSelectedImageId] = useState<number | null>(user?.avatar_id ?? null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleImageClick = (id: number) => {
        setSelectedImageId(prev => (prev === id ? null : id));
    };

    const handleConfirm = async () => {
        if (!user || !selectedImageId || selectedImageId === user.avatar_id || saving) return;
        setSaving(true);
        setError(null);
        try {
            const updated = await userService.updateUserProfile({ avatar_id: selectedImageId });
            setUser(updated);
            // 保存成功后返回个人资料页
            navigate('/profile');
        } catch (e: any) {
            setError(e?.msg || e?.message || '更新头像失败');
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
                    disabled={saving || !selectedImageId || selectedImageId === (user?.avatar_id ?? null)}
                />
            </div>
            <div className={styles.images}>
                {profileImages.map(image => (
                    <img
                        key={image.id}
                        src={image.src}
                        alt={image.alt}
                        className={`${styles.image} ${selectedImageId === image.id ? styles.selectedImage : ''}`}
                        onClick={() => handleImageClick(image.id)}
                    />
                ))}
            </div>
            {error && (
                <div style={{ color: '#ffdddd', textAlign: 'center', marginTop: 12 }}>{error}</div>
            )}
        </div>
    );
};

export default ProfileImage;