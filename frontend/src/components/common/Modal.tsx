import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import Button from './Button.tsx';

interface ModalProps {
    visible: boolean;
    style?: React.CSSProperties;
    title?: string;
    confirmText?: string;
    className?: string;
    showCancelButton?: boolean;
    cancelText?: string;
    onCancel?: () => void;
    onConfirm?: () => void;
    onClose?: () => void; // 新增：支持外层关闭
    children: React.ReactNode;
}

const Modal = ({
  visible,
  title,
  confirmText = '确定',
  onConfirm,
  onCancel,
  onClose,
  showCancelButton,
  cancelText = '取消',
  children,
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
        <div className="modal-overlay" onClick={() => onClose?.()}>
            <div
                className={`modal ${title ? 'has-title' : ''}`}
                onClick={(e) => e.stopPropagation()}
                style={{ position: 'relative' }}
            >
                <div className="modal-header">
                    {title && <h1 className="modal-title">{title}</h1>}
                    {onClose && (
                        <button
                            type="button"
                            className="modal-close-button"
                            onClick={onClose}
                        >×</button>
                    )}
                </div>
                <div className="modal-body">{children}</div>
                <div className="modal-footer">
                    {showCancelButton && onCancel && (
                        <Button className="modal-cancel" onClick={onCancel} text={cancelText} />
                    )}
                    {onConfirm && (
                        <Button className="modal-confirm" onClick={onConfirm} text={confirmText} />
                    )}
                </div>
            </div>
        </div>,
        portalRoot
    );
};

export default Modal;