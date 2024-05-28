import { ReactNode, useState } from 'react';
import './button.scss';

interface ButtonProps {
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
}

export const Button = ({
  disabled,
  onClick,
  children
}: ButtonProps) => {
  const [active, setActive] = useState(false)

  const handleButtonClick = () => {
    if (onClick) {
      onClick();
    }

    setActive(true);
    setTimeout(() => {
      setActive(false);
    }, 50);
  };

  return (
    <div className='button__container'>
      <button
        disabled={disabled}
        type="button"
        className={`button ${active ? 'active' : ''}`}
        onClick={handleButtonClick}
      >
        {children}
      </button>
    </div>
  );
};
