import React from "react";
import { konaneDifficulties } from "../../konane/KonaneGameUtils";
import styles from "../../styles/components/SideBar/SideBar.module.scss";
interface SideBarProps {
  navigation: boolean;
  className?: string;
  children?: React.ReactNode;
  left?: boolean;
  right?: boolean;
}

const sidebarContent = (
  <>
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
    <div className={styles["sidebar-difficulty-buttons-container"]}>
      {Object.keys(konaneDifficulties).map((diff, idx) => (
        <button
          data-level={idx}
          className={styles["sidebar-difficulty-button"]}
          key={idx}
        >
          <a
            key={idx}
            href={`/${diff}`}
            className={styles["sidebar-difficulty-button-link"]}
          >
            {diff.toUpperCase()}
          </a>
        </button>
      ))}
    </div>
  </>
);

const SideBar: React.FC<SideBarProps> = ({
  className,
  children,
  left,
  right,
  navigation,
}) => {
  if (left || (!left && !right)) {
    return (
      <div
        className={`${styles["left-sidebar"]} ${
          className ? className : ""
        }`.trim()}
      >
        {navigation && sidebarContent}
        {children}
      </div>
    );
  } else {
    return (
      <div
        className={`${styles["right-sidebar"]} ${
          className ? className : ""
        }`.trim()}
      >
        {navigation && sidebarContent}
        {children}
      </div>
    );
  }
};

export default SideBar;
