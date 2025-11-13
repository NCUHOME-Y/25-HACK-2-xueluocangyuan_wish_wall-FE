import { useNavigate } from 'react-router-dom';
import Button from './Button.tsx';

const ProfileButton = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/Profile');
  };

  return (
    <Button 
      onClick={handleClick}
      className="profile-button"
      icon="" 
    />
  );
};

export default ProfileButton;