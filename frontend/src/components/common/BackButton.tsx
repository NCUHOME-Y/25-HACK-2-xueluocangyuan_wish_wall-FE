import { useNavigate } from 'react-router-dom';
import Button from './Button.tsx';

const BackButton = () => {
    const nav = useNavigate();

    const handleCancel = () => {
        nav(-1);
    };

    return (
       <Button
       className="back-button"
       onClick={handleCancel}
       icon="../assets/images/返回.svg"
       />
  );
};

export default BackButton;