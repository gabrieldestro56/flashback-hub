'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';
import notificationManager from '@/frontend/utils/NotificationManager';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(notificationManager.getNotifications());

  useEffect(() => {
    const handleAdd = (notification) => {
      setNotifications([...notificationManager.getNotifications()]);
    };

    const handleRemove = (id) => {
      setNotifications([...notificationManager.getNotifications()]);
    };

    // Listen to events
    notificationManager.on('add', handleAdd);
    notificationManager.on('remove', handleRemove);

    // Cleanup listeners on unmount
    return () => {
      notificationManager.off('add', handleAdd);
      notificationManager.off('remove', handleRemove);
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, notificationManager }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  return useContext(NotificationContext);
};
