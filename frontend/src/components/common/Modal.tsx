import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import Button from './Button.tsx';

interface ModalProps {
    visible: boolean;
    title?: string;
    confirmText?: string;
    showCancelButton?: boolean;
    cancelText?: string;
    onCancel?: () => void;
    onConfirm?: () => void;
    onClose: () => void;
    children: React.ReactNode;
}

const Modal = ({
    visible,
    title,
    confirmText='确定',
    showCancelButton=true,
    cancelText='取消',
    onCancel,
    onConfirm,
    onClose,
    children
}: ModalProps) => {
    if (!visible) {
        return null;
    }

    // SSR兼容性
    const [mounted, setMounted] = React.useState(false);

    useEffect(() => {
        setMounted(true);
        return () => {
            setMounted(false);
        };
    }, []);

    if (!mounted) {
        return null;
    } // 防止服务器端渲染时报错

    // 确定挂载的DOM节点
    const portalRoot = document.getElementById('modal-root') || document.body;

    return ReactDOM.createPortal(
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal-header">
                    {title && (
                    <h1 className="modal-title">{title}</h1>
                    )}
                    <Button className="modal-close" onClick={onClose} icon="@/assets/images/closeButton.svg" />
                </div>
                <div className="modal-body">{children}</div>
                <div className="modal-footer">
                    {onConfirm && (
                    <Button className="modal-confirm" onClick={onConfirm} text={confirmText} />
                    )}
                    {showCancelButton && (
                    <Button className="modal-cancel" onClick={onCancel} text={cancelText} />
                        )}
                </div>
            </div>
        </div>,
        portalRoot
    );
};

export default Modal;