import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import BackButton from "@/components/common/BackButton.tsx";
import Button from "@/components/common/Button.tsx";
import styles from "@/styles/profile.module.css";
import { useUserStore } from '@/store/userStore';
import { userService } from '@/services/userService';
import { getAvatarUrl } from '@/utils/avatar';

const Profile: React.FC = () => {
    const navigate = useNavigate();
    const user = useUserStore(s => s.user);
    const setUser = useUserStore(s => s.setUser);
    const [nickname, setNickname] = useState<string>(user?.nickname || '');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleGoAvatar = () => navigate('/profileImage');

    const canSubmit = !!user && nickname.trim() && nickname.trim() !== user.nickname && !saving;

    const handleSubmit = async () => {
        if (!canSubmit) return;
        setSaving(true);
        setError(null);
        setSuccess(false);
        try {
            const updated = await userService.updateUserProfile({ nickname: nickname.trim() });
            setUser(updated);
            setSuccess(true);
        } catch (e: any) {
            setError(e?.msg || e?.message || '更新昵称失败');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles['back-button-container']}>
                <BackButton />
            </div>
            <div className={styles.profile}>
                <div className={styles.title}>修改个人信息</div>
                <div className={styles['profile-image']}>
                    <img
                        src={getAvatarUrl(user?.avatar_id || 1)}
                        alt="头像"
                        className={styles['profile-image-one']}
                    />
                    <Button
                        text="更换头像"
                        className={styles['change-image']}
                        onClick={handleGoAvatar}
                        type="button"
                    />
                </div>
                <div className={styles['nick-name']}>
                    <span className={styles.label}>昵称：</span>
                    <input
                        type="text"
                        value={nickname}
                        onChange={e => setNickname(e.target.value)}
                        disabled={saving}
                    />
                </div>
                {error && <div style={{ color: '#ffdddd', marginTop: 8 }}>{error}</div>}
                {success && <div style={{ color: '#c8f7c5', marginTop: 8 }}>已保存</div>}
                <Button
                    text={saving ? '保存中...' : '确认修改'}
                    className={styles['confirm-button']}
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    type="button"
                />
            </div>
        </div>
    );
};

export default Profile;
