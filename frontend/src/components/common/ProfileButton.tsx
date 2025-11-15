import { useNavigate } from 'react-router-dom';
import Button from './Button.tsx';
import profileIcon from '@/assets/images/个人.svg';

const ProfileButton = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/profile');
  };

  return (
    <Button 
      onClick={handleClick}
      className="profile-button"
      icon={profileIcon}
    />
  );
};

export default ProfileButton;