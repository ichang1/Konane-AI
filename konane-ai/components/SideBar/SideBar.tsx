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
      <div>
        <button className={styles["sidebar-button"]}>
          <a href={"/"} className={styles["sidebar-button-home-link"]}>
            Home
          </a>
        </button>
        <button className={styles["sidebar-button"]}>
          <a href={"/"} className={styles["sidebar-button-about-link"]}>
            About
          </a>
        </button>
      </div>
      {children}
    </div>
  );
};

export default SideBar;
