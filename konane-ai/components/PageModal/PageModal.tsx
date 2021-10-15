import React, { useEffect, useState } from "react";
import styles from "../../styles/components/PageModal/PageModal.module.scss";

interface PageModalProps {
  children: React.ReactNode;
  customStyles?: { [key: string]: string };
  closable?: boolean;
  onClose?: () => void;
}
const PageModal: React.FC<PageModalProps> = ({
  children,
  customStyles,
  closable,
  onClose,
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
      if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", keydownlistener);
    return () => {
      window.removeEventListener("keydown", keydownlistener);
    };
  }, []);

  if (!open) return null;
  return (
    <div className={styles["page-modal"]} style={customStyles}>
      {closable && (
        <button
          className={styles["page-modal-close-button"]}
          onClick={handleClose}
        >
          X
        </button>
      )}
      {children}
    </div>
  );
};

export default PageModal;
