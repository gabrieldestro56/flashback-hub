'use client'

import { EventEmitter } from 'events';

class NotificationManager extends EventEmitter {
  constructor() {
    super();
    this.notifications = []; // Store notifications
  }

  // Add a new notification
  addNotification(notification) {
    const newNotification = { id: Date.now(), ...notification };
    this.notifications.push(newNotification);
    this.emit('add', newNotification); // Trigger an 'add' event
  
    setTimeout(() => {
      this.removeNotification(newNotification.id);
    }, notification.duration || 3000);
  
    return newNotification;
  }

  // Remove a notification by ID
  removeNotification(id) {
    this.notifications = this.notifications.filter((n) => n.id !== id);
    this.emit('remove', id); // Trigger a 'remove' event
  }

  // Get all notifications
  getNotifications() {
    return this.notifications;
  }
}

const notificationManager = new NotificationManager();
export default notificationManager;
