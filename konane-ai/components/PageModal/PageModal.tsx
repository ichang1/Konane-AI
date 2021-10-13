import React from "react";
import styles from "../../styles/components/PageModal/PageModal.module.scss";

interface PageModalProps {
  children: React.ReactNode;
  customStyles?: { [key: string]: string };
}
const PageModal: React.FC<PageModalProps> = ({ children, customStyles }) => {
  return (
    <div className={styles["page-modal"]} style={customStyles}>
      {children}
    </div>
  );
};

export default PageModal;
