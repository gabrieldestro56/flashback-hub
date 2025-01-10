'use client';

import React, { useState } from 'react';
import { useNotification } from '../context/NotificationContext';
import styles from './NotificationList.module.css'; // Import the CSS module

export const NotificationList = () => {
  const { notifications, notificationManager } = useNotification();
  const [hiddenNotifications, setHiddenNotifications] = useState([]);

  const handleRemove = (id) => {
    setHiddenNotifications((prev) => [...prev, id]);
    setTimeout(() => {
      notificationManager.removeNotification(id);
    }, 500); // Match this with the CSS transition duration
  };

  return (
    <div className={styles.container}>
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`${styles.notification} ${
            hiddenNotifications.includes(notification.id) ? styles.hidden : ''
          } ${styles[notification.type] || ""}`}
        >
          <div>{notification.message}</div>
        </div>
      ))}
    </div>
  );
};
