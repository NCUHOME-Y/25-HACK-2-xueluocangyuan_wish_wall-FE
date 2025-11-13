import { useNavigate } from 'react-router-dom';
import Button from './Button.tsx';

const ProfileButton = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/profile');
  };

  return (
    <Button 
      onClick={handleClick}
      className="profile-button"
      icon="@/assets/images/个人.svg" 
    />
  );
};

export default ProfileButton;