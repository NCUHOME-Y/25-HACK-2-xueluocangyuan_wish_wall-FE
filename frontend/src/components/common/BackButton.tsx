import { useNavigate } from 'react-router-dom';
import Button from './Button.tsx';
import backIcon from '@/assets/images/返回.svg';
import '@/styles/backButton.css'

const BackButton = () => {
    const nav = useNavigate();

    const handleCancel = () => {
        nav(-1);
    };

    return (
       <Button
       className="back-button"
       onClick={handleCancel}
       icon={backIcon}
       />
  );
};

export default BackButton;