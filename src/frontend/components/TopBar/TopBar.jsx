import React from 'react';
import Image from 'next/image';
import styles from './TopBar.module.css';

export const TopBar = ({ title, logo }) => {
  return (
    <div className={styles.container}>
      {logo && (
        <div className={styles.logoContainer}>
          <img src={logo} alt="Logo" className={styles.logo}></img>
        </div>
      )}
      <div className={styles.title}>{title}</div>
    </div>
  );
};
