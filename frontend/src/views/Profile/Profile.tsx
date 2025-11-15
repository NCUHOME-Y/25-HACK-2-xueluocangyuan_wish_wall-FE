import { useNavigate } from "react-router-dom";
import React from "react";
import BackButton from "@/components/common/BackButton.tsx";
import Button from "@/components/common/Button.tsx";
import styles from "@/styles/profile.module.css";
import { useUserStore } from "@/store/userStore";
import { userService } from "@/services/userService";
import { getAvatarUrl } from "@/utils/avatar";

const Profile: React.FC = () => {
    const navigate = useNavigate();
    const user = useUserStore((s) => s.user);
    const setUser = useUserStore((s) => s.setUser);

    const [nickNameValue, setNickNameValue] = React.useState<string>(user?.nickname || "");
    const [saving, setSaving] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [success, setSuccess] = React.useState<string | null>(null);

    React.useEffect(() => {
        // 当 store 中用户变化时，同步昵称输入框
        setNickNameValue(user?.nickname || "");
    }, [user?.nickname]);

    const handleClick = () => {
        navigate("/profileImage"); // 路由为小写，匹配 router 配置
    };

    const handleNickNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNickNameValue(e.target.value);
    };

    const handleSubmit = async () => {
        if (saving) return;
        const newName = nickNameValue.trim();
        if (!newName) {
            setError("昵称不能为空");
            setSuccess(null);
            return;
        }
        if (newName === user?.nickname) {
            setSuccess("昵称未变化");
            setError(null);
            return;
        }
        setSaving(true);
        setError(null);
        setSuccess(null);
        try {
            const updated = await userService.updateUserProfile({ nickname: newName });
            setUser(updated as any);
            setSuccess("已保存");
        } catch (err: any) {
            setError(err?.msg || err?.message || "保存失败");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles["back-button-container"]}>
                <BackButton />
            </div>
            <div className={styles.profile}>
                <div className={styles.title}>修改个人信息</div>
                <div className={styles["profile-image"]}>
                    <img
                        src={getAvatarUrl(user?.avatar_id || 0)}
                        alt="头像"
                        className={styles["profile-image-one"]}
                    />
                    <Button text="更换头像" className={styles["change-image"]} onClick={handleClick} />
                </div>
                <div className={styles["nick-name"]}>
                    <span className={styles.label}>昵称：</span>
                    <input type="text" value={nickNameValue} onChange={handleNickNameChange} disabled={saving} />
                </div>
                <Button
                    text={saving ? "保存中..." : "确认修改"}
                    className={styles["confirm-button"]}
                    onClick={handleSubmit}
                    disabled={saving}
                />
                {error && <div className={styles["error-message"]}>{error}</div>}
                {success && <div className={styles["success-message"]}>{success}</div>}
            </div>
        </div>
    );
};

export default Profile;
