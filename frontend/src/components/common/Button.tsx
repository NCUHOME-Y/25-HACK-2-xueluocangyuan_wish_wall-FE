import React from 'react';

// 继承原生button属性并添加icon, text属性
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode | string;
  text?: string;
}

const Button = ({
    text, 
    icon,
    className,
    ...rest
}: ButtonProps) => {
    const isIconOnly = !text && !!icon;// 判断是否为纯图标按钮

    const iconContent = typeof icon === 'string' 
        ? <img src={icon} alt="icon" className="icon-image" />
         : icon;

    return (
        <button
        {...rest}
        className={`button ${className} ${isIconOnly ? `icon-only` : `` }`.trim()}
        >
            {icon && (
                <span className="icon">
                    {iconContent}
                    </span>)}
            {text && (<span className="text">{text}</span>)}
        </button>
    );
};

export default Button;