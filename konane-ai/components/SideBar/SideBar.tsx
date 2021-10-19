import React from "react";
import styles from "../../styles/components/SideBar/SideBar.module.scss";
interface SideBarProps {
  className?: string;
  children: React.ReactNode;
}

const SideBar: React.FC<SideBarProps> = ({ className, children }) => {
  return (
    <div
      className={`${styles["sidebar"]} ${className ? className : ""}`.trim()}
    >
      {children}
    </div>
  );
};

export default SideBar;
