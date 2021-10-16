import React, { useEffect, useState } from "react";
import styles from "../../styles/components/Modal/Modal.module.scss";

interface ModalProps {
  children: React.ReactNode;
  customStyles?: { [key: string]: string };
  closable?: boolean;
  onClose?: () => void;
  full?: boolean;
}
const PageModal: React.FC<ModalProps> = ({
  children,
  customStyles,
  closable,
  onClose,
  full,
}) => {
  const [open, setOpen] = useState(true);
  const handleClose = () => {
    setOpen(false);
    if (onClose) onClose();
  };

  /**
   * can click escape to close the window if closable by default
   */
  useEffect(() => {
    if (!close) return;
    const keydownlistener = (e: KeyboardEvent) => {
      if (e.key === "Escape" && closable) {
        handleClose();
      }
    };
    window.addEventListener("keydown", keydownlistener);
    return () => {
      if (onClose) onClose();
      window.removeEventListener("keydown", keydownlistener);
    };
  }, []);

  if (!open) return null;
  if (full) {
    return (
      <div className={styles["modal-full-page"]} style={customStyles}>
        {closable && (
          <button
            className={styles["modal-close-button"]}
            onClick={handleClose}
          >
            X
          </button>
        )}
        {children}
      </div>
    );
  }
  // is open and not full page
  return (
    <div className={styles["modal"]} style={customStyles}>
      {closable && (
        <button className={styles["modal-close-button"]} onClick={handleClose}>
          X
        </button>
      )}
      {children}
    </div>
  );
};

export default PageModal;
