import { useNavigate } from "react-router-dom";
import React from "react";
import BackButton from "@/components/common/BackButton.tsx";
import Button from "@/components/common/Button.tsx";
import styles from "@/styles/profile.module.css";
import profileImageOne from "@/assets/images/头像1.svg"

interface ProfileProps {
    profileImage: React.ReactNode;
    nickName: string;
}

const Profile = ({
    nickName,
}: ProfileProps) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate("/ProfileImage")
    }

    const [nickNameValue, setNickNameValue] = React.useState(nickName);

    const handleNickNameChange = (e : React.ChangeEvent<HTMLInputElement>) => {
        setNickNameValue(e.target.value);
    }

    // 确定更改并将数据同步到后端的任务就交给雨木木了

    return (
        <div className={styles.container}>
            <div className={styles["back-button-container"]}>
                <BackButton />
            </div>
            <div className={styles.profile}>
                <div className={styles.title}>修改个人信息</div>
                <div className={styles["profile-image"]}>
                    <img src={profileImageOne} alt="头像" className={styles["profile-image-one"]} />
                    <Button text="更换头像" className={styles["change-image"]} onClick={handleClick} />
                </div>
                <div className={styles["nick-name"]}>
                    <span className={styles.label}>昵称：</span>
                    <input type="text" value={nickNameValue} onChange={handleNickNameChange}/>
                </div>
            <Button
                text="确认修改"
                className={styles["confirm-button"]}
                />
            </div>
        </div>
    );
};

export default Profile;
