import React from "react";
import styles from "../../styles/components/LoadingIndicator/LoadingIndicator.module.scss";

interface LoadingIndicatorProps {
  className?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ className }) => {
  return (
    <div
      className={`${styles["lds-spinner"]} ${
        className ? className : ""
      }`.trim()}
    >
      {[...Array(12)].map((_, idx) => (
        <div key={idx}></div>
      ))}
    </div>
  );
};

export default LoadingIndicator;
