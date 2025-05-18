import { ReactNode } from "react";
import styles from './modal.module.css';

export default function Modal({ isOpen, onClose, children }: {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <div className={styles.modal_backdrop} onClick={onClose}>
      <div className={styles.modal_content} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
