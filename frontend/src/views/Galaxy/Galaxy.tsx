 import BackButton from "@/components/common/BackButton.tsx";
 import ProfileButton from "@/components/common/ProfileButton.tsx";
 import snowflakeImg from "@/assets/images/雪花.svg";
 import "@/styles/Galaxy.css"

function Galaxy() {
  return (
    <div className="wish-list-container">
      <div className="header">
      <BackButton />
      <h2 className="title">小雪心愿单</h2>
      <ProfileButton />
      </div>
      <div className="wish-list">
        <div className="wish-item">
        <img src={snowflakeImg} alt="雪花" />
        {/* 请雨木木替换为实际数据 */}
        <span className="wish-content">何意味何意味何意味何意味</span>
      </div>
      </div>
    </div>
  );
}

export default Galaxy;