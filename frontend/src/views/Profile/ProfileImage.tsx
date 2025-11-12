import profileImageOne from "@/assets/images/头像1.svg";
import profileImageTwo from "@/assets/images/头像2.svg";
import profileImageThree from "@/assets/images/头像3.svg";
import profileImageFour from "@/assets/images/头像4.svg";
import profileImageFive from "@/assets/images/头像5.svg";
import profileImageSix from "@/assets/images/头像6.svg";
import BackButton from "@/components/common/BackButton";
import styles from "@/styles/profileImage.module.css"

function ProfileImage() {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles["back-button-container"]}>
                <BackButton />
                </div>
                <h1 className={styles.title}>选择头像</h1>
            </div>
            <div className={styles.images}>
                <img src={profileImageOne} alt="头像1" className={styles.image} />
                <img src={profileImageTwo} alt="头像2" className={styles.image} />
                <img src={profileImageThree} alt="头像3" className={styles.image} />
                <img src={profileImageFour} alt="头像4" className={styles.image} />
                <img src={profileImageFive} alt="头像5" className={styles.image} />
                <img src={profileImageSix} alt="头像6" className={styles.image} />
            </div>
        </div>
    );
};

export default ProfileImage;